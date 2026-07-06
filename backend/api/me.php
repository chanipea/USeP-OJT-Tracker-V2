<?php
// =========================================================
// backend/api/me.php
// Returns the currently authenticated user's id + email.
// Used by the frontend on page load to restore a saved
// session (it has a token in localStorage, but needs to
// confirm it's still valid and find out who it belongs to).
//
//   GET /backend/api/me.php   (Authorization: Bearer <token>)
// =========================================================

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../auth.php';
send_json_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

$pdo  = get_db_connection();
$user = require_auth($pdo); // exits with 401 if not logged in

echo json_encode(['id' => (int) $user['id'], 'username' => $user['username'], 'email' => $user['email']]);
