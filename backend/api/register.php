<?php
// =========================================================
// backend/api/register.php
// Creates a new account.
//
//   POST /backend/api/register.php
//   body: { "email": "...", "password": "...", "confirmPassword": "..." }
//
// On success, creates the user, creates an empty profile row
// for them (targetHours = 0), logs them in immediately (issues
// a token), and returns { token, user, profile }.
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

$username = trim($data['username'] ?? '');
$email    = trim($data['email'] ?? '');
$password = (string) ($data['password'] ?? '');

// ----- Validation -----
$errors = [];
if ($username === '' || strlen($username) < 3) {
    $errors[] = 'Username must be at least 3 characters long.';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}
if (strlen($password) < 6) {
    $errors[] = 'Password must be at least 6 characters long.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['error' => implode(' ', $errors)]);
    exit;
}

// ----- Check for existing account -----
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? OR username = ?');
$stmt->execute([$email, $username]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'An account with that email or username already exists.']);
    exit;
}

// ----- Create the account -----
$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$token        = generate_auth_token();

$pdo->beginTransaction();
try {
    $stmt = $pdo->prepare(
        'INSERT INTO users (username, email, password_hash, auth_token) VALUES (:username, :email, :password_hash, :token)'
    );
    $stmt->execute([
        ':username'      => $username,
        ':email'         => $email,
        ':password_hash' => $passwordHash,
        ':token'         => $token,
    ]);

    $userId = (int) $pdo->lastInsertId();

    // Every new account starts with an empty profile, except the name
    // and email, which are pre-filled from what they entered at signup.
    // targetHours is 0 by design - the student sets their own goal later.
    $stmt = $pdo->prepare(
        'INSERT INTO profile (user_id, name, email, target_hours) VALUES (:user_id, :name, :email, 0)'
    );
    $stmt->execute([':user_id' => $userId, ':name' => $username, ':email' => $email]);

    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Could not create account. Please try again.']);
    exit;
}

http_response_code(201);
echo json_encode([
    'token' => $token,
    'user'  => ['id' => $userId, 'username' => $username, 'email' => $email],
    'profile' => [
        'name' => $username, 'studentId' => '', 'program' => '', 'company' => '',
        'supervisor' => '', 'targetHours' => 0, 'bio' => '', 'email' => $email,
        'phone' => '', 'profilePicture' => null, 'coverPhoto' => null,
    ],
]);