const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const root = __dirname;
const dataDirectory = path.join(root, 'data');
const port = Number(process.env.PORT) || 4174;
const host = '127.0.0.1';
const collections = new Set(['suspects', 'cases', 'officers']);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

async function sendJson(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(value));
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

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > 100_000) throw new Error('Request body is too large.');
  }
  return JSON.parse(body || '{}');
}

function requiredText(value, label, maxLength = 160) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new Error(`${label} is required and must be no longer than ${maxLength} characters.`);
  }
  return value.trim();
}

function validDate(value, label) {
  const date = requiredText(value, label, 10);
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`${label} must be a valid date.`);
  }
  return date;
}

function validateSuspect(payload) {
  const allowedStatuses = new Set(['Wanted', 'In custody', 'Released', 'Archived']);
  const status = payload.status || 'Wanted';
  if (!allowedStatuses.has(status)) throw new Error('Choose a valid record status.');
  const photo = typeof payload.photo === 'string' ? payload.photo.trim() : '';
  if (photo.length > 1000 || (photo && !/^https:\/\/|^\/portraits\//i.test(photo))) {
    throw new Error('Portraits must use an HTTPS image URL or a local /portraits/ path.');
  }
  return {
    name: requiredText(payload.name, 'Full name', 120),
    alias: typeof payload.alias === 'string' ? payload.alias.trim().slice(0, 120) : '',
    dateOfBirth: validDate(payload.dateOfBirth, 'Date of birth'),
    gender: requiredText(payload.gender, 'Gender', 40),
    status,
    photo
  };
}

function validateCase(payload) {
  const allowedDispositions = new Set(['Under investigation', 'Charged', 'Convicted', 'Acquitted', 'Dismissed', 'Closed']);
  const disposition = payload.disposition || 'Under investigation';
  if (!allowedDispositions.has(disposition)) throw new Error('Choose a valid case status.');
  const caseNumber = requiredText(payload.caseNumber, 'Case number', 40);
  if (!/^[A-Z0-9-]+$/i.test(caseNumber)) throw new Error('Case numbers may contain letters, numbers, and hyphens only.');
  return {
    caseNumber,
    suspectId: requiredText(payload.suspectId, 'Suspect', 80),
    offense: requiredText(payload.offense, 'Offense / charge', 120),
    date: validDate(payload.date, 'Incident date'),
    disposition,
    officerId: requiredText(payload.officerId, 'Investigating officer', 80),
    summary: requiredText(payload.summary, 'Case notes', 1200)
  };
}

function validateOfficer(payload) {
  const email = requiredText(payload.email, 'Email address', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  return {
    name: requiredText(payload.name, 'Full name', 120),
    rank: requiredText(payload.rank, 'Rank / title', 80),
    badge: requiredText(payload.badge, 'Badge number', 40),
    unit: requiredText(payload.unit, 'Unit', 100),
    email,
    phone: requiredText(payload.phone, 'Phone number', 40),
    bio: requiredText(payload.bio, 'Officer bio', 800)
  };
}

const server = http.createServer(async (request, response) => {
  response.setHeader('x-content-type-options', 'nosniff');
  response.setHeader('x-frame-options', 'DENY');
  response.setHeader('referrer-policy', 'no-referrer');
  response.setHeader('content-security-policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
  try {
    const url = new URL(request.url, `http://${host}`);
    const segments = url.pathname.split('/').filter(Boolean);

    if (segments[0] === 'api' && collections.has(segments[1]) && segments.length === 2) {
      const name = segments[1];
      const records = await readCollection(name);
      if (request.method === 'GET') return sendJson(response, 200, records);

      if (name === 'suspects' && request.method === 'POST') {
        const payload = validateSuspect(await readBody(request));
        const record = { id: crypto.randomUUID(), ...payload, createdAt: new Date().toISOString() };
        records.unshift(record);
        await writeCollection(name, records);
        return sendJson(response, 201, record);
      }

      if (name === 'suspects' && request.method === 'PATCH') {
        const payload = await readBody(request);
        const suspect = records.find((item) => item.id === payload.id);
        if (!suspect) return sendJson(response, 404, { error: 'Suspect record not found.' });
        Object.assign(suspect, validateSuspect({ ...suspect, ...payload }));
        await writeCollection(name, records);
        return sendJson(response, 200, suspect);
      }

      if (name === 'cases' && request.method === 'POST') {
        const payload = validateCase(await readBody(request));
        if (!records.every((item) => item.caseNumber.toLowerCase() !== payload.caseNumber.toLowerCase())) {
          return sendJson(response, 409, { error: 'That case number is already in use.' });
        }
        if (!(await readCollection('suspects')).some((item) => item.id === payload.suspectId)) {
          return sendJson(response, 400, { error: 'Choose an existing suspect record.' });
        }
        if (!(await readCollection('officers')).some((item) => item.id === payload.officerId)) {
          return sendJson(response, 400, { error: 'Choose an existing investigating officer.' });
        }
        const record = { id: crypto.randomUUID(), ...payload, createdAt: new Date().toISOString() };
        records.unshift(record);
        await writeCollection(name, records);
        return sendJson(response, 201, record);
      }

      if (name === 'cases' && request.method === 'PATCH') {
        const payload = await readBody(request);
        const record = records.find((item) => item.id === payload.id);
        if (!record) return sendJson(response, 404, { error: 'Case record not found.' });
        const updated = validateCase({ ...record, ...payload });
        if (!records.every((item) => item.id === record.id || item.caseNumber.toLowerCase() !== updated.caseNumber.toLowerCase())) {
          return sendJson(response, 409, { error: 'That case number is already in use.' });
        }
        if (!(await readCollection('suspects')).some((item) => item.id === updated.suspectId)) {
          return sendJson(response, 400, { error: 'Choose an existing suspect record.' });
        }
        if (!(await readCollection('officers')).some((item) => item.id === updated.officerId)) {
          return sendJson(response, 400, { error: 'Choose an existing investigating officer.' });
        }
        Object.assign(record, updated);
        await writeCollection(name, records);
        return sendJson(response, 200, record);
      }

      if (name === 'officers' && request.method === 'POST') {
        const payload = validateOfficer(await readBody(request));
        if (!records.every((item) => item.badge.toLowerCase() !== payload.badge.toLowerCase())) {
          return sendJson(response, 409, { error: 'That badge number is already in use.' });
        }
        const record = { id: crypto.randomUUID(), ...payload, createdAt: new Date().toISOString() };
        records.unshift(record);
        await writeCollection(name, records);
        return sendJson(response, 201, record);
      }

      if (name === 'officers' && request.method === 'PATCH') {
        const payload = await readBody(request);
        const officer = records.find((item) => item.id === payload.id);
        if (!officer) return sendJson(response, 404, { error: 'Officer record not found.' });
        const updated = validateOfficer({ ...officer, ...payload });
        if (!records.every((item) => item.id === officer.id || item.badge.toLowerCase() !== updated.badge.toLowerCase())) {
          return sendJson(response, 409, { error: 'That badge number is already in use.' });
        }
        Object.assign(officer, updated);
        await writeCollection(name, records);
        return sendJson(response, 200, officer);
      }

      response.setHeader('allow', name === 'suspects' ? 'GET, POST, PATCH' : 'GET, POST, PATCH');
      return sendJson(response, 405, { error: 'Method not allowed.' });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return sendJson(response, 405, { error: 'Method not allowed.' });
    }
    const relativePath = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
    const filePath = path.resolve(root, relativePath);
    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
      return sendJson(response, 404, { error: 'Not found.' });
    }
    const body = await fs.readFile(filePath);
    response.writeHead(200, { 'content-type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    if (error.code === 'ENOENT') return sendJson(response, 404, { error: 'Not found.' });
    if (error instanceof SyntaxError || error.message === 'Request body is too large.') {
      return sendJson(response, 400, { error: error.message === 'Request body is too large.' ? error.message : 'Invalid JSON request body.' });
    }
    if (error instanceof Error && /required|valid|must|Portraits|Choose/i.test(error.message)) {
      return sendJson(response, 400, { error: error.message });
    }
    console.error(error);
    return sendJson(response, 500, { error: 'The request could not be completed.' });
  }
});

server.listen(port, host, () => {
  console.log(`Casebook prototype listening at http://${host}:${port}`);
});
