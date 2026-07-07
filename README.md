# USeP OJT Hours Tracker

A full-stack **On-the-Job Training (OJT) Hours Tracker** developed using **React + TypeScript**, **PHP**, and **MySQL**. The system enables students to record and monitor their completed OJT hours, manage their profile, and securely store all data in a MySQL database through a PHP backend.
\
---

# Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend | PHP |
| Database | MySQL |
| Database Access | PDO |

---

# Features

- User Registration and Login
- Secure Password Hashing (`password_hash()`)
- Token-Based Authentication
- Automatic Session Restoration
- Profile Management
- OJT Log Management (Create, Read, Update, Delete)
- Target Hours Tracking
- Dashboard Statistics
- Charts and Progress Visualization
- Image Upload and Crop Support
- Persistent MySQL Storage
- User-Specific Data Isolation

---

# Project Structure

| Folder/File | Description |
|--------------|-------------|
| `frontend/` | React frontend application |
| `frontend/src/components/` | React components |
| `frontend/src/App.tsx` | Main application component |
| `frontend/src/api.ts` | API requests and token handling |
| `frontend/src/utils.ts` | Utility functions |
| `frontend/src/types.ts` | TypeScript interfaces |
| `frontend/.env` | Frontend environment variables |
| `backend/api/` | PHP API endpoints |
| `backend/config.php` | Database configuration |
| `backend/db.php` | PDO connection and CORS configuration |
| `backend/auth.php` | Authentication functions |
| `backend/.htaccess` | Authorization header support |
| `database/schema.sql` | Database schema |

---

# Database

Import the provided database before running the project.

### Database Name

```
usep_ojt_tracker_v2
```

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Stores registered user accounts |
| `profile` | Stores each user's profile information |
| `ojt_logs` | Stores all OJT log records |

> **Important:** Importing `database/schema.sql` recreates the tables. Existing data will be deleted unless backed up.

---

# Installation

## 1. Install Required Software

| Software | Purpose |
|----------|---------|
| VS Code | Code editor |
| Node.js (LTS) | Runs the React frontend |
| XAMPP | Apache, PHP, and MySQL |

---

## 2. Copy the Project

Place the project inside XAMPP's `htdocs` folder.

Example:

```
C:\xampp\htdocs\usep-ojt-tracker-react_v2
```

---

## 3. Configure the Database

Open:

```
backend/config.php
```

Verify the database credentials.

```php
$host = "localhost";
$dbname = "usep_ojt_tracker_v2";
$username = "root";
$password = "";
```

---

## 4. Configure the Frontend

Open:

```
frontend/.env
```

Set the API URL.

```env
VITE_API_BASE_URL=http://localhost/usep-ojt-tracker-react_v2/backend/api
```

---

## 5. Install Dependencies

Inside the **frontend** folder:

```bash
npm install
```

---

## 6. Start the Development Server

```bash
npm run dev
```

Open the URL displayed by Vite (typically `http://localhost:5173`).

---

# Authentication Flow

| Step | Description |
|------|-------------|
| Register | Creates a new account and hashes the password |
| Login | Verifies the password and issues an authentication token |
| Token Storage | Token is stored in `localStorage` |
| API Requests | Every request includes `Authorization: Bearer <token>` |
| Session Restore | Existing sessions are restored automatically |
| Logout | Invalidates the token and ends the session |

---

# User Data Isolation

Every authenticated user has their own:

- Profile
- Target Hours
- OJT Logs

All database queries are filtered using the authenticated user's `user_id`, preventing access to another user's records.

---

# Default User Data

When a new account is created:

| Field | Default Value |
|--------|---------------|
| Target Hours | `0` |
| Profile | Empty |
| OJT Logs | None |

---

# API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `register.php` | Create a new account |
| `login.php` | Authenticate user |
| `logout.php` | End session |
| `me.php` | Restore authenticated session |
| `profile.php` | Manage profile information |
| `logs.php` | Manage OJT log records |

---

# Important Notes

## Password Requirement

Passwords must contain **at least 6 characters**.

---

## Authorization Header

The project includes:

```
backend/.htaccess
```

This ensures Apache forwards the `Authorization` header to PHP.

If authenticated requests return **401 Unauthorized**, verify that:

- `mod_rewrite` is enabled.
- `AllowOverride All` is enabled in `httpd.conf`.

---

## CORS

Cross-Origin Resource Sharing (CORS) is already configured in `backend/db.php`, allowing communication between the React frontend and the PHP backend during development.

---

## Deleting Users

Deleting a record from the `users` table automatically removes the associated:

- Profile
- OJT Logs

This behavior is implemented using **ON DELETE CASCADE**.

---

# Production Build

Generate a production build:

```bash
npm run build
```

The compiled files are generated inside:

```
frontend/dist
```

Copy the contents of `dist` into the project's Apache directory alongside the backend.

Example:

```
htdocs/usep-ojt-tracker-react_v2/
```

The application can then be accessed directly through Apache without running the Vite development server.

---

# Project Workflow

| Step | Process |
|------|---------|
| 1 | User registers an account |
| 2 | Password is securely hashed |
| 3 | Profile is automatically created |
| 4 | Authentication token is generated |
| 5 | Token is stored in the browser |
| 6 | API requests include the token |
| 7 | Backend authenticates the user |
| 8 | User accesses and manages only their own data |
| 9 | Logout invalidates the authentication token |

---

# License

This project was developed for the **University of Southeastern Philippines (USeP)** as an **On-the-Job Training (OJT) Hours Tracker**.