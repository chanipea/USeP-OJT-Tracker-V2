<?php
// =========================================================
// backend/api/logs.php
// REST endpoint for the logged-in user's ojt_logs rows.
// Every request must include "Authorization: Bearer <token>".
//
//   GET    /backend/api/logs.php          -> list this user's logs
//   POST   /backend/api/logs.php          -> create a log for this user
//   PUT    /backend/api/logs.php?id=5     -> update this user's log #5
//   DELETE /backend/api/logs.php?id=5     -> delete this user's log #5
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
        handle_get_logs($pdo, $userId);
        break;
    case 'POST':
        handle_create_log($pdo, $userId);
        break;
    case 'PUT':
        handle_update_log($pdo, $userId);
        break;
    case 'DELETE':
        handle_delete_log($pdo, $userId);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed.']);
}

// ---------------------------------------------------------
// GET: return every log belonging to this user
// ---------------------------------------------------------
function handle_get_logs(PDO $pdo, int $userId): void {
    $stmt = $pdo->prepare(
        'SELECT id, log_date, start_time, end_time, hours, tasks, diary,
                moods, categories, created_at
         FROM ojt_logs
         WHERE user_id = :user_id
         ORDER BY log_date DESC, id DESC'
    );
    $stmt->execute([':user_id' => $userId]);
    $rows = $stmt->fetchAll();

    echo json_encode(array_map('format_log_row', $rows));
}

// ---------------------------------------------------------
// POST: insert a new log entry for this user
// ---------------------------------------------------------
function handle_create_log(PDO $pdo, int $userId): void {
    $data = read_json_body();

    $errors = validate_log_payload($data);
    if (!empty($errors)) {
        http_response_code(422);
        echo json_encode(['error' => 'Validation failed.', 'fields' => $errors]);
        return;
    }

    $hours = calculate_duration_hours($data['startTime'], $data['endTime']);

    $stmt = $pdo->prepare(
        'INSERT INTO ojt_logs (user_id, log_date, start_time, end_time, hours, tasks, diary, moods, categories)
         VALUES (:user_id, :log_date, :start_time, :end_time, :hours, :tasks, :diary, :moods, :categories)'
    );

    $stmt->execute([
        ':user_id'    => $userId,
        ':log_date'   => $data['date'],
        ':start_time' => $data['startTime'],
        ':end_time'   => $data['endTime'],
        ':hours'      => $hours,
        ':tasks'      => $data['tasks'],
        ':diary'      => $data['diary'],
        ':moods'      => json_encode($data['moods']),
        ':categories' => json_encode($data['categories']),
    ]);

    $newId = $pdo->lastInsertId();

    $row = $pdo->prepare('SELECT * FROM ojt_logs WHERE id = ? AND user_id = ?');
    $row->execute([$newId, $userId]);

    http_response_code(201);
    echo json_encode(format_log_row($row->fetch()));
}

// ---------------------------------------------------------
// PUT: update an existing log entry (only if it belongs to this user)
// ---------------------------------------------------------
function handle_update_log(PDO $pdo, int $userId): void {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id parameter.']);
        return;
    }

    $data = read_json_body();
    $errors = validate_log_payload($data);
    if (!empty($errors)) {
        http_response_code(422);
        echo json_encode(['error' => 'Validation failed.', 'fields' => $errors]);
        return;
    }

    $hours = calculate_duration_hours($data['startTime'], $data['endTime']);

    $stmt = $pdo->prepare(
        'UPDATE ojt_logs
         SET log_date = :log_date, start_time = :start_time, end_time = :end_time,
             hours = :hours, tasks = :tasks, diary = :diary,
             moods = :moods, categories = :categories
         WHERE id = :id AND user_id = :user_id'
    );

    $stmt->execute([
        ':log_date'   => $data['date'],
        ':start_time' => $data['startTime'],
        ':end_time'   => $data['endTime'],
        ':hours'      => $hours,
        ':tasks'      => $data['tasks'],
        ':diary'      => $data['diary'],
        ':moods'      => json_encode($data['moods']),
        ':categories' => json_encode($data['categories']),
        ':id'         => $id,
        ':user_id'    => $userId,
    ]);

    $row = $pdo->prepare('SELECT * FROM ojt_logs WHERE id = ? AND user_id = ?');
    $row->execute([$id, $userId]);
    $result = $row->fetch();

    if (!$result) {
        http_response_code(404);
        echo json_encode(['error' => 'Log not found.']);
        return;
    }

    echo json_encode(format_log_row($result));
}

// ---------------------------------------------------------
// DELETE: remove a log entry (only if it belongs to this user)
// ---------------------------------------------------------
function handle_delete_log(PDO $pdo, int $userId): void {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id parameter.']);
        return;
    }

    $stmt = $pdo->prepare('DELETE FROM ojt_logs WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $userId]);

    echo json_encode(['success' => true, 'deleted_id' => (int) $id]);
}

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------
function validate_log_payload(array $data): array {
    $errors = [];
    if (empty($data['date']))       $errors[] = 'date is required';
    if (empty($data['startTime']))  $errors[] = 'startTime is required';
    if (empty($data['endTime']))    $errors[] = 'endTime is required';
    if (empty(trim($data['tasks'] ?? '')))  $errors[] = 'tasks is required';
    if (empty(trim($data['diary'] ?? '')))  $errors[] = 'diary is required';
    if (empty($data['moods']))      $errors[] = 'at least one mood is required';
    if (empty($data['categories'])) $errors[] = 'at least one category is required';
    return $errors;
}

// Mirrors the frontend's calculateDuration() function.
function calculate_duration_hours(string $startTime, string $endTime): float {
    [$startHour, $startMin] = array_map('intval', explode(':', $startTime));
    [$endHour, $endMin]     = array_map('intval', explode(':', $endTime));

    $startInMinutes = $startHour * 60 + $startMin;
    $endInMinutes   = $endHour * 60 + $endMin;

    if ($endInMinutes < $startInMinutes) {
        $endInMinutes += 24 * 60;
    }

    return round(($endInMinutes - $startInMinutes) / 60, 2);
}

// Converts a raw DB row into the shape the frontend expects.
function format_log_row(array $row): array {
    return [
        'id'         => (int) $row['id'],
        'date'       => $row['log_date'],
        'startTime'  => substr($row['start_time'], 0, 5),
        'endTime'    => substr($row['end_time'], 0, 5),
        'hours'      => (float) $row['hours'],
        'tasks'      => $row['tasks'],
        'diary'      => $row['diary'],
        'moods'      => json_decode($row['moods'] ?? '[]', true) ?: [],
        'categories' => json_decode($row['categories'] ?? '[]', true) ?: [],
        'createdAt'  => $row['created_at'],
    ];
}
