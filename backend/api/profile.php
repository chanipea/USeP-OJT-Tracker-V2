<?php
// =========================================================
// backend/api/profile.php
// REST endpoint for the logged-in user's profile row.
// Every request must include "Authorization: Bearer <token>".
//
//   GET   /backend/api/profile.php  -> fetch the current user's profile
//   POST  /backend/api/profile.php  -> save/update the current user's profile
// =========================================================

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../auth.php';
send_json_headers();

$pdo    = get_db_connection();
$user   = require_auth($pdo); // exits with 401 if not logged in
$userId = $user['id'];
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handle_get_profile($pdo, $userId);
        break;
    case 'POST':
    case 'PUT':
        handle_save_profile($pdo, $userId);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed.']);
}

function handle_get_profile(PDO $pdo, int $userId): void {
    $stmt = $pdo->prepare('SELECT * FROM profile WHERE user_id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();

    if (!$row) {
        // Should not normally happen (register.php always creates one),
        // but create it on the fly just in case.
        $pdo->prepare('INSERT INTO profile (user_id, target_hours) VALUES (?, 0)')->execute([$userId]);
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
    }

    echo json_encode(format_profile_row($row));
}

function handle_save_profile(PDO $pdo, int $userId): void {
    $data = read_json_body();

    $stmt = $pdo->prepare(
        'UPDATE profile SET
            name = :name,
            student_id = :student_id,
            program = :program,
            company = :company,
            supervisor = :supervisor,
            target_hours = :target_hours,
            bio = :bio,
            email = :email,
            phone = :phone,
            profile_picture = :profile_picture,
            cover_photo = :cover_photo
         WHERE user_id = :user_id'
    );

    $stmt->execute([
        ':name'            => $data['name'] ?? '',
        ':student_id'      => $data['studentId'] ?? '',
        ':program'         => $data['program'] ?? '',
        ':company'         => $data['company'] ?? '',
        ':supervisor'      => $data['supervisor'] ?? '',
        ':target_hours'    => (int) ($data['targetHours'] ?? 0),
        ':bio'             => $data['bio'] ?? '',
        ':email'           => $data['email'] ?? '',
        ':phone'           => $data['phone'] ?? '',
        ':profile_picture' => $data['profilePicture'] ?? null,
        ':cover_photo'     => $data['coverPhoto'] ?? null,
        ':user_id'         => $userId,
    ]);

    $stmt = $pdo->prepare('SELECT * FROM profile WHERE user_id = ?');
    $stmt->execute([$userId]);
    echo json_encode(format_profile_row($stmt->fetch()));
}

function format_profile_row(array $row): array {
    return [
        'name'           => $row['name'],
        'studentId'      => $row['student_id'],
        'program'        => $row['program'],
        'company'        => $row['company'],
        'supervisor'     => $row['supervisor'],
        'targetHours'    => (int) $row['target_hours'],
        'bio'            => $row['bio'],
        'email'          => $row['email'],
        'phone'          => $row['phone'],
        'profilePicture' => $row['profile_picture'],
        'coverPhoto'     => $row['cover_photo'],
    ];
}
