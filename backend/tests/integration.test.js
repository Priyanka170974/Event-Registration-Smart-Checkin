import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.JWT_EXPIRES_IN = '1h';

let replSet;
let server;
let baseUrl;
let connectDB;
let disconnectDB;

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  return { status: response.status, data };
}

before(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGO_URI = replSet.getUri();
  ({ connectDB, disconnectDB } = await import('../src/config/db.js'));
  await connectDB(process.env.MONGO_URI);
  const { default: app } = await import('../src/app.js');
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    server.closeAllConnections?.();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
  if (disconnectDB) await disconnectDB();
  if (replSet) await replSet.stop();
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

test('complete organizer, registration, capacity, and check-in flow', async () => {
  const organizerSignup = await request('/api/auth/signup', {
    method: 'POST',
    body: {
      name: 'Avery Organizer',
      email: 'avery@example.com',
      password: 'StrongPass1',
      role: 'organizer',
    },
  });
  assert.equal(organizerSignup.status, 201);
  assert.equal(organizerSignup.data.user.role, 'organizer');
  const organizerToken = organizerSignup.data.token;

  const volunteerSignup = await request('/api/auth/signup', {
    method: 'POST',
    body: {
      name: 'Blair Volunteer',
      email: 'blair@example.com',
      password: 'StrongPass2',
      role: 'volunteer',
    },
  });
  assert.equal(volunteerSignup.status, 201);
  const volunteerToken = volunteerSignup.data.token;

  const me = await request('/api/auth/me', { token: organizerToken });
  assert.equal(me.status, 200);
  assert.equal(me.data.user.email, 'avery@example.com');

  const volunteerCreate = await request('/api/events', {
    method: 'POST',
    token: volunteerToken,
    body: {
      name: 'Not allowed',
      description: 'This must be rejected by role authorization.',
      date: '2030-01-01',
      time: '10:00',
      venue: 'Test Hall',
      capacity: 10,
    },
  });
  assert.equal(volunteerCreate.status, 403);

  const eventResponse = await request('/api/events', {
    method: 'POST',
    token: organizerToken,
    body: {
      name: 'Capacity Clinic',
      description: 'A test event with a strict capacity boundary.',
      date: '2030-06-15',
      time: '09:30',
      venue: 'Atlas Room',
      capacity: 2,
    },
  });
  assert.equal(eventResponse.status, 201);
  const eventId = eventResponse.data.event._id;
  assert.equal(eventResponse.data.event.registrationStatus, 'OPEN');

  const first = await request('/api/registrations', {
    method: 'POST',
    body: { attendeeName: 'First Attendee', attendeeEmail: 'first@example.com', eventId },
  });
  const second = await request('/api/registrations', {
    method: 'POST',
    body: { attendeeName: 'Second Attendee', attendeeEmail: 'second@example.com', eventId },
  });
  const third = await request('/api/registrations', {
    method: 'POST',
    body: { attendeeName: 'Third Attendee', attendeeEmail: 'third@example.com', eventId },
  });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.equal(third.status, 409);
  assert.equal(third.data.code, 'EVENT_CAPACITY_REACHED');
  assert.notEqual(first.data.registration.ticketId, second.data.registration.ticketId);
  assert.match(first.data.registration.ticketId, /^EVT-\d{4}-[A-Z2-9]{7}$/);
  assert.match(first.data.registration.qrPayload, /^EVTCHECKIN:[a-f\d]{24}:/);

  const ticket = await request(`/api/registrations/ticket/${first.data.registration.ticketId}`);
  assert.equal(ticket.status, 200);
  assert.equal(ticket.data.registration.checkedIn, false);

  const checkIn = await request('/api/checkin/verify', {
    method: 'POST',
    token: volunteerToken,
    body: { eventId, ticketId: first.data.registration.ticketId },
  });
  assert.equal(checkIn.status, 200);
  assert.equal(checkIn.data.ticket.checkedIn, true);
  assert.ok(checkIn.data.ticket.checkedInAt);

  const duplicate = await request('/api/checkin/scan', {
    method: 'POST',
    token: volunteerToken,
    body: { eventId, ticketId: first.data.registration.ticketId },
  });
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.data.code, 'TICKET_ALREADY_CHECKED_IN');

  const fake = await request('/api/checkin/verify', {
    method: 'POST',
    token: volunteerToken,
    body: { eventId, ticketId: 'EVT-2030-FAKEID1' },
  });
  assert.equal(fake.status, 404);
  assert.equal(fake.data.code, 'INVALID_TICKET');

  const dashboard = await request('/api/dashboard/overview', { token: organizerToken });
  assert.equal(dashboard.status, 200);
  assert.equal(dashboard.data.summary.totalEvents, 1);
  assert.equal(dashboard.data.summary.totalRegistered, 2);
  assert.equal(dashboard.data.summary.totalCheckedIn, 1);
  assert.equal(dashboard.data.summary.remainingSeats, 0);
  assert.equal(dashboard.data.events[0].checkInPercentage, 50);

  const volunteerDashboard = await request('/api/dashboard/overview', { token: volunteerToken });
  assert.equal(volunteerDashboard.status, 403);

  const allRegistrations = await request('/api/registrations', { token: organizerToken });
  assert.equal(allRegistrations.status, 200);
  assert.equal(allRegistrations.data.total, 2);
  assert.equal(allRegistrations.data.registrations[0].event.name, 'Capacity Clinic');

  const logout = await request('/api/auth/logout', { method: 'POST', token: organizerToken });
  assert.equal(logout.status, 200);
  const revokedSession = await request('/api/auth/me', { token: organizerToken });
  assert.equal(revokedSession.status, 401);
  assert.equal(revokedSession.data.code, 'SESSION_REVOKED');
});

