# Starting the NileLink Backend API

## Quick Start

The backend API server needs to be running for the investor app to work. The backend runs on **port 3010** by default.

### Prerequisites
- Node.js installed
- PostgreSQL running locally (for database)
- Redis running locally (for caching)

### Start the Backend

```bash
cd backend
npm install    # Install dependencies if not already done
npm run dev    # Start in development mode
```

The server will start on `http://localhost:3010` with the API available at `http://localhost:3010/api`.

### Expected Output
```
🚀 NileLink Backend Server running on port 3010
📱 Environment: development
🗄️  Database: Connected
🔗 Redis: Connected
```

### Verify Connection
Once the backend is running, the investor app will be able to:
- Register new accounts
- Login with email/password
- Verify email addresses
- Send/verify OTPs

## Configuration

The backend uses `.env` file for configuration. Key settings:
- `PORT=3010` - Server port
- `DATABASE_URL` - PostgreSQL connection string
- `SMTP_*` - Email service configuration
- `CORS_ORIGINS` - Allowed frontend URLs

## Troubleshooting

If you still see "Failed to fetch" errors:

1. **Ensure backend is running:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check the port:**
   - Backend should run on port 3010
   - If you need a different port, update it in `backend/.env`
   - Then update the investor app's `.env.local` file:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:YOUR_PORT/api
     ```

3. **Verify database connectivity:**
   - PostgreSQL must be running
   - Check connection string in `backend/.env`

4. **Restart the investor app:**
   ```bash
   cd web/investor
   npm run dev
   ```
   The app will pick up the new environment variables.
