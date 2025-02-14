# Real-Time Chat Application

A real-time chat application with file upload capabilities built with Node.js, Express, Socket.io, and PostgreSQL.

## Features
- Real-time messaging with typing indicators
- User authentication with JWT
- File upload support (XLSX, PDF, JPEG, DOCX)
- Activity logging
- Message history with pagination

## Tech Stack
- Node.js & Express
- Socket.io for real-time communication
- PostgreSQL & Sequelize
- Bull for job queues
- JWT for authentication

## Setup

1. Clone the repository:

```bash
git clone https://github.com/prasanth-sasuke/chat_app_assessment.git
```
cd <project-directory>

2. Install dependencies:<br>
```bash
npm install
```

3. Set up environment variables:<br>
env<br>
```bash
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASS=Admin
DB_NAME=chat_app
JWT_SECRET=your_jwt_secret
REDIS_HOST=localhost
REDIS_PORT=6379

```

4. Create database:<br>

sql.
```bash
CREATE DATABASE chat_app;
```

5. Start the server:
```bash
npm start
```

## API Documentation

API documentation is available at `/api-docs` when running the server.

## Database Schema

### Users
- id (UUID)
- username (STRING)
- email (STRING)
- password (STRING)
- lastSeen (DATE)
- lastLoginAt (DATE)

### Messages
- id (UUID)
- content (TEXT)
- type (ENUM)
- fileUrl (STRING)
- senderId (UUID)

### Files
- id (UUID)
- filename (STRING)
- originalName (STRING)
- mimeType (STRING)
- size (INTEGER)
- path (STRING)
- uploadedBy (UUID)
- status (ENUM)

### ActivityLogs
- id (UUID)
- userId (UUID)
- action (STRING)
- details (JSONB)

### UploadJobs
- id (UUID)
- userId (UUID)
- totalFiles (INTEGER)
- processedFiles (INTEGER)
- status (ENUM)
- error (TEXT)