test('atomic registration and exactly-once check-in hold under concurrent requests', async () => {
  const organizer = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'avery@example.com', password: 'StrongPass1' },
  });
  const volunteer = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'blair@example.com', password: 'StrongPass2' },
  });
  assert.equal(organizer.status, 200);
  assert.equal(volunteer.status, 200);

  const eventResponse = await request('/api/events', {
    method: 'POST',
    token: organizer.data.token,
    body: {
      name: 'Concurrent Safety Test',
      description: 'Verifies the database boundary under simultaneous requests.',
      date: '2030-07-20',
      time: '14:00',
      venue: 'Replica Room',
      capacity: 2,
    },
  });
  assert.equal(eventResponse.status, 201);
  const eventId = eventResponse.data.event._id;

  const registrations = await Promise.all([
    request('/api/registrations', {
      method: 'POST',
      body: { attendeeName: 'Race One', attendeeEmail: 'race1@example.com', eventId },
    }),
    request('/api/registrations', {
      method: 'POST',
      body: { attendeeName: 'Race Two', attendeeEmail: 'race2@example.com', eventId },
    }),
    request('/api/registrations', {
      method: 'POST',
      body: { attendeeName: 'Race Three', attendeeEmail: 'race3@example.com', eventId },
    }),
  ]);
  const successfulRegistrations = registrations.filter(({ status }) => status === 201);
  const rejectedRegistrations = registrations.filter(({ status }) => status === 409);
  assert.equal(successfulRegistrations.length, 2);
  assert.equal(rejectedRegistrations.length, 1);
  assert.equal(new Set(successfulRegistrations.map(({ data }) => data.registration.ticketId)).size, 2);

  const ticketId = successfulRegistrations[0].data.registration.ticketId;
  const qrPayload = successfulRegistrations[0].data.registration.qrPayload;
  const parsedPayload = qrPayload.split(':');
  const scanResults = await Promise.all([
    request('/api/checkin/verify', {
      method: 'POST',
      token: volunteer.data.token,
      body: { eventId, ticketId },
    }),
    request('/api/checkin/scan', {
      method: 'POST',
      token: volunteer.data.token,
      body: { eventId, ticketId },
    }),
  ]);
  assert.equal(scanResults.filter(({ status }) => status === 200).length, 1);
  assert.equal(scanResults.filter(({ status }) => status === 409).length, 1);
  assert.equal(parsedPayload.length, 3);
  assert.equal(parsedPayload[1], eventId);
});
