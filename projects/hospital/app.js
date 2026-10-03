const collections = ['patients', 'staff', 'appointments', 'consultations', 'investigations', 'prescriptions', 'wards', 'payments'];
const titles = { overview: 'Overview', patients: 'Patients', staff: 'Care team', appointments: 'Appointments', consultations: 'Consultations', investigations: 'Lab investigations', prescriptions: 'Prescriptions', wards: 'Wards & beds', payments: 'Payments', team: 'Care team', access: 'Accounts & access', accounts: 'Accounts', password: 'Change password', 'patient-portal': 'My health', reports: 'Reports' };
const icons = { patients: '♡', appointments: '▦', consultations: '✳', investigations: '⌕', prescriptions: '▤', wards: '▥', payments: '＄', team: '♧' };
const definitions = {
  patients: { add: 'Add patient', fields: [['name', 'Full name', 'text', true], ['dateOfBirth', 'Date of birth', 'date', true], ['gender', 'Gender', 'select', true, ['Female', 'Male', 'Non-binary', 'Prefer not to say']], ['phone', 'Phone number', 'tel', true], ['email', 'Email address', 'email'], ['bloodGroup', 'Blood group', 'select', false, ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']], ['address', 'Address', 'text'], ['photo', 'Patient photo', 'file']] },
  staff: { add: 'Add team member', fields: [['name', 'Full name', 'text', true], ['role', 'Role', 'select', true, ['Physician', 'Nurse', 'Lab technician', 'Pharmacist', 'Administrator']], ['department', 'Department', 'text', true], ['specialty', 'Specialty', 'text', true], ['phone', 'Phone number', 'tel'], ['email', 'Email address', 'email'], ['photo', 'Profile photo', 'file']] },
  appointments: { add: 'Book appointment', fields: [['patient', 'Patient', 'text', true], ['clinician', 'Care professional', 'text', true], ['date', 'Date', 'date', true], ['time', 'Time', 'time', true], ['type', 'Visit type', 'select', true, ['General consultation', 'Follow-up', 'Lab review', 'Wellness visit', 'Urgent care']], ['status', 'Status', 'select', true, ['Scheduled', 'Checked in', 'Completed', 'Cancelled']], ['notes', 'Notes', 'textarea']] },
  consultations: { add: 'New consultation', fields: [['patient', 'Patient', 'text', true], ['clinician', 'Care professional', 'text', true], ['date', 'Date', 'date', true], ['diagnosis', 'Assessment / diagnosis', 'text', true], ['vitals', 'Vitals', 'text'], ['notes', 'Clinical notes', 'textarea']] },
  investigations: { add: 'Order investigation', fields: [['patient', 'Patient', 'text', true], ['test', 'Investigation', 'text', true], ['orderedBy', 'Ordered by', 'text', true], ['date', 'Date ordered', 'date', true], ['status', 'Status', 'select', true, ['Ordered', 'Sample collected', 'In progress', 'Results ready']], ['result', 'Result / notes', 'textarea']] },
  prescriptions: { add: 'New prescription', fields: [['patient', 'Patient', 'text', true], ['medication', 'Medication', 'text', true], ['dose', 'Dose', 'text', true], ['frequency', 'Frequency', 'text', true], ['prescriber', 'Prescriber', 'text', true], ['date', 'Date', 'date', true], ['status', 'Status', 'select', true, ['Active', 'Dispensed', 'Completed']], ['notes', 'Instructions', 'textarea']] },
  wards: { add: 'Add bed', fields: [['ward', 'Ward', 'text', true], ['bed', 'Bed number', 'text', true], ['patient', 'Patient', 'text'], ['status', 'Status', 'select', true, ['Available', 'Occupied', 'Cleaning', 'Reserved']], ['admitted', 'Admission date', 'date'], ['notes', 'Notes', 'textarea']] },
  payments: { add: 'Record payment', fields: [['patient', 'Patient', 'text', true], ['description', 'Description', 'text', true], ['amount', 'Amount', 'number', true], ['method', 'Payment method', 'select', true, ['Card', 'Cash', 'Transfer', 'Insurance']], ['date', 'Date', 'date', true], ['status', 'Status', 'select', true, ['Paid', 'Pending', 'Overdue']]] }
};
const definitionsAccounts = { add: 'Issue sign-in', fields: [['principalType', 'Account type', 'select', true, ['employee', 'patient']], ['principalId', 'Person', 'select', true, []], ['password', 'Temporary password (12+ characters)', 'password', true]] };
definitions.accounts = definitionsAccounts;
definitions.password = { add: 'Change password', fields: [['currentPassword', 'Current password', 'password', true], ['password', 'New password (12+ characters)', 'password', true], ['confirmPassword', 'Confirm new password', 'password', true]] };
const columns = {
  patients: [['name', 'Patient'], ['patientId', 'Patient ID'], ['age', 'Age'], ['gender', 'Gender'], ['phone', 'Phone'], ['bloodGroup', 'Blood group'], ['status', 'Status']],
  staff: [['name', 'Team member'], ['role', 'Role'], ['department', 'Department'], ['specialty', 'Specialty'], ['phone', 'Phone'], ['status', 'Status']],
  appointments: [['patient', 'Patient'], ['clinician', 'Care professional'], ['date', 'Date'], ['time', 'Time'], ['type', 'Visit type'], ['status', 'Status']],
  consultations: [['patient', 'Patient'], ['clinician', 'Care professional'], ['date', 'Date'], ['diagnosis', 'Assessment'], ['vitals', 'Vitals']],
  investigations: [['patient', 'Patient'], ['test', 'Investigation'], ['orderedBy', 'Ordered by'], ['date', 'Date'], ['status', 'Status']],
  prescriptions: [['patient', 'Patient'], ['medication', 'Medication'], ['dose', 'Dose'], ['frequency', 'Frequency'], ['prescriber', 'Prescriber'], ['status', 'Status']],
  wards: [['ward', 'Ward'], ['bed', 'Bed'], ['patient', 'Patient'], ['admitted', 'Admission date'], ['status', 'Status']],
  payments: [['patient', 'Patient'], ['description', 'Description'], ['amount', 'Amount'], ['method', 'Method'], ['date', 'Date'], ['status', 'Status']]
};
const state = Object.fromEntries(collections.map((collection) => [collection, []]));
state.accounts = [];
let currentUser = null;
let loginRole = 'employee';
let activePage = 'overview';
let editingRecord = null;
let formCollection = null;
let toastTimer;
const pageContent = document.querySelector('#page-content');
const modalBackdrop = document.querySelector('#modal-backdrop');
const form = document.querySelector('#record-form');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
function initials(name = '') { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '??'; }
function avatar(record, extraClass = '') {
  const image = record.photo ? `<img src="${escapeHtml(record.photo)}" alt="">` : escapeHtml(initials(record.name || record.patient || ''));
  return `<span class="avatar ${extraClass}">${image}</span>`;
}
function displayDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? escapeHtml(value) : date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}
function ageFromDate(dateOfBirth) {
  if (!dateOfBirth) return '—';
  const birth = new Date(`${dateOfBirth}T00:00:00`);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return `${age} yrs`;
}
function statusPill(status) {
  const value = status || 'Active';
  const key = value.toLowerCase().replace(/\s+/g, '-');
  return `<span class="status-pill status-${escapeHtml(key)}">${escapeHtml(value)}</span>`;
}
function titleCase(value) { return String(value || '').replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()); }
async function api(collection, options = {}) {
  const response = await fetch(`/api/${collection}${options.id ? `/${encodeURIComponent(options.id)}` : ''}`, { method: options.method || 'GET', headers: options.body ? { 'content-type': 'application/json' } : undefined, body: options.body ? JSON.stringify(options.body) : undefined });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}
async function loadData() {
  const allowedCollections = currentUser.principalType === 'patient' ? ['patients', 'appointments', 'investigations', 'prescriptions', 'payments', 'consultations'] : collections;
  await Promise.all(allowedCollections.map(async (collection) => { state[collection] = await api(collection); }));
  if (currentUser.principalType === 'employee' && currentUser.accessRole === 'admin') state.accounts = await api('auth/accounts');
  updateNavCounts();
  renderPage();
}
function setLoginMessage(message = '') {
  const error = document.querySelector('#login-error');
  error.textContent = message;
  error.hidden = !message;
}
function applyRoleNavigation() {
  const isPatient = currentUser.principalType === 'patient';
  const patientPages = new Set(['patient-portal', 'patients', 'appointments', 'investigations', 'prescriptions', 'payments']);
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.hidden = isPatient ? !patientPages.has(item.dataset.page) : item.classList.contains('patient-only') || (item.classList.contains('employee-admin-only') && currentUser.accessRole !== 'admin');
  });
  document.querySelector('.sidebar-bottom .help-card').hidden = isPatient;
  document.querySelector('#sidebar-name').textContent = currentUser.name;
  document.querySelector('#sidebar-role').textContent = isPatient ? 'Patient portal' : currentUser.accessRole === 'admin' ? 'Administrator' : 'Care team';
  document.querySelector('#sidebar-avatar').textContent = initials(currentUser.name);
  document.querySelector('.top-avatar').textContent = initials(currentUser.name);
  document.querySelector('.notification-button').hidden = isPatient;
}
async function openWorkspace(user) {
  currentUser = user;
  document.querySelector('#login-screen').hidden = true;
  document.querySelector('#app-shell').hidden = false;
  applyRoleNavigation();
  const requestedPage = location.hash.slice(1);
  activePage = user.principalType === 'patient' ? 'patient-portal' : Object.prototype.hasOwnProperty.call(titles, requestedPage) && !['patient-portal', 'staff'].includes(requestedPage) && (requestedPage !== 'access' || user.accessRole === 'admin') ? requestedPage : 'overview';
  await loadData();
  history.replaceState(null, '', `#${activePage}`);
}
function showLogin() {
  currentUser = null;
  document.querySelector('#app-shell').hidden = true;
  document.querySelector('#login-screen').hidden = false;
  document.querySelector('#login-form').reset();
  document.querySelector('#login-form [name="email"]').focus();
}
document.querySelectorAll('[data-login-role]').forEach((button) => button.addEventListener('click', () => {
  loginRole = button.dataset.loginRole;
  document.querySelectorAll('[data-login-role]').forEach((item) => item.classList.toggle('selected', item === button));
  setLoginMessage();
}));
document.querySelector('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('[type="submit"]');
  button.disabled = true;
  setLoginMessage();
  try {
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(new FormData(event.currentTarget).entries()), principalType: loginRole }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Sign in failed.');
    await openWorkspace(result);
  } catch (error) { setLoginMessage(error.message); }
  finally { button.disabled = false; }
});
document.querySelector('#logout-button').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  history.replaceState(null, '', location.pathname);
  showLogin();
});
document.querySelector('#password-button').addEventListener('click', () => openForm('password'));
async function bootstrap() {
  try {
    const response = await fetch('/api/auth/session');
    if (!response.ok) return showLogin();
    await openWorkspace(await response.json());
  } catch { showLogin(); }
}
function updateNavCounts() {
  document.querySelectorAll('[data-count]').forEach((badge) => { badge.textContent = state[badge.dataset.count]?.length || ''; });
}
function pageHeading(title, description, actions = '') {
  return `<div class="page-heading"><div><span class="eyebrow">LIGHT HOSPITAL · CARE, CLEARLY</span><h1>${title}</h1><p>${description}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ''}</div>`;
}
function metric(label, value, note, icon, positive = '') {
  return `<div class="metric"><div class="metric-top"><span class="metric-label">${label}</span><span class="metric-icon">${icon}</span></div><div class="metric-value">${value}</div><div class="metric-note"><span class="positive">${positive}</span>${note}</div></div>`;
}
function renderMonthlyPayments() {
  const currentMonth = new Date();
  const months = Array.from({ length: 6 }, (_, index) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 5 + index, 1));
  const entries = months.map((month) => {
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    const payments = state.payments.filter((payment) => payment.date?.slice(0, 7) === key);
    const due = payments.reduce((total, payment) => total + Number(payment.amount || 0), 0);
    const paid = payments.filter((payment) => payment.status === 'Paid').reduce((total, payment) => total + Number(payment.amount || 0), 0);
    return { label: month.toLocaleDateString('en-US', { month: 'short' }), due, paid, balance: Math.max(0, due - paid) };
  });
  const totals = entries.reduce((result, month) => ({ due: result.due + month.due, paid: result.paid + month.paid, balance: result.balance + month.balance }), { due: 0, paid: 0, balance: 0 });
  const maximum = Math.max(1, ...entries.flatMap((month) => [month.due, month.paid, month.balance]));
  const formatAmount = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  const bars = entries.map((month) => `<div class="payment-month"><div class="payment-bar-area" aria-label="${month.label}: due ${formatAmount(month.due)}, paid ${formatAmount(month.paid)}, balance ${formatAmount(month.balance)}"><div class="payment-bar-group"><span class="payment-bar bar-due" style="height:${month.due ? Math.max(2, month.due / maximum * 100) : 0}%" title="Due ${formatAmount(month.due)}"></span><span class="payment-bar bar-paid" style="height:${month.paid ? Math.max(2, month.paid / maximum * 100) : 0}%" title="Paid ${formatAmount(month.paid)}"></span><span class="payment-bar bar-balance" style="height:${month.balance ? Math.max(2, month.balance / maximum * 100) : 0}%" title="Balance ${formatAmount(month.balance)}"></span></div></div><span class="payment-month-label">${month.label}</span></div>`).join('');
  return `<section class="panel monthly-payments"><div class="panel-header"><div class="panel-title"><strong>Monthly payments</strong><small>Due, collected, and outstanding balance</small></div><span class="payment-range">Last 6 months</span></div><div class="payment-summary"><div class="payment-total"><span><i class="bar-due"></i>Total due</span><strong>${formatAmount(totals.due)}</strong></div><div class="payment-total"><span><i class="bar-paid"></i>Total paid</span><strong>${formatAmount(totals.paid)}</strong></div><div class="payment-total"><span><i class="bar-balance"></i>Balance</span><strong>${formatAmount(totals.balance)}</strong></div></div><div class="payment-chart" role="group" aria-label="Monthly payment details for the last six months">${bars}</div><div class="payment-legend"><span><i class="bar-due"></i>Due</span><span><i class="bar-paid"></i>Paid</span><span><i class="bar-balance"></i>Balance</span></div></section>`;
}
function renderOverview() {
  const now = new Date();
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const isUpcoming = (record) => !['Cancelled', 'Completed'].includes(record.status) && new Date(`${record.date}T${record.time || '23:59'}`) >= now;
  const appointmentsToday = state.appointments.filter((record) => record.date === today && isUpcoming(record));
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning, Maya' : hour < 18 ? 'Good afternoon, Maya' : 'Good evening, Maya';
  const greetingIcon = hour < 12 ? '☀' : hour < 18 ? '✦' : '☾';
  const activePatients = state.patients.filter((record) => record.status !== 'Archived').length;
  const pendingLabs = state.investigations.filter((record) => !['Results ready', 'Completed'].includes(record.status)).length;
  const occupiedBeds = state.wards.filter((record) => record.status === 'Occupied').length;
  const monthlyPayments = renderMonthlyPayments();
  const scheduled = [...state.appointments].filter(isUpcoming).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).slice(0, 5);
  const recent = [...state.patients].slice(0, 4);
  const scheduleRows = scheduled.length ? scheduled.map((record) => `<div class="appointment-row"><div class="appointment-time">${escapeHtml(record.time || '—')}</div>${avatar({ name: record.patient })}<div class="appointment-person"><strong>${escapeHtml(record.patient)}</strong><small>${escapeHtml(record.clinician)} · ${displayDate(record.date)}</small></div><span class="appointment-type">${escapeHtml(record.type || 'Visit')}</span></div>`).join('') : '<div class="empty-state">No appointments yet.</div>';
  const patientRows = recent.length ? recent.map((record) => `<div class="activity-row">${avatar(record)}<div class="activity-copy"><strong>${escapeHtml(record.name)}</strong><small>${escapeHtml(record.patientId || 'New patient')} · ${escapeHtml(record.phone || 'No phone')}</small></div><span class="activity-date">${ageFromDate(record.dateOfBirth)}</span></div>`).join('') : '<div class="empty-state">Your first patient is one click away.</div>';
  const subtitle = hour < 12 ? 'A calm start to a day of thoughtful care.' : hour < 18 ? 'Everything your team needs for the day ahead.' : 'Today\'s work, wrapped up in one clear view.';
  return `${pageHeading(`${greeting} <span aria-hidden="true">${greetingIcon}</span>`, subtitle, '<button class="button button-secondary" data-export="overview"><span class="button-icon">↓</span> Export snapshot</button><button class="button button-primary" data-add="appointments"><span class="button-icon">＋</span> New appointment</button>')}
    <div class="metrics">${metric('Registered patients', activePatients, ' in your care', '♡', '● ')}${metric('Appointments today', appointmentsToday.length, ' scheduled for today', '▦', '● ')}${metric('Lab work in progress', pendingLabs, ' awaiting results', '⌕', '')}${metric('Beds occupied', `${occupiedBeds}<span style="font-size:13px;color:#9aa39c;font-weight:500"> / ${state.wards.length}</span>`, ' across all wards', '▥', '')}</div>
    <div class="dashboard-grid"><section class="panel"><div class="panel-header"><div class="panel-title"><strong>Upcoming appointments</strong><small>A quick look at the care calendar</small></div><button class="text-link" data-nav="appointments">View calendar ↗</button></div><div class="appointment-list">${scheduleRows}</div></section><section class="panel"><div class="panel-header"><div class="panel-title"><strong>Recently added patients</strong><small>People who joined your care team</small></div><button class="text-link" data-nav="patients">All patients ↗</button></div><div class="activity-list">${patientRows}</div></section></div>
    ${monthlyPayments}
    <h2 class="section-heading">A little shortcut</h2><div class="quick-actions"><button class="quick-action" data-add="patients"><span class="quick-icon">♡</span><span>Register patient</span></button><button class="quick-action" data-add="consultations"><span class="quick-icon">✳</span><span>Start consultation</span></button><button class="quick-action" data-add="investigations"><span class="quick-icon">⌕</span><span>Order a test</span></button><button class="quick-action" data-add="payments"><span class="quick-icon">＄</span><span>Record payment</span></button></div>`;
}
function renderPatientPortal() {
  const patient = state.patients[0];
  if (!patient) return `${pageHeading('My health', 'Your personal care space.', '')}<div class="empty-state"><strong>Your patient record is unavailable.</strong>Please contact LIGHT Hospital reception.</div>`;
  const nextVisit = state.appointments.filter((item) => !['Cancelled', 'Completed'].includes(item.status) && new Date(`${item.date}T${item.time || '23:59'}`) >= new Date()).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0];
  const openLabs = state.investigations.filter((item) => !['Results ready', 'Completed'].includes(item.status)).length;
  const activePrescriptions = state.prescriptions.filter((item) => item.status === 'Active').length;
  const balance = state.payments.filter((item) => item.status !== 'Paid').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const visit = nextVisit ? `<div class="summary-row"><span>${displayDate(nextVisit.date)} · ${escapeHtml(nextVisit.time || '')}</span><strong>${escapeHtml(nextVisit.type || 'Appointment')}</strong></div>` : '<div class="empty-state">No upcoming visits.</div>';
  return `${pageHeading(`Hello, ${escapeHtml(patient.name.split(' ')[0])}`, 'Your health information, just for you.', '')}<div class="patient-welcome"><div>${avatar(patient, 'patient-portrait')}<div><span class="eyebrow">PATIENT ID · ${escapeHtml(patient.patientId || '')}</span><h2>${escapeHtml(patient.name)}</h2><p>${escapeHtml(patient.bloodGroup || 'Blood group not recorded')} · ${ageFromDate(patient.dateOfBirth)}</p></div></div><button class="button button-secondary" data-nav="patients">View my details ↗</button></div><div class="metrics">${metric('Upcoming visit', nextVisit ? displayDate(nextVisit.date) : 'None', nextVisit ? ` with ${escapeHtml(nextVisit.clinician)}` : ' currently scheduled', '▦', '')}${metric('Lab results pending', openLabs, ' investigations in progress', '⌕', '')}${metric('Active prescriptions', activePrescriptions, ' current medications', '▤', '')}${metric('Outstanding balance', new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(balance), ' unpaid charges', '＄', '')}</div><div class="dashboard-grid"><section class="panel"><div class="panel-header"><div class="panel-title"><strong>Next appointment</strong><small>Your upcoming care</small></div><button class="text-link" data-nav="appointments">All appointments ↗</button></div><div class="report-summary">${visit}</div></section><section class="panel"><div class="panel-header"><div class="panel-title"><strong>Recent lab results</strong><small>Available to you and your care team</small></div><button class="text-link" data-nav="investigations">View investigations ↗</button></div><div class="report-summary">${state.investigations.filter((item) => item.status === 'Results ready').slice(0, 3).map((item) => `<div class="summary-row"><span>${escapeHtml(item.test)}</span><strong>${displayDate(item.date)}</strong></div>`).join('') || '<div class="empty-state">No results are ready yet.</div>'}</div></section></div>`;
}
function valueForColumn(record, key, collection) {
  if (key === 'name' || key === 'patient') return `<div class="person-cell">${avatar({ name: record[key], photo: key === 'name' ? record.photo : '' }, 'avatar-small')}<span><strong>${escapeHtml(record[key] || '—')}</strong>${key === 'name' ? `<small>${escapeHtml(record.email || '')}</small>` : ''}</span></div>`;
  if (key === 'patientId') return escapeHtml(record.patientId || '—');
  if (key === 'age') return ageFromDate(record.dateOfBirth);
  if (key === 'date' || key === 'admitted') return displayDate(record[key]);
  if (key === 'amount') return record.amount === undefined ? '—' : new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(Number(record.amount));
  if (key === 'status') return statusPill(record.status);
  return escapeHtml(record[key] || '—');
}
function matchesSearch(record, query) { return Object.values(record).some((value) => String(value || '').toLowerCase().includes(query)); }
function renderCollection(collection) {
  const definition = definitions[collection];
  const title = titles[collection];
  const records = state[collection];
  const canManage = currentUser.principalType === 'employee';
  const columnsForPage = columns[collection];
  const rows = records.map((record) => `<tr data-record-id="${escapeHtml(record.id)}">${columnsForPage.map(([key]) => `<td>${valueForColumn(record, key, collection)}</td>`).join('')}${canManage ? `<td><button class="status-icon-button" data-edit="${escapeHtml(record.id)}" aria-label="Edit record">···</button></td>` : ''}</tr>`).join('');
  const lower = title.toLowerCase();
  const description = currentUser.principalType === 'patient' ? 'Only you can see these personal records.' : collection === 'patients' ? 'Every patient, one thoughtful record at a time.' : `Keep ${lower} clear, current, and connected.`;
  const actions = canManage ? `<button class="button button-secondary" data-export="${collection}"><span class="button-icon">↓</span> Export</button><button class="button button-primary" data-add="${collection}"><span class="button-icon">＋</span> ${definition.add}</button>` : '';
  return `${pageHeading(collection === 'patients' && currentUser.principalType === 'patient' ? 'My details' : title, description, actions)}
    <div class="toolbar"><label class="search-wrap"><span>⌕</span><input class="search-input" id="table-search" type="search" placeholder="Search ${lower}..." aria-label="Search ${lower}"></label><select class="filter-select" id="status-filter" aria-label="Filter by status"><option value="">All records (${records.length})</option>${[...new Set(records.map((record) => record.status).filter(Boolean))].map((status) => `<option>${escapeHtml(status)}</option>`).join('')}</select></div>
    <section class="table-panel"><div class="table-scroll"><table><thead><tr>${columnsForPage.map(([, label]) => `<th>${label}</th>`).join('')}${canManage ? '<th aria-label="Actions"></th>' : ''}</tr></thead><tbody id="records-body">${rows || `<tr><td colspan="${columnsForPage.length}" class="empty-state">No records to show.</td></tr>`}</tbody></table></div><div class="pagination" id="table-count">Showing ${records.length} ${records.length === 1 ? 'record' : 'records'}</div></section>`;
}
function renderAccounts() {
  const rows = state.accounts.map((account) => `<tr><td><div class="person-cell">${avatar({ name: account.name }, 'avatar-small')}<span><strong>${escapeHtml(account.name)}</strong><small>${escapeHtml(account.email)}</small></span></div></td><td>${account.principalType === 'patient' ? 'Patient' : 'Employee'}</td><td>${account.accessRole === 'admin' ? 'Administrator' : 'Standard access'}</td><td>${account.active ? statusPill('Active') : statusPill('Inactive')}</td><td>${account.id === currentUser.id ? '<span class="current-account">You</span>' : `<button class="button button-quiet revoke-account" data-revoke="${escapeHtml(account.id)}">Revoke</button>`}</td></tr>`).join('');
  return `${pageHeading('Accounts & access', 'Issue and revoke individual hospital sign-ins.', `<button class="button button-primary" data-add="accounts"><span class="button-icon">＋</span> Issue sign-in</button>`)}<div class="access-note"><span>⌑</span><p>Each person gets a separate account. Give temporary passwords directly to the person and ask them to change them before use.</p></div><section class="table-panel"><div class="table-scroll"><table><thead><tr><th>Account</th><th>For</th><th>Access</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><div class="pagination">${state.accounts.length} issued sign-ins</div></section>`;
}
function renderTeam() {
  const records = state.staff;
  const teamStats = ['Physician', 'Nurse', 'Lab technician', 'Pharmacist'].map((role) => [role, records.filter((record) => record.role === role).length]);
  return `${pageHeading('Care team', 'Meet the people making every visit feel a little brighter.', `<button class="button button-secondary" data-export="staff"><span class="button-icon">↓</span> Export</button><button class="button button-primary" data-add="staff"><span class="button-icon">＋</span> Add team member</button>`)}<div class="metrics">${teamStats.map(([role, count]) => metric(role, count, ' on your team', '♧', '')).join('')}</div>${renderCollection('staff').replace(/<div class="page-heading">[\s\S]*?<\/div>\n    <div class="toolbar">/, '<div class="toolbar">')}`;
}
function renderReports() {
  const totalPayments = state.payments.filter((record) => record.status === 'Paid').reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const completedVisits = state.consultations.length;
  const readyResults = state.investigations.filter((record) => record.status === 'Results ready').length;
  const occupied = state.wards.filter((record) => record.status === 'Occupied').length;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthStats = Array.from({ length: 6 }, (_, index) => { const date = new Date(); date.setMonth(date.getMonth() - (5 - index)); const month = date.getMonth(); const appointments = state.appointments.filter((item) => new Date(`${item.date}T00:00:00`).getMonth() === month).length; const payments = state.payments.filter((item) => new Date(`${item.date}T00:00:00`).getMonth() === month).length; return { name: monthNames[month], appointments, payments }; });
  const max = Math.max(1, ...monthStats.flatMap((item) => [item.appointments, item.payments]));
  const bars = monthStats.map((item) => `<div class="bar-group"><div class="bar-pair"><span class="bar" style="height:${Math.max(5, item.appointments / max * 100)}%"></span><span class="bar" style="height:${Math.max(5, item.payments / max * 100)}%"></span></div><span class="bar-label">${item.name}</span></div>`).join('');
  return `${pageHeading('Reports & insights', 'A simple pulse on the work happening across your hospital.', '<button class="button button-primary" data-export="all"><span class="button-icon">↓</span> Export data</button>')}<div class="report-grid"><div class="report-card"><small>Paid revenue recorded</small><strong>${new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalPayments)}</strong><span>From ${state.payments.length} payment records</span></div><div class="report-card"><small>Consultations logged</small><strong>${completedVisits}</strong><span>In the clinical record</span></div><div class="report-card"><small>Results ready</small><strong>${readyResults}</strong><span>Of ${state.investigations.length} lab investigations</span></div></div><div class="report-layout"><section class="panel bar-chart"><div class="bar-chart-title">Activity at a glance</div><div class="bars">${bars}</div><div class="legend"><span><i></i>Appointments</span><span><i></i>Payments recorded</span></div></section><section class="panel report-summary"><div class="panel-title"><strong>Hospital snapshot</strong><small>Current operational totals</small></div><div class="summary-row"><span>Registered patients</span><strong>${state.patients.length}</strong></div><div class="summary-row"><span>Care team members</span><strong>${state.staff.length}</strong></div><div class="summary-row"><span>Occupied beds</span><strong>${occupied} / ${state.wards.length}</strong></div><div class="summary-row"><span>Active prescriptions</span><strong>${state.prescriptions.filter((item) => item.status === 'Active').length}</strong></div></section></div>`;
}
function renderPage() {
  document.querySelector('#crumb-current').textContent = titles[activePage];
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.page === activePage));
  pageContent.innerHTML = activePage === 'overview' && currentUser.principalType === 'patient' ? renderPatientPortal() : activePage === 'patient-portal' ? renderPatientPortal() : activePage === 'access' ? renderAccounts() : activePage === 'overview' ? renderOverview() : activePage === 'reports' ? renderReports() : activePage === 'team' ? renderTeam() : renderCollection(activePage);
  bindPageEvents();
}
function bindPageEvents() {
  pageContent.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => openForm(button.dataset.add)));
  pageContent.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.nav)));
  pageContent.querySelectorAll('[data-export]').forEach((button) => button.addEventListener('click', () => exportData(button.dataset.export)));
  pageContent.querySelectorAll('[data-revoke]').forEach((button) => button.addEventListener('click', async () => {
    if (!confirm('Revoke this person\'s sign-in? They will lose access immediately.')) return;
    try { await api('auth/accounts', { method: 'DELETE', id: button.dataset.revoke }); await loadData(); showToast('Sign-in revoked.'); }
    catch (error) { showToast(error.message); }
  }));
  pageContent.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => openForm(activePage === 'team' ? 'staff' : activePage, state[activePage === 'team' ? 'staff' : activePage].find((record) => record.id === button.dataset.edit))));
  const search = pageContent.querySelector('#table-search');
  const filter = pageContent.querySelector('#status-filter');
  if (search) { search.addEventListener('input', filterTable); filter.addEventListener('change', filterTable); }
}
function filterTable() {
  const query = pageContent.querySelector('#table-search').value.trim().toLowerCase();
  const status = pageContent.querySelector('#status-filter').value;
  let visible = 0;
  pageContent.querySelectorAll('#records-body tr').forEach((row) => {
    const record = state[activePage === 'team' ? 'staff' : activePage].find((item) => item.id === row.dataset.recordId);
    const show = record && matchesSearch(record, query) && (!status || record.status === status);
    row.hidden = !show;
    if (show) visible += 1;
  });
  pageContent.querySelector('#table-count').textContent = `Showing ${visible} ${visible === 1 ? 'record' : 'records'}`;
}
function navigate(page) {
  if (!titles[page]) return;
  if (currentUser.principalType === 'patient' && !['patient-portal', 'patients', 'appointments', 'investigations', 'prescriptions', 'payments'].includes(page)) return;
  if (page === 'access' && currentUser.accessRole !== 'admin') return;
  activePage = page;
  document.querySelector('#sidebar').classList.remove('open');
  renderPage();
  history.replaceState(null, '', `#${page}`);
}
function fieldMarkup([name, label, type, required, options]) {
  const fullWidth = ['textarea', 'file'].includes(type) ? ' full-width' : '';
  let control;
  if (name === 'patient') control = `<select class="field-control" name="patient" ${required ? 'required' : ''}><option value="">${required ? 'Choose patient' : 'No patient assigned'}</option>${state.patients.map((patient) => `<option value="${escapeHtml(patient.id)}">${escapeHtml(patient.name)} · ${escapeHtml(patient.patientId || '')}</option>`).join('')}</select>`;
  else if (type === 'select') control = `<select class="field-control" name="${name}" ${required ? 'required' : ''}><option value="">Choose ${label.toLowerCase()}</option>${options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('')}</select>`;
  else if (type === 'textarea') control = `<textarea class="field-control" name="${name}" rows="3" ${required ? 'required' : ''}></textarea>`;
  else if (type === 'file') control = `<input class="field-control" type="file" name="${name}" accept="image/png,image/jpeg,image/webp"><span class="field-help">PNG, JPEG or WebP · max 5 MB</span>`;
  else control = `<input class="field-control" type="${type}" name="${name}" ${required ? 'required' : ''} ${type === 'number' ? 'min="0" step="0.01"' : ''} ${type === 'password' ? 'minlength="12" maxlength="256" autocomplete="new-password"' : ''}>`;
  return `<div class="form-field${fullWidth}"><label>${label}${required ? ' *' : ''}</label>${control}</div>`;
}
function populateAccountPeople(principalType) {
  const select = form.elements.namedItem('principalId');
  const collection = principalType === 'employee' ? state.staff : state.patients;
  const existing = new Set(state.accounts.filter((account) => account.principalType === principalType).map((account) => account.principalId));
  const people = collection.filter((person) => person.email && !existing.has(person.id));
  select.innerHTML = `<option value="">Choose a person</option>${people.map((person) => `<option value="${escapeHtml(person.id)}">${escapeHtml(person.name)} · ${escapeHtml(person.email)}</option>`).join('')}`;
  select.disabled = people.length === 0;
}
function openForm(collection, record = null) {
  formCollection = collection;
  editingRecord = record ? { collection, ...record } : null;
  document.querySelector('#modal-eyebrow').textContent = record ? `EDIT ${titles[collection].toUpperCase()}` : `NEW ${titles[collection].toUpperCase()}`;
  document.querySelector('#modal-title').textContent = record ? `Edit ${titles[collection].toLowerCase().replace(/s$/, '')}` : definitions[collection].add;
  document.querySelector('#form-fields').innerHTML = definitions[collection].fields.map(fieldMarkup).join('');
  if (collection === 'accounts') {
    const principalType = form.elements.namedItem('principalType');
    populateAccountPeople(principalType.value);
    principalType.addEventListener('change', () => populateAccountPeople(principalType.value));
  }
  if (record) definitions[collection].fields.forEach(([name]) => { const input = form.elements.namedItem(name); if (input && input.type !== 'file') input.value = name === 'patient' ? record.patientId || state.patients.find((patient) => patient.name === record.patient)?.id || '' : record[name] || ''; });
  modalBackdrop.hidden = false;
  const firstField = document.querySelector('#form-fields input, #form-fields select, #form-fields textarea');
  firstField?.focus();
}
function closeForm() { modalBackdrop.hidden = true; form.reset(); editingRecord = null; formCollection = null; }
async function uploadPhoto(file) {
  if (!file) return undefined;
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Use a PNG, JPEG or WebP image smaller than 5 MB.');
  const image = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Could not read this image.')); reader.readAsDataURL(file); });
  const response = await fetch('/api/upload', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ image }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Photo upload failed.');
  return result.url;
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const collection = formCollection;
    const isEditing = Boolean(editingRecord);
    const payload = Object.fromEntries(new FormData(form).entries());
    if (collection === 'password') {
      if (payload.password !== payload.confirmPassword) throw new Error('The new passwords do not match.');
      await api('auth/password', { method: 'POST', body: { currentPassword: payload.currentPassword, password: payload.password } });
      closeForm();
      showToast('Password changed. Other active sessions were signed out.');
      return;
    }
    if (collection === 'accounts') {
      await api('auth/accounts', { method: 'POST', body: payload });
      closeForm();
      await loadData();
      showToast('Sign-in issued. Share the temporary password directly.');
      return;
    }
    if (payload.patient) {
      const patient = state.patients.find((record) => record.id === payload.patient);
      if (!patient) throw new Error('Choose a patient from the list.');
      payload.patientId = patient.id;
      payload.patient = patient.name;
    }
    const image = form.elements.namedItem('photo')?.files?.[0];
    delete payload.photo;
    const photo = await uploadPhoto(image);
    if (photo) payload.photo = photo;
    if (collection === 'patients' && payload.dateOfBirth && !editingRecord) payload.patientId = `LH-${String(Date.now()).slice(-6)}`;
    if (!editingRecord && !payload.status && ['patients', 'staff'].includes(collection)) payload.status = 'Active';
    if (isEditing) await api(collection, { method: 'PUT', id: editingRecord.id, body: payload });
    else await api(collection, { method: 'POST', body: payload });
    closeForm();
    await loadData();
    showToast(isEditing ? 'Record updated.' : 'Record saved.');
  } catch (error) { showToast(error.message); }
  finally { button.disabled = false; }
});
function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
}
function exportData(collection) {
  const targets = collection === 'all' || collection === 'overview' ? collections : [collection];
  const rows = targets.flatMap((name) => state[name].map((record) => ({ category: titles[name], ...record })));
  if (!rows.length) return showToast('There are no records to export yet.');
  const keys = [...new Set(rows.flatMap((record) => Object.keys(record)))];
  const csv = [keys.join(','), ...rows.map((record) => keys.map((key) => `"${String(record[key] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  link.download = `light-hospital-${collection}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Your report is ready.');
}
document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', () => navigate(item.dataset.page)));
document.querySelector('#menu-toggle').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('open'));
document.querySelector('#modal-close').addEventListener('click', closeForm);
document.querySelector('#cancel-button').addEventListener('click', closeForm);
modalBackdrop.addEventListener('click', (event) => { if (event.target === modalBackdrop) closeForm(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeForm(); document.querySelector('#sidebar').classList.remove('open'); } });
document.querySelector('#today-date').textContent = new Date().toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });

bootstrap();
