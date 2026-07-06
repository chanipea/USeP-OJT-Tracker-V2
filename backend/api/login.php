<?php
// =========================================================
// backend/api/login.php
// Verifies email + password and issues a fresh auth token.
//
//   POST /backend/api/login.php
//   body: { "email": "...", "password": "..." }
//
// Returns { token, user, profile } on success.
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
$data = read_json_body();

$email    = trim($data['email'] ?? '');
$password = (string) ($data['password'] ?? '');

if ($email === '' || $password === '') {
    http_response_code(422);
    echo json_encode(['error' => 'Please enter both email and password.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, username, email, password_hash FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Incorrect email or password.']);
    exit;
}

// Issue a fresh token every login (invalidates any previous one).
$token = generate_auth_token();
$stmt = $pdo->prepare('UPDATE users SET auth_token = ? WHERE id = ?');
$stmt->execute([$token, $user['id']]);

// Fetch (or lazily create) their profile row.
$stmt = $pdo->prepare('SELECT * FROM profile WHERE user_id = ?');
$stmt->execute([$user['id']]);
$profileRow = $stmt->fetch();

if (!$profileRow) {
    $pdo->prepare('INSERT INTO profile (user_id, email, target_hours) VALUES (?, ?, 0)')
        ->execute([$user['id'], $user['email']]);
    $stmt->execute([$user['id']]);
    $profileRow = $stmt->fetch();
}

echo json_encode([
    'token' => $token,
    'user'  => ['id' => (int) $user['id'], 'username' => $user['username'], 'email' => $user['email']],
    'profile' => [
        'name'           => $profileRow['name'],
        'studentId'      => $profileRow['student_id'],
        'program'        => $profileRow['program'],
        'company'        => $profileRow['company'],
        'supervisor'     => $profileRow['supervisor'],
        'targetHours'    => (int) $profileRow['target_hours'],
        'bio'            => $profileRow['bio'],
        'email'          => $profileRow['email'],
        'phone'          => $profileRow['phone'],
        'profilePicture' => $profileRow['profile_picture'],
        'coverPhoto'     => $profileRow['cover_photo'],
    ],
]);
