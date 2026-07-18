# USeP OJT Hours Tracker

A modern, full-stack **On-the-Job Training (OJT) Hours Tracker** developed using **React + TypeScript**, **Node.js (Express)**, and **SQLite**. The system provides a streamlined, single-user experience to record and monitor completed OJT hours, manage profiles, and securely store all data in a local SQLite file.

**No external database server (like XAMPP or MySQL) is required to run this application.**

---

# Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend | Node.js, Express |
| Database | SQLite (`better-sqlite3`) |

---

# Features

- **Single-User Mode:** Seamlessly jump straight into tracking without managing passwords or accounts.
- **Zero-Config Database:** Automatically initializes and manages a local SQLite database (`database.sqlite`).
- **Profile Management:** Set and track your OJT target hours and personal details.
- **OJT Log Management:** Complete CRUD (Create, Read, Update, Delete) operations for daily logs.
- **Dashboard Statistics:** Real-time calculation of hours completed versus target hours.
- **Charts and Progress Visualization.**
- **No CORS Issues:** Vite is configured to automatically proxy API requests to the backend server.

---

# Project Structure

| Folder/File | Description |
|--------------|-------------|
| `frontend/` | React frontend application |
| `frontend/src/App.tsx` | Main application component |
| `frontend/src/api.ts` | API requests to the Node.js backend |
| `frontend/vite.config.ts` | Vite configuration (includes API proxy) |
| `backend/` | Node.js backend application |
| `backend/server.js` | Express server and API endpoints |
| `backend/db.js` | SQLite database connection and table initialization |
| `backend/database.sqlite`| The actual database file (created automatically) |

---

# Database

The application uses **SQLite**, which stores the entire database in a single file inside the `backend` folder (`database.sqlite`). 

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Stores the default user account used by the system. |
| `profile` | Stores the user's profile information. |
| `logs` | Stores all OJT log records and daily entries. |

> **Important:** If you need to back up your data, simply copy the `backend/database.sqlite` file. If you delete this file, the application will create a fresh, empty database the next time the backend server runs.

---

# Installation & Running

## 1. Install Required Software

| Software | Purpose |
|----------|---------|
| Node.js (LTS) | Runs the React frontend and the Express backend |

> **Note:** XAMPP and MySQL are **NOT** required for this version.

---

## 2. Start the Backend Server

Open a terminal, navigate to the `backend` folder, install dependencies, and start the server:

```bash
cd backend
npm install
node server.js
```

*The backend will run on `http://localhost:3000` and automatically create the SQLite database if it doesn't exist.*

---

## 3. Start the Frontend Development Server

Open a **second terminal window**, navigate to the `frontend` folder, install dependencies, and start Vite:

```bash
cd frontend
npm install
npm run dev
```

*Vite will start your React application (typically at `http://localhost:5173`). Open this URL in your browser to start tracking your hours.*

---

# API Endpoints

The Express backend provides the following streamlined endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/profile` | GET | Retrieve the default user's profile |
| `/api/profile` | POST | Update the default user's profile |
| `/api/logs` | GET | Retrieve all OJT logs |
| `/api/logs` | POST | Create a new OJT log |
| `/api/logs?id={id}` | PUT | Update an existing OJT log |
| `/api/logs?id={id}` | DELETE | Delete an existing OJT log |

---

# Production Build

To generate a production build of the frontend:

```bash
cd frontend
npm run build
```

The compiled, minified files will be generated inside the `frontend/dist` directory. These static files can be served by any web server (like Nginx, Apache, or a Node static file server).

---

# License

This project was developed for the **University of Southeastern Philippines (USeP)** as an **On-the-Job Training (OJT) Hours Tracker**.