<?php
// =========================================================
// backend/api/logout.php
// Invalidates the current auth token server-side.
//
//   POST /backend/api/logout.php   (Authorization: Bearer <token>)
// =========================================================

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../auth.php';
send_json_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

$pdo  = get_db_connection();
$user = require_auth($pdo); // will exit with 401 if not logged in

$stmt = $pdo->prepare('UPDATE users SET auth_token = NULL WHERE id = ?');
$stmt->execute([$user['id']]);

echo json_encode(['success' => true]);
