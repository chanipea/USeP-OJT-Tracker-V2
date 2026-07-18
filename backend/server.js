const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;
const DEFAULT_USER_ID = 1;

// Initialize a default user if none exists
const defaultUser = db.prepare('SELECT id FROM users WHERE id = ?').get(DEFAULT_USER_ID);
if (!defaultUser) {
  // Insert default user
  db.prepare('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)').run(DEFAULT_USER_ID, 'Default User', 'user@example.com', 'none');
  // Insert default profile
  db.prepare('INSERT INTO profile (user_id, email, target_hours) VALUES (?, ?, 0)').run(DEFAULT_USER_ID, 'user@example.com');
  console.log('Default user initialized.');
}

// ----- PROFILE ENDPOINTS -----

app.get('/api/profile', (req, res) => {
  let profileRow = db.prepare('SELECT * FROM profile WHERE user_id = ?').get(DEFAULT_USER_ID);
  
  if (!profileRow) {
    db.prepare('INSERT INTO profile (user_id, email, target_hours) VALUES (?, ?, 0)').run(DEFAULT_USER_ID, 'user@example.com');
    profileRow = db.prepare('SELECT * FROM profile WHERE user_id = ?').get(DEFAULT_USER_ID);
  }

  res.json({
    name: profileRow.name,
    studentId: profileRow.student_id,
    program: profileRow.program,
    company: profileRow.company,
    supervisor: profileRow.supervisor,
    targetHours: profileRow.target_hours,
    bio: profileRow.bio,
    email: profileRow.email,
    phone: profileRow.phone,
    profilePicture: profileRow.profile_picture,
    coverPhoto: profileRow.cover_photo,
  });
});

app.post('/api/profile', (req, res) => {
  const { name, studentId, program, company, supervisor, targetHours, bio, email, phone, profilePicture, coverPhoto } = req.body;
  
  db.prepare(`
    UPDATE profile SET 
      name = ?, student_id = ?, program = ?, company = ?, supervisor = ?, 
      target_hours = ?, bio = ?, email = ?, phone = ?, profile_picture = ?, cover_photo = ?
    WHERE user_id = ?
  `).run(
    name, studentId, program, company, supervisor, targetHours, bio, email, phone, profilePicture, coverPhoto, DEFAULT_USER_ID
  );

  const profileRow = db.prepare('SELECT * FROM profile WHERE user_id = ?').get(DEFAULT_USER_ID);
  res.json({
    name: profileRow.name,
    studentId: profileRow.student_id,
    program: profileRow.program,
    company: profileRow.company,
    supervisor: profileRow.supervisor,
    targetHours: profileRow.target_hours,
    bio: profileRow.bio,
    email: profileRow.email,
    phone: profileRow.phone,
    profilePicture: profileRow.profile_picture,
    coverPhoto: profileRow.cover_photo,
  });
});

// ----- LOGS ENDPOINTS -----

app.get('/api/logs', (req, res) => {
  const logs = db.prepare('SELECT id, date, start_time as startTime, end_time as endTime, task_description as taskDescription, hours FROM logs WHERE user_id = ? ORDER BY date DESC, id DESC').all(DEFAULT_USER_ID);
  res.json(logs);
});

app.post('/api/logs', (req, res) => {
  const { date, startTime, endTime, taskDescription, hours } = req.body;
  const info = db.prepare('INSERT INTO logs (user_id, date, start_time, end_time, task_description, hours) VALUES (?, ?, ?, ?, ?, ?)')
    .run(DEFAULT_USER_ID, date, startTime, endTime, taskDescription, hours);
  
  const newLog = db.prepare('SELECT id, date, start_time as startTime, end_time as endTime, task_description as taskDescription, hours FROM logs WHERE id = ?').get(info.lastInsertRowid);
  res.json(newLog);
});

app.put('/api/logs', (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Missing log ID.' });

  const log = db.prepare('SELECT user_id FROM logs WHERE id = ?').get(id);
  if (!log || log.user_id !== DEFAULT_USER_ID) {
    return res.status(404).json({ error: 'Log not found or access denied.' });
  }

  const { date, startTime, endTime, taskDescription, hours } = req.body;
  db.prepare('UPDATE logs SET date = ?, start_time = ?, end_time = ?, task_description = ?, hours = ? WHERE id = ?')
    .run(date, startTime, endTime, taskDescription, hours, id);

  const updatedLog = db.prepare('SELECT id, date, start_time as startTime, end_time as endTime, task_description as taskDescription, hours FROM logs WHERE id = ?').get(id);
  res.json(updatedLog);
});

app.delete('/api/logs', (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Missing log ID.' });

  const log = db.prepare('SELECT user_id FROM logs WHERE id = ?').get(id);
  if (!log || log.user_id !== DEFAULT_USER_ID) {
    return res.status(404).json({ error: 'Log not found or access denied.' });
  }

  db.prepare('DELETE FROM logs WHERE id = ?').run(id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
