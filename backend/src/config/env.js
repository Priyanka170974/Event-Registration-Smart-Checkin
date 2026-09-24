function requireNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET is missing or must be at least 32 characters long.');
  }

  return secret;
}

export function getPort() {
  const rawPort = process.env.PORT || '5000';
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535. Received: ${rawPort}.`);
  }

  return port;
}

function hasPlaceholderCredentials(uri) {
  const authorityStart = uri.indexOf('://') + 3;
  const at = uri.lastIndexOf('@');
  if (authorityStart < 3 || at < authorityStart) return false;

  const userInfo = uri.slice(authorityStart, at);
  try {
    return /<[^>]+>/.test(decodeURIComponent(userInfo));
  } catch {
    return /<[^>]+>/.test(userInfo);
  }
}

export function assertStartupConfig() {
  const problems = [];

  if (!requireNonEmpty(process.env.MONGO_URI)) {
    problems.push('MONGO_URI is missing');
  } else if (!/^mongodb(\+srv)?:\/\//i.test(process.env.MONGO_URI.trim())) {
    problems.push('MONGO_URI must start with mongodb:// or mongodb+srv://');
  } else if (hasPlaceholderCredentials(process.env.MONGO_URI.trim())) {
    problems.push('MONGO_URI still contains placeholder credentials; replace the Atlas username and password in backend/.env');
  }

  if (!requireNonEmpty(process.env.JWT_SECRET)) {
    problems.push('JWT_SECRET is missing');
  } else if (process.env.JWT_SECRET.length < 32) {
    problems.push('JWT_SECRET must be at least 32 characters long');
  }

  try {
    getPort();
  } catch (error) {
    problems.push(error.message);
  }

  if (problems.length) {
    throw new Error(`Invalid startup configuration: ${problems.join('; ')}.`);
  }
}

export function getClientOrigins() {
  const configuredOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',')
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  return [...new Set(
    configuredOrigins
      .map((origin) => origin.trim().replace(/\/+$/, ''))
      .filter(Boolean),
  )];
}
