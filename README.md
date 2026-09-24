# EventFlow — Event Registration & Smart Check-in Platform

EventFlow is a production-style MERN application for capacity-safe event registration and exactly-once QR check-in. The frontend is React + Vite, the API is Node.js + Express, persistent data is stored in MongoDB Atlas through Mongoose, and authentication is JWT + bcrypt.

The core flow is connected end to end:

```text
React form → REST API → route → controller → Mongoose model → MongoDB Atlas → JSON response → React UI
```

## Included functionality

- Organizer and volunteer authentication with hashed passwords, JWT sessions, logout revocation, protected routes, and role-based authorization.
- Organizer event creation, editing, deletion, public listings, registration lists, and live dashboard statistics.
- Public attendee registration with an event selector, remaining-seat display, duplicate-attendee protection, and capacity enforcement.
- Unique ticket IDs such as `EVT-2026-A7K92P`, persisted with a unique database index.
- Real QR code generation in the browser and a real downloadable PDF ticket.
- Browser camera QR scanning with `html5-qrcode`, plus manual ticket-ID verification.
- Atomic check-in transition that prevents a ticket from being successfully consumed twice.
- Live organizer statistics calculated from MongoDB aggregation queries; no dashboard metrics are hardcoded.
- Validation and user-friendly error handling on both the client and server.
- Responsive EventFlow design system with desktop, tablet, and mobile layouts.

## Project structure

```text
EventFlow/
├── backend/
│   ├── src/
│   │   ├── config/       # environment and MongoDB connection
│   │   ├── controllers/  # auth, events, registrations, check-in, dashboard
│   │   ├── middleware/   # authentication, roles, error handling
│   │   ├── models/       # User, Event, Registration Mongoose models
│   │   ├── routes/       # REST route modules
│   │   ├── utils/        # ticket generation, async/error helpers
│   │   ├── validators/   # Zod request validation
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # shared, layout, ticket, event, and scanner UI
│   │   ├── context/      # auth and data refresh state
│   │   ├── hooks/        # API data loading hook
│   │   ├── pages/        # public, organizer, and volunteer routes
│   │   ├── services/     # centralized Axios API services
│   │   ├── styles/       # responsive design system
│   │   └── utils/        # QR and PDF generation
│   └── package.json
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 20 or newer (Node 20.19+ is recommended for the Vite toolchain).
- npm 10 or newer.
- A MongoDB Atlas cluster and database user. Use a replica set / deployment that supports transactions (Atlas standard clusters do).
- A modern browser. Camera scanning works on `localhost` or an HTTPS deployment; manual verification remains available if camera permission is denied.

## 1. Install dependencies

From the project root:

```bash
npm install
npm run install:all
```

`npm run install:all` installs both `backend` and `frontend` dependencies. You can also install them separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 2. Configure MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user with permission to read and write the application database.
3. Add the deployment IP address to the Atlas network access list. For local development, add your current public IP or use the Atlas development access policy appropriate for your environment.
4. Copy the Atlas connection string and replace the username, password, cluster host, and database name as required by Atlas. Do not commit this string.

## 3. Create environment files

Copy the example files:

### Windows PowerShell

```powershell
Copy-Item .env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

### macOS / Linux

```bash
cp .env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set the backend values in `backend/.env`:

```dotenv
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_EXPIRES_IN=7d
```

The root `.env.example` documents the same variables. The frontend file contains:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Never put real credentials in source code, `.env.example`, screenshots, or the ZIP archive. `.env` files are ignored by Git.

### Atlas SRV DNS fallback

The preferred Atlas URI is `mongodb+srv://...`. If Node/Mongoose reports `querySrv ECONNREFUSED` even though PowerShell can resolve the SRV record, use Atlas's direct seed-list connection string instead:

```dotenv
MONGO_URI=mongodb://<url-encoded-username>:<url-encoded-password>@<seed-host-1>:27017,<seed-host-2>:27017,<seed-host-3>:27017/<database>?replicaSet=<replica-set-name>&retryWrites=true&w=majority&appName=<app-name>&tls=true&authSource=<auth-source>
```

Use the actual seed hostnames, ports, replica-set name, database, and application name shown by Atlas. Keep the credentials URL-encoded, keep TLS enabled, and never commit the resulting URI. The application still uses the same `MONGO_URI` configuration and Mongoose connection path; no frontend or architectural changes are required.

The backend loads `backend/.env` through `dotenv/config` before reading configuration. Run backend commands from the `backend` directory (or use the root scripts), and verify that the file is named exactly `.env` — not `env`, `.env.local`, or `.env.example`.

The startup validator checks the required names and reports safe diagnostics for missing `MONGO_URI`, missing/short `JWT_SECRET`, malformed MongoDB URI schemes, and invalid `PORT` values. Mongoose connection errors are also reported with credential fragments redacted, so the log remains actionable without exposing secrets.

