<?php
// =========================================================
// backend/auth.php
// Shared helpers for the token-based login system.
//
// How it works: when a user logs in (or signs up), the
// server generates a random token and saves it on their
// `users` row. The frontend stores that token and sends it
// back on every request in an "Authorization: Bearer <token>"
// header. require_auth() below reads that header, looks up
// the matching user, and returns their id - or stops the
// request with a 401 if the token is missing/invalid.
//
// This is simpler than PHP sessions/cookies here because the
// React dev server (port 5173) and PHP (port 80) are
// different origins, which makes cookie-based sessions need
// extra CORS/cookie configuration. A bearer token works the
// same way regardless of origin.
// =========================================================

require_once __DIR__ . '/db.php';

function generate_auth_token(): string {
    return bin2hex(random_bytes(32)); // 64 hex characters
}

// Reads the Authorization header across different server setups
// (some Apache/PHP configs don't populate $_SERVER['HTTP_AUTHORIZATION']
// by default, so we check a couple of fallbacks).
function get_bearer_token(): ?string {
    $header = null;

    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $header = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $header = $headers['Authorization'];
        }
    }

    if ($header && preg_match('/Bearer\s+(\S+)/i', $header, $matches)) {
        return $matches[1];
    }

    return null;
}

// Looks up the user for the current request's token.
// On success: returns the user's row as an associative array.
// On failure: sends a 401 JSON response and exits the script.
function require_auth(PDO $pdo): array {
    $token = get_bearer_token();

    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated. Please log in.']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT id, username, email FROM users WHERE auth_token = ?');
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Your session has expired. Please log in again.']);
        exit;
    }

    return $user;
}
