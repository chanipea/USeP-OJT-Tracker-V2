const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

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
    theme: profileRow.theme || 'maroon',
    remindersEnabled: Boolean(profileRow.reminders_enabled),
  });
});

app.post('/api/profile', (req, res) => {
  const { name, studentId, program, company, supervisor, targetHours, bio, email, phone, profilePicture, coverPhoto, theme, remindersEnabled } = req.body;
  
  db.prepare(`
    UPDATE profile SET 
      name = ?, student_id = ?, program = ?, company = ?, supervisor = ?, 
      target_hours = ?, bio = ?, email = ?, phone = ?, profile_picture = ?, cover_photo = ?,
      theme = ?, reminders_enabled = ?
    WHERE user_id = ?
  `).run(
    name, studentId, program, company, supervisor, targetHours, bio, email, phone, profilePicture, coverPhoto, 
    theme || 'maroon', remindersEnabled ? 1 : 0, DEFAULT_USER_ID
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
    theme: profileRow.theme || 'maroon',
    remindersEnabled: Boolean(profileRow.reminders_enabled),
  });
});

// Helper to calculate hours
function calculateHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  let startInMinutes = startHour * 60 + startMin;
  let endInMinutes = endHour * 60 + endMin;
  if (endInMinutes < startInMinutes) {
    endInMinutes += 24 * 60;
  }
  return (endInMinutes - startInMinutes) / 60;
}

// ----- LOGS ENDPOINTS -----

app.get('/api/logs', (req, res) => {
  const rows = db.prepare('SELECT id, date, start_time as startTime, end_time as endTime, tasks, diary, moods, categories, attachments, hours FROM logs WHERE user_id = ? ORDER BY date DESC, id DESC').all(DEFAULT_USER_ID);
  
  // Format rows to match frontend structure
  const logs = rows.map(row => ({
    id: row.id,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    tasks: row.tasks || '',
    diary: row.diary || '',
    moods: row.moods ? JSON.parse(row.moods) : [],
    categories: row.categories ? JSON.parse(row.categories) : [],
    attachments: row.attachments ? JSON.parse(row.attachments) : [],
    hours: row.hours
  }));
  res.json(logs);
});

