const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');

const root = __dirname;
const dataDirectory = path.join(root, 'data');
const uploadDirectory = path.join(root, 'uploads');
const accountsPath = path.join(dataDirectory, 'accounts.json');
const port = Number(process.env.PORT) || 4173;
const host = process.env.HOST || '127.0.0.1';
const collections = new Set(['patients', 'staff', 'appointments', 'consultations', 'investigations', 'prescriptions', 'wards', 'payments']);
const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
const scrypt = promisify(crypto.scrypt);
const sessions = new Map();
const loginAttempts = new Map();
const sessionLifetime = 8 * 60 * 60 * 1000;
const production = process.env.NODE_ENV === 'production';
let dummyPasswordHash;

async function sendJson(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(value));
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 8_000_000) throw new Error('Request body is too large.');
  }
  return JSON.parse(body || '{}');
}

async function readCollection(name) {
  return JSON.parse(await fs.readFile(path.join(dataDirectory, `${name}.json`), 'utf8'));
}

async function writeCollection(name, records) {
  const filePath = path.join(dataDirectory, `${name}.json`);
  const temporaryPath = `${filePath}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
  await fs.rename(temporaryPath, filePath);
}

async function hashPassword(password, salt) {
  return (await scrypt(password, salt, 64)).toString('hex');
}

async function createAccount(principalType, principal, password, accessRole = 'user') {
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    id: crypto.randomUUID(),
    principalType,
    principalId: principal.id,
    name: principal.name,
    email: principal.email.trim().toLowerCase(),
    salt,
    passwordHash: await hashPassword(password, salt),
    accessRole,
    active: true,
    createdAt: new Date().toISOString()
  };
}

function publicAccount(account) {
  return {
    id: account.id,
    principalType: account.principalType,
    principalId: account.principalId,
    name: account.name,
    email: account.email,
    accessRole: account.accessRole,
    active: account.active,
    createdAt: account.createdAt
  };
}

function readSession(request) {
  const token = (request.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('light_session='))?.slice('light_session='.length);
  const session = token && sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  return session;
}

function setSessionCookie(response, token, maxAge) {
  response.setHeader('set-cookie', `light_session=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAge}${production ? '; Secure' : ''}`);
}

async function initializeAuthentication() {
  let accounts;
  try {
    accounts = JSON.parse(await fs.readFile(accountsPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    accounts = [];
  }
  if (accounts.length) return;

  const staff = await readCollection('staff');
  const administrator = staff.find((member) => member.email?.toLowerCase() === (process.env.LIGHT_ADMIN_EMAIL || 'maya.chen@example.test').toLowerCase()) || staff[0];
  if (!administrator?.email) throw new Error('An employee with an email address is required to bootstrap the administrator account.');
  const generatedPassword = !process.env.LIGHT_ADMIN_PASSWORD;
  const password = process.env.LIGHT_ADMIN_PASSWORD || crypto.randomBytes(18).toString('base64url');
  const account = await createAccount('employee', administrator, password, 'admin');
  await fs.writeFile(accountsPath, `${JSON.stringify([account], null, 2)}\n`, 'utf8');
  if (generatedPassword) console.log(`Initial administrator: ${account.email}\nOne-time password: ${password}\nSign in and provision individual staff and patient accounts. Change this password before any non-demo use.`);
}

async function requireSession(request, response) {
  const session = readSession(request);
  if (!session) {
    await sendJson(response, 401, { error: 'Sign in to continue.' });
    return null;
  }
  return session;
}

const server = http.createServer(async (request, response) => {
  response.setHeader('x-content-type-options', 'nosniff');
  response.setHeader('x-frame-options', 'DENY');
  response.setHeader('referrer-policy', 'no-referrer');
  response.setHeader('cross-origin-resource-policy', 'same-origin');
  response.setHeader('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('content-security-policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const segments = url.pathname.split('/').filter(Boolean);

    if (segments[0] === 'api' && segments[1] === 'auth' && segments[2] === 'session' && request.method === 'GET') {
      const session = readSession(request);
      if (!session) return sendJson(response, 401, { error: 'Sign in to continue.' });
      return sendJson(response, 200, publicAccount(session.account));
    }

    if (segments[0] === 'api' && segments[1] === 'auth' && segments[2] === 'password' && request.method === 'POST') {
      const session = readSession(request);
      if (!session) return sendJson(response, 401, { error: 'Sign in to continue.' });
      const payload = await readBody(request);
      if (typeof payload.password !== 'string' || payload.password.length < 12 || payload.password.length > 256) return sendJson(response, 400, { error: 'Use a new password between 12 and 256 characters.' });
      const accounts = JSON.parse(await fs.readFile(accountsPath, 'utf8'));
      const account = accounts.find((item) => item.id === session.account.id && item.active);
      const currentHash = account && await hashPassword(String(payload.currentPassword || '').slice(0, 256), account.salt);
      if (!account || !crypto.timingSafeEqual(Buffer.from(currentHash, 'hex'), Buffer.from(account.passwordHash, 'hex'))) return sendJson(response, 403, { error: 'Current password is incorrect.' });
      account.salt = crypto.randomBytes(16).toString('hex');
      account.passwordHash = await hashPassword(payload.password, account.salt);
      await fs.writeFile(accountsPath, `${JSON.stringify(accounts, null, 2)}\n`, 'utf8');
      const cookieToken = (request.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('light_session='))?.slice('light_session='.length);
      for (const [token, activeSession] of sessions) if (token !== cookieToken && activeSession.account.id === account.id) sessions.delete(token);
      sessions.set(cookieToken, { account, expiresAt: session.expiresAt });
      return sendJson(response, 200, { changed: true });
    }

    if (segments[0] === 'api' && segments[1] === 'auth' && segments[2] === 'login' && request.method === 'POST') {
      const address = request.socket.remoteAddress || 'unknown';
      const attempt = loginAttempts.get(address) || { count: 0, blockedUntil: 0 };
      if (attempt.blockedUntil > Date.now()) return sendJson(response, 429, { error: 'Too many sign-in attempts. Wait 15 minutes and try again.' });
      const payload = await readBody(request);
      const principalType = payload.principalType;
      const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
      const password = typeof payload.password === 'string' ? payload.password : '';
      const accounts = JSON.parse(await fs.readFile(accountsPath, 'utf8'));
      const account = accounts.find((item) => item.email === email && item.principalType === principalType && item.active);
      const candidateHash = await hashPassword(password.slice(0, 256), account?.salt || 'light-hospital-dummy-salt');
      const expectedHash = account?.passwordHash || dummyPasswordHash;
      const matches = Buffer.from(candidateHash, 'hex').length === Buffer.from(expectedHash, 'hex').length && crypto.timingSafeEqual(Buffer.from(candidateHash, 'hex'), Buffer.from(expectedHash, 'hex'));
      if (!account || !matches || !['employee', 'patient'].includes(principalType)) {
        attempt.count += 1;
        if (attempt.count >= 5) { attempt.count = 0; attempt.blockedUntil = Date.now() + 15 * 60 * 1000; }
        loginAttempts.set(address, attempt);
        return sendJson(response, 401, { error: 'Email or password is incorrect.' });
      }
      loginAttempts.delete(address);
      const token = crypto.randomBytes(32).toString('base64url');
      sessions.set(token, { account, expiresAt: Date.now() + sessionLifetime });
      setSessionCookie(response, token, sessionLifetime / 1000);
      return sendJson(response, 200, publicAccount(account));
    }

    if (segments[0] === 'api' && segments[1] === 'auth' && segments[2] === 'logout' && request.method === 'POST') {
      const token = (request.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('light_session='))?.slice('light_session='.length);
      if (token) sessions.delete(token);
      setSessionCookie(response, '', 0);
      return sendJson(response, 200, { signedOut: true });
    }

    if (segments[0] === 'api' && segments[1] === 'auth' && segments[2] === 'accounts') {
      const session = await requireSession(request, response);
      if (!session) return;
      if (session.account.principalType !== 'employee' || session.account.accessRole !== 'admin') return sendJson(response, 403, { error: 'Administrator access is required.' });
      const accounts = JSON.parse(await fs.readFile(accountsPath, 'utf8'));
      if (request.method === 'GET' && !segments[3]) return sendJson(response, 200, accounts.map(publicAccount));
      if (request.method === 'POST' && !segments[3]) {
        const payload = await readBody(request);
        if (!['employee', 'patient'].includes(payload.principalType) || typeof payload.principalId !== 'string' || typeof payload.password !== 'string' || payload.password.length < 12 || payload.password.length > 256) return sendJson(response, 400, { error: 'Choose a person and use a password between 12 and 256 characters.' });
        const collection = payload.principalType === 'employee' ? 'staff' : 'patients';
        const principal = (await readCollection(collection)).find((record) => record.id === payload.principalId);
        if (!principal?.email) return sendJson(response, 404, { error: 'That person needs an email address before an account can be created.' });
        if (accounts.some((account) => account.email === principal.email.toLowerCase() || (account.principalType === payload.principalType && account.principalId === principal.id))) return sendJson(response, 409, { error: 'This person already has an account.' });
        const account = await createAccount(payload.principalType, principal, payload.password);
        accounts.push(account);
        await fs.writeFile(accountsPath, `${JSON.stringify(accounts, null, 2)}\n`, 'utf8');
        return sendJson(response, 201, publicAccount(account));
      }
      if (request.method === 'DELETE' && segments[3]) {
        const revokedAccount = accounts.find((account) => account.id === segments[3]);
        if (!revokedAccount) return sendJson(response, 404, { error: 'Account not found.' });
        const remaining = accounts.filter((account) => account.id !== revokedAccount.id);
        if (!remaining.some((account) => account.accessRole === 'admin')) return sendJson(response, 400, { error: 'The last administrator account cannot be removed.' });
        await fs.writeFile(accountsPath, `${JSON.stringify(remaining, null, 2)}\n`, 'utf8');
        for (const [token, activeSession] of sessions) if (activeSession.account.id === revokedAccount.id) sessions.delete(token);
        return sendJson(response, 200, { revoked: true });
      }
      return sendJson(response, 405, { error: 'Method not allowed.' });
    }

    if (segments[0] === 'api' && segments[1] === 'upload' && request.method === 'POST') {
      const session = await requireSession(request, response);
      if (!session) return;
      if (session.account.principalType !== 'employee') return sendJson(response, 403, { error: 'Employee access is required.' });
      const payload = await readBody(request);
      const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(payload.image || '');
      if (!match) return sendJson(response, 400, { error: 'Choose a PNG, JPEG, or WebP image.' });
      const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
      const filename = `${crypto.randomUUID()}.${extension}`;
      await fs.writeFile(path.join(uploadDirectory, filename), Buffer.from(match[2], 'base64'));
      return sendJson(response, 201, { url: `/uploads/${filename}` });
    }

    if (segments[0] === 'api' && segments[1] === 'health') return sendJson(response, 200, { status: 'ok' });

    if (segments[0] === 'api' && collections.has(segments[1])) {
      const session = await requireSession(request, response);
      if (!session) return;
      const collection = segments[1];
      const id = segments[2];
      const records = await readCollection(collection);
      if (session.account.principalType === 'patient' && collection === 'staff') return sendJson(response, 403, { error: 'This record is not available in the patient portal.' });
      if (session.account.principalType === 'patient' && request.method !== 'GET') return sendJson(response, 403, { error: 'Patient accounts are read-only.' });
      if (request.method === 'GET') {
        if (session.account.principalType === 'patient') {
          const patients = await readCollection('patients');
          const patient = patients.find((record) => record.id === session.account.principalId);
          if (!patient) return sendJson(response, 403, { error: 'Patient record is not available.' });
          if (collection === 'patients') return sendJson(response, 200, records.filter((record) => record.id === patient.id && (!id || id === patient.id)));
          const nameIsUnique = patients.filter((record) => record.name === patient.name).length === 1;
          const ownRecords = records.filter((record) => record.patientId === patient.id || (!record.patientId && nameIsUnique && record.patient === patient.name));
          return sendJson(response, 200, id ? ownRecords.filter((record) => record.id === id) : ownRecords);
        }
        return sendJson(response, 200, id ? records.filter((record) => record.id === id) : records);
      }
      if (session.account.principalType !== 'employee') return sendJson(response, 403, { error: 'Employee access is required.' });
      if (request.method === 'POST') {
        const payload = await readBody(request);
        if (payload.patient) {
          const patients = await readCollection('patients');
          const matches = patients.filter((patient) => patient.id === payload.patient || patient.name === payload.patient);
          if (matches.length !== 1) return sendJson(response, 400, { error: 'Choose one unique patient from the patient list.' });
          payload.patient = matches[0].name;
          payload.patientId = matches[0].id;
        }
        const record = { ...payload, id: payload.id || crypto.randomUUID(), updatedAt: new Date().toISOString() };
        records.unshift(record);
        await writeCollection(collection, records);
        return sendJson(response, 201, record);
      }
      if (request.method === 'PUT' && id) {
        const payload = await readBody(request);
        if (payload.patient) {
          const patients = await readCollection('patients');
          const matches = patients.filter((patient) => patient.id === payload.patient || patient.name === payload.patient);
          if (matches.length !== 1) return sendJson(response, 400, { error: 'Choose one unique patient from the patient list.' });
          payload.patient = matches[0].name;
          payload.patientId = matches[0].id;
        }
        const index = records.findIndex((record) => record.id === id);
        if (index < 0) return sendJson(response, 404, { error: 'Record not found.' });
        records[index] = { ...records[index], ...payload, id, updatedAt: new Date().toISOString() };
        await writeCollection(collection, records);
        return sendJson(response, 200, records[index]);
      }
      if (request.method === 'DELETE' && id) {
        const remaining = records.filter((record) => record.id !== id);
        if (remaining.length === records.length) return sendJson(response, 404, { error: 'Record not found.' });
        await writeCollection(collection, remaining);
        return sendJson(response, 200, { deleted: true });
      }
      return sendJson(response, 405, { error: 'Method not allowed.' });
    }

    if (segments[0] === 'data' || segments[0] === 'accounts.json' || segments[0] === 'uploads') {
      const session = await requireSession(request, response);
      if (!session) return;
      if (segments[0] !== 'uploads' || session.account.principalType !== 'employee') return sendJson(response, 404, { error: 'Not found.' });
    }

    const requestedPath = segments.length ? segments.join('/') : 'index.html';
    const filePath = path.resolve(root, requestedPath);
    if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== path.join(root, 'index.html')) return sendJson(response, 403, { error: 'Forbidden.' });
    const file = await fs.readFile(filePath);
    response.writeHead(200, { 'content-type': contentTypes[path.extname(filePath)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    response.end(file);
  } catch (error) {
    if (error.code === 'ENOENT') return sendJson(response, 404, { error: 'Not found.' });
    console.error(error);
    return sendJson(response, error instanceof SyntaxError ? 400 : 500, { error: error instanceof SyntaxError ? 'Invalid JSON.' : 'The request could not be completed.' });
  }
});

Promise.all([fs.mkdir(dataDirectory, { recursive: true }), fs.mkdir(uploadDirectory, { recursive: true })]).then(async () => {
  dummyPasswordHash = await hashPassword('not-a-valid-account-password', 'light-hospital-dummy-salt');
  await initializeAuthentication();
  server.listen(port, host, () => console.log(`LIGHT Hospital is running at http://${host}:${port}`));
}).catch((error) => { console.error('LIGHT Hospital could not start.', error); process.exitCode = 1; });