Generate a suitable JWT secret, for example:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 4. Start the application

In two terminals:

```bash
# terminal 1
cd backend
npm run dev
```

```bash
# terminal 2
cd frontend
npm run dev
```

Open `http://localhost:5173`.

Alternatively, from the project root:

```bash
npm run dev
```

The API health endpoint is available at `http://localhost:5000/health`.

For a production-style frontend build:

```bash
npm run build
npm run preview
```

The API production start command is:

```bash
cd backend
npm start
```

Set `NODE_ENV=production` in the deployment environment. The backend explicitly creates the declared unique indexes during startup, including user email, ticket ID, and one-registration-per-event indexes.

## 5. Test the complete flow manually

1. Sign up as an **Organizer**.
2. Create an event with capacity `2`.
3. Open the event listing and register attendee 1.
4. Register attendee 2.
5. Attempt attendee 3; the API and UI reject it with **Registration closed. Event capacity has been reached.**
6. Open the digital ticket and verify the generated Ticket ID and QR code.
7. Download the PDF ticket and confirm that it opens as a real PDF with attendee, event, date, time, venue, Ticket ID, and QR code.
8. Sign up or log in as a **Volunteer** in a separate browser session.
9. Open the volunteer check-in desk and choose the event.
10. Scan the QR code or enter the Ticket ID manually.
11. Confirm the success card shows the attendee, event, Ticket ID, and check-in timestamp.
12. Scan or enter the same ticket again; confirm **Ticket Already Checked In**.
13. Enter a fake Ticket ID; confirm **Invalid Ticket**.
14. Return to the organizer dashboard and confirm the registered, checked-in, remaining-seat, and percentage values are live database results.

## Automated verification

The backend includes an integration test suite that starts a temporary MongoDB replica set and exercises the real Express routes, Mongoose models, transactions, capacity boundary, concurrent registration requests, concurrent duplicate check-ins, invalid tickets, role authorization, QR payload persistence, and dashboard aggregation.

```bash
cd backend
npm test
```

The test database is temporary test infrastructure. The running application always uses `MONGO_URI` and MongoDB Atlas; it does not use a mock API or an in-memory database.

Frontend verification:

```bash
cd frontend
npm run lint
npm run build
```

## REST API overview

All protected routes use `Authorization: Bearer <JWT>`.

### Authentication

- `POST /api/auth/signup` — create an organizer or volunteer account.
- `POST /api/auth/login` — issue a JWT.
- `POST /api/auth/logout` — revoke the current token version.
- `GET /api/auth/me` — return the authenticated user.

### Events and registrations

- `GET /api/events` — public event listing with live counts.
- `GET /api/events/:id` — public event details.
- `POST /api/events` — organizer only; create an event.
- `GET /api/events/manage` — organizer only; list the organizer's events.
- `GET /api/events/:id/registrations` — organizer owner only; list registrations.
- `PUT /api/events/:id` — organizer owner only; update an event.
- `DELETE /api/events/:id` — organizer owner only; delete an event and its registrations.
- `POST /api/registrations` — public attendee registration; atomically enforces capacity.
- `GET /api/registrations` — organizer only; list registrations across owned events with optional `eventId`, `q`, `page`, and `limit` filters.
- `GET /api/registrations/ticket/:ticketId` — retrieve a digital ticket.
- `GET /api/registrations/:id` — organizer owner only; retrieve one registration.

### Check-in and dashboard

- `POST /api/checkin/verify` — volunteer only; verify and atomically check in a Ticket ID.
- `POST /api/checkin/scan` — volunteer only; QR/manual scan alias for the same guarded operation.
- `GET /api/dashboard/` — organizer only; real dashboard aggregation.
- `GET /api/dashboard/overview` — organizer only; same live overview for the React dashboard.

## Important business guarantees

- **Capacity:** registration increments the event counter only with an atomic `$expr` condition `registeredCount < capacity` inside a database transaction. A full event returns HTTP `409` and never creates a registration.
- **Unique ticket IDs:** cryptographic random ticket IDs are checked through unique MongoDB indexes, with collision retries inside the transaction.
- **Exactly once:** check-in uses `findOneAndUpdate({ ticketId, event, checkedIn: false }, ...)`. Two concurrent requests can produce at most one successful transition; the other receives HTTP `409`.
- **Event ownership:** event and registration management endpoints verify the authenticated organizer owns the event.
- **Secrets:** MongoDB credentials and the JWT secret are loaded only from environment variables.
- **Privacy:** sensitive error details and stack traces are not returned in production responses.

## ZIP handoff

The workspace is ready to be compressed as `Event-Registration-Smart-Checkin.zip`. Exclude `node_modules`, `.env`, `frontend/dist`, logs, and generated PDFs before sharing. The source tree includes both `package.json` files, lockfiles, `.env.example` files, tests, and this README.