app.post('/api/logs', (req, res) => {
  const { date, startTime, endTime, tasks, diary, moods, categories, attachments } = req.body;
  const hours = calculateHours(startTime, endTime);
  const moodsStr = JSON.stringify(moods || []);
  const categoriesStr = JSON.stringify(categories || []);
  const attachmentsStr = JSON.stringify(attachments || []);

  const info = db.prepare('INSERT INTO logs (user_id, date, start_time, end_time, tasks, diary, moods, categories, attachments, hours, task_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(DEFAULT_USER_ID, date, startTime, endTime, tasks, diary, moodsStr, categoriesStr, attachmentsStr, hours, tasks);
  
  const newRow = db.prepare('SELECT id, date, start_time as startTime, end_time as endTime, tasks, diary, moods, categories, attachments, hours FROM logs WHERE id = ?').get(info.lastInsertRowid);
  
  res.json({
    id: newRow.id,
    date: newRow.date,
    startTime: newRow.startTime,
    endTime: newRow.endTime,
    tasks: newRow.tasks || '',
    diary: newRow.diary || '',
    moods: newRow.moods ? JSON.parse(newRow.moods) : [],
    categories: newRow.categories ? JSON.parse(newRow.categories) : [],
    attachments: newRow.attachments ? JSON.parse(newRow.attachments) : [],
    hours: newRow.hours
  });
});

app.put('/api/logs', (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Missing log ID.' });

  const log = db.prepare('SELECT user_id FROM logs WHERE id = ?').get(id);
  if (!log || log.user_id !== DEFAULT_USER_ID) {
    return res.status(404).json({ error: 'Log not found or access denied.' });
  }

  const { date, startTime, endTime, tasks, diary, moods, categories, attachments } = req.body;
  const hours = calculateHours(startTime, endTime);
  const moodsStr = JSON.stringify(moods || []);
  const categoriesStr = JSON.stringify(categories || []);
  const attachmentsStr = JSON.stringify(attachments || []);

  db.prepare('UPDATE logs SET date = ?, start_time = ?, end_time = ?, tasks = ?, diary = ?, moods = ?, categories = ?, attachments = ?, hours = ?, task_description = ? WHERE id = ?')
    .run(date, startTime, endTime, tasks, diary, moodsStr, categoriesStr, attachmentsStr, hours, tasks, id);

  const updatedRow = db.prepare('SELECT id, date, start_time as startTime, end_time as endTime, tasks, diary, moods, categories, attachments, hours FROM logs WHERE id = ?').get(id);
  
  res.json({
    id: updatedRow.id,
    date: updatedRow.date,
    startTime: updatedRow.startTime,
    endTime: updatedRow.endTime,
    tasks: updatedRow.tasks || '',
    diary: updatedRow.diary || '',
    moods: updatedRow.moods ? JSON.parse(updatedRow.moods) : [],
    categories: updatedRow.categories ? JSON.parse(updatedRow.categories) : [],
    attachments: updatedRow.attachments ? JSON.parse(updatedRow.attachments) : [],
    hours: updatedRow.hours
  });
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

// ----- BACKUP & RESTORE -----

app.get('/api/backup', (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE user_id = ?').get(DEFAULT_USER_ID);
  const logs = db.prepare('SELECT * FROM logs WHERE user_id = ?').all(DEFAULT_USER_ID);
  
  // Send as a downloadable JSON file
  res.setHeader('Content-disposition', 'attachment; filename=usep_ojt_backup.json');
  res.setHeader('Content-type', 'application/json');
  res.send(JSON.stringify({ profile, logs }, null, 2));
});

app.post('/api/restore', (req, res) => {
  const { profile, logs } = req.body;
  if (!profile || !logs) return res.status(400).json({ error: 'Invalid backup file format.' });

  try {
    db.prepare('BEGIN').run();
    
    // Restore profile
    db.prepare(`
      UPDATE profile SET 
        name = ?, student_id = ?, program = ?, company = ?, supervisor = ?, 
        target_hours = ?, bio = ?, email = ?, phone = ?, profile_picture = ?, cover_photo = ?,
        theme = ?, reminders_enabled = ?
      WHERE user_id = ?
    `).run(
      profile.name || '', profile.student_id || '', profile.program || '', profile.company || '', profile.supervisor || '', 
      profile.target_hours || 0, profile.bio || '', profile.email || '', profile.phone || '', profile.profile_picture || '', profile.cover_photo || '', 
      profile.theme || 'maroon', profile.reminders_enabled || 0, DEFAULT_USER_ID
    );

    // Restore logs
    db.prepare('DELETE FROM logs WHERE user_id = ?').run(DEFAULT_USER_ID);
    const insertLog = db.prepare('INSERT INTO logs (user_id, date, start_time, end_time, tasks, diary, moods, categories, attachments, hours, task_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const log of logs) {
      const tasksValue = log.tasks || log.task_description || '';
      const diaryValue = log.diary || '';
      const moodsValue = Array.isArray(log.moods) ? JSON.stringify(log.moods) : (log.moods || '[]');
      const categoriesValue = Array.isArray(log.categories) ? JSON.stringify(log.categories) : (log.categories || '[]');
      const attachmentsValue = Array.isArray(log.attachments) ? JSON.stringify(log.attachments) : (log.attachments || '[]');
      const hoursValue = log.hours || calculateHours(log.start_time, log.end_time);

      insertLog.run(
        DEFAULT_USER_ID, 
        log.date, 
        log.start_time || log.startTime, 
        log.end_time || log.endTime, 
        tasksValue, 
        diaryValue, 
        moodsValue, 
        categoriesValue, 
        attachmentsValue,
        hoursValue, 
        tasksValue
      );
    }
    
    db.prepare('COMMIT').run();
    res.json({ success: true });
  } catch (error) {
    db.prepare('ROLLBACK').run();
    console.error(error);
    res.status(500).json({ error: 'Failed to restore backup.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
