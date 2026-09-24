import 'dotenv/config';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { assertStartupConfig, getPort } from './config/env.js';

let server;

function redactStartupMessage(error) {
  const rawMessage = error instanceof Error ? error.message : String(error);
  return rawMessage
    .replace(/mongodb(?:\+srv)?:\/\/[^/\s@]+@/gi, 'mongodb://<credentials>@')
    .replace(/([?&](?:password|passwd|secret|token|jwt_secret)=)[^&\s]*/gi, '$1<redacted>')
    .replace(/\b(JWT_SECRET|MONGO_URI|PASSWORD|TOKEN)\s*=\s*[^\s,;]+/gi, '$1=<redacted>');
}

function describeStartupError(error) {
  const name = error?.name || 'Error';
  const code = error?.code ? ` (${error.code})` : '';
  return `${name}${code}: ${redactStartupMessage(error)}`;
}

async function start() {
  try {
    assertStartupConfig();
    const port = getPort();

    await connectDB(process.env.MONGO_URI);
    server = app.listen(port, () => {
      console.log(`EventFlow API listening on port ${port}`);
    });
  } catch (error) {
    console.error(`Unable to start EventFlow API: ${describeStartupError(error)}`);
    await disconnectDB().catch(() => {});
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Closing gracefully...`);
  if (server) {
    server.closeIdleConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
