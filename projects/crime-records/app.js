const state = { suspects: [], cases: [], officers: [], page: 'overview', query: '', status: 'All statuses', selectedSuspect: null, selectedOfficer: null };
const content = document.querySelector('#page-content');
const modal = document.querySelector('#modal-backdrop');
const form = document.querySelector('#record-form');

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

const formatDate = (value) => new Date(`${value}T12:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
const initials = (name) => name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
const byNewest = (a, b) => b.date.localeCompare(a.date);

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { ...(options.body ? { 'content-type': 'application/json' } : {}), ...options.headers }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'The request could not be completed.');
  return result;
}

function officerName(id) {
  const officer = state.officers.find((item) => item.id === id);
  return officer ? `${officer.rank ? `${officer.rank} ` : ''}${officer.name}` : 'Unassigned';
}

function personName(id) {
  return state.suspects.find((person) => person.id === id)?.name || 'Unknown person';
}

function photoMarkup(person, className = '') {
  const image = person.photo
    ? `<img src="${escapeHtml(person.photo)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
    : '';
  return `<span class="person-photo ${className}">${image}<span>${escapeHtml(initials(person.name))}</span></span>`;
}

function statusBadge(status) {
  return `<span class="status-badge status-${escapeHtml(status.toLowerCase().replaceAll(' ', '-'))}">${escapeHtml(status)}</span>`;
}

function personCases(id) {
  return state.cases.filter((record) => record.suspectId === id).sort(byNewest);
}

function officerCases(id) {
  return state.cases.filter((record) => record.officerId === id).sort(byNewest);
}

function setPage(page) {
  state.page = page;
  state.selectedSuspect = null;
  state.selectedOfficer = null;
  state.query = '';
  state.status = 'All statuses';
  document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.page === page));
  document.querySelector('#crumb-current').textContent = page === 'overview' ? 'Overview' : page === 'cases' ? 'Case records' : page === 'officers' ? 'Officers' : 'People';
  document.querySelector('#sidebar').classList.remove('sidebar-open');
  render();
}

function updateCounts() {
  document.querySelector('[data-count="suspects"]').textContent = state.suspects.length;
  document.querySelector('[data-count="cases"]').textContent = state.cases.length;
  document.querySelector('[data-count="officers"]').textContent = state.officers.length;
}

function renderOverview() {
  const openCases = state.cases.filter((record) => ['Under investigation', 'Charged'].includes(record.disposition)).length;
  const wanted = state.suspects.filter((person) => person.status === 'Wanted').length;
  const recent = [...state.cases].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const newestPeople = [...state.suspects].slice(0, 4);
  content.innerHTML = `
    <div class="page-heading"><div><span class="eyebrow">RECORDS UNIT · AT A GLANCE</span><h1>A clearer view<br class="mobile-break"> of every case.</h1><p>Keep case notes organized, connected, and easy to find.</p></div><button class="button button-primary" data-action="new-suspect"><span aria-hidden="true">＋</span> Add a person</button></div>
    <div class="demo-notice"><span aria-hidden="true">✳</span><p><strong>Fictional demo records.</strong> Portraits are illustrative; allegations are not findings of guilt. Never enter real personal or case data into this prototype.</p></div>
    <div class="stats-grid">
      <article class="stat-card"><span class="stat-icon green-icon" aria-hidden="true">♙</span><div><span>People on file</span><strong>${state.suspects.length}</strong><small>Across all record statuses</small></div><span class="stat-spark" aria-hidden="true">✳</span></article>
      <article class="stat-card"><span class="stat-icon peach-icon" aria-hidden="true">▤</span><div><span>Case records</span><strong>${state.cases.length}</strong><small>Linked to a person record</small><span class="stat-inline">${openCases} open or pending</span></div></article>
      <article class="stat-card"><span class="stat-icon lilac-icon" aria-hidden="true">⌕</span><div><span>Wanted status</span><strong>${wanted}</strong><small>Check current status before action</small></div></article>
    </div>
    <div class="dashboard-grid">
      <section class="panel"><div class="panel-heading"><div><span class="eyebrow">LATEST UPDATES</span><h2>Recent case records</h2></div><button class="text-button" data-action="go-cases">View all <span aria-hidden="true">↗</span></button></div>
        <div class="case-list">${recent.map((record) => `<button class="case-row" data-action="open-person" data-id="${escapeHtml(record.suspectId)}"><span class="case-symbol" aria-hidden="true">▤</span><span class="case-copy"><strong>${escapeHtml(record.offense)}</strong><small>${escapeHtml(record.caseNumber)} · ${escapeHtml(personName(record.suspectId))}</small></span><span class="case-meta">${statusBadge(record.disposition)}<small>${formatDate(record.date)}</small></span></button>`).join('') || '<div class="empty-state compact-empty">No case records yet.</div>'}</div>
      </section>
      <section class="panel people-panel"><div class="panel-heading"><div><span class="eyebrow">PEOPLE ON FILE</span><h2>Recently added</h2></div><button class="text-button" data-action="go-people">View all <span aria-hidden="true">↗</span></button></div>
        <div class="mini-people">${newestPeople.map((person) => `<button class="mini-person" data-action="open-person" data-id="${escapeHtml(person.id)}">${photoMarkup(person)}<span class="mini-person-copy"><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.alias ? `Also known as ${person.alias}` : person.status)}</small></span><span class="mini-chevron" aria-hidden="true">↗</span></button>`).join('') || '<div class="empty-state compact-empty">No people on file yet.</div>'}</div>
      </section>
    </div>
    <p class="quiet-footnote"><span aria-hidden="true">⌑</span> Confirm record accuracy and legal status from authoritative sources before relying on any entry.</p>`;
}

function filteredPeople() {
  return state.suspects.filter((person) => {
    const text = `${person.name} ${person.alias} ${person.status}`.toLowerCase();
    return (!state.query || text.includes(state.query.toLowerCase()))
      && (state.status === 'All statuses' || person.status === state.status);
  });
}

function renderPeople() {
  if (state.selectedSuspect) return renderPersonDetail();
  const people = filteredPeople();
  content.innerHTML = `
    <div class="page-heading"><div><span class="eyebrow">PEOPLE DIRECTORY</span><h1>People on file.</h1><p>Review identity details and the history linked to each record.</p></div><button class="button button-primary" data-action="new-suspect"><span aria-hidden="true">＋</span> Add a person</button></div>
    <section class="panel directory-panel"><div class="list-toolbar"><label class="search-field"><span aria-hidden="true">⌕</span><input id="search-input" type="search" placeholder="Search name, alias, or status" value="${escapeHtml(state.query)}" aria-label="Search people"></label><label class="select-field"><span>Status</span><select id="status-filter"><option>All statuses</option>${['Wanted', 'In custody', 'Released', 'Archived'].map((status) => `<option${state.status === status ? ' selected' : ''}>${status}</option>`).join('')}</select></label><span class="result-count">${people.length} ${people.length === 1 ? 'person' : 'people'}</span></div>
      <div class="people-grid">${people.map((person) => `<article class="person-card"><button class="person-card-open" data-action="open-person" data-id="${escapeHtml(person.id)}">${photoMarkup(person, 'large-photo')}<span class="person-card-body"><span class="person-card-top"><strong>${escapeHtml(person.name)}</strong><span aria-hidden="true">↗</span></span><small>${escapeHtml(person.alias ? `Also known as ${person.alias}` : `Born ${formatDate(person.dateOfBirth)}`)}</small><span class="person-card-bottom">${statusBadge(person.status)}<span class="history-count">${personCases(person.id).length} records</span></span></span></button></article>`).join('') || '<div class="empty-state"><span aria-hidden="true">⌕</span><strong>No people found</strong><small>Try a different search or add a new record.</small></div>'}</div>
    </section>`;
  document.querySelector('#search-input').addEventListener('input', (event) => {
    state.query = event.target.value;
    const start = event.target.selectionStart;
    renderPeople();
    const input = document.querySelector('#search-input');
    input.focus();
    input.setSelectionRange(start, start);
  });
  document.querySelector('#status-filter').addEventListener('change', (event) => {
    state.status = event.target.value;
    renderPeople();
  });
}

function renderPersonDetail() {
  const person = state.suspects.find((item) => item.id === state.selectedSuspect);
  if (!person) {
    state.selectedSuspect = null;
    return renderPeople();
  }
  const records = personCases(person.id);
  const age = Math.floor((Date.now() - new Date(`${person.dateOfBirth}T00:00:00`).getTime()) / 31557600000);
  content.innerHTML = `
    <button class="back-link" data-action="back-people"><span aria-hidden="true">←</span> People directory</button>
    <section class="person-profile panel"><div class="profile-cover"><span class="eyebrow">PERSON RECORD</span><span class="record-reference">RECORD · ${escapeHtml(person.id.toUpperCase())}</span></div>
      <div class="profile-main">${photoMarkup(person, 'profile-photo')}<div class="profile-identity"><div class="profile-name-line"><div><h1>${escapeHtml(person.name)}</h1>${person.alias ? `<p>Also known as <strong>${escapeHtml(person.alias)}</strong></p>` : '<p>No alias recorded</p>'}</div>${statusBadge(person.status)}</div><div class="identity-facts"><span><small>DATE OF BIRTH</small><strong>${formatDate(person.dateOfBirth)} <i>· ${age} years</i></strong></span><span><small>GENDER</small><strong>${escapeHtml(person.gender)}</strong></span><span><small>LINKED CASES</small><strong>${records.length} ${records.length === 1 ? 'record' : 'records'}</strong></span></div></div></div>
      <div class="profile-actions"><p>Keep this record accurate, objective, and current.</p><div><button class="button button-outline archive-button" data-action="edit-person" data-id="${escapeHtml(person.id)}">Edit details</button>${person.status !== 'Archived' ? '<button class="button button-outline archive-button" data-action="archive-person" data-id="' + escapeHtml(person.id) + '">Archive record</button>' : ''}<button class="button button-primary" data-action="new-case" data-id="${escapeHtml(person.id)}"><span aria-hidden="true">＋</span> Add case record</button></div></div>
    </section>
    <section class="panel history-panel"><div class="panel-heading"><div><span class="eyebrow">CHRONOLOGICAL HISTORY</span><h2>Case records</h2><p>Allegations and court outcomes are shown separately.</p></div><span class="history-total">${records.length} TOTAL</span></div>
      <div class="history-list">${records.map((record) => `<article class="history-item"><div class="history-marker"><span></span></div><div class="history-content"><div class="history-top"><div><small class="case-number">${escapeHtml(record.caseNumber)} · ${formatDate(record.date)}</small><h3>${escapeHtml(record.offense)}</h3></div><div class="history-actions">${statusBadge(record.disposition)}<button class="text-button" data-action="edit-case" data-id="${escapeHtml(record.id)}">Edit</button></div></div><p>${escapeHtml(record.summary)}</p><div class="history-officer"><span aria-hidden="true">♙</span> ${escapeHtml(officerName(record.officerId))}</div></div></article>`).join('') || '<div class="empty-state"><span aria-hidden="true">▤</span><strong>No linked case records</strong><small>Add a case record to begin this person’s history.</small></div>'}</div>
    </section>
    <p class="quiet-footnote"><span aria-hidden="true">⌑</span> Case history is for reference only. Check official records, legal restrictions, and correction or expungement requirements.</p>`;
}

function filteredCases() {
  return [...state.cases].filter((record) => {
    const text = `${record.caseNumber} ${record.offense} ${personName(record.suspectId)} ${record.disposition} ${officerName(record.officerId)}`.toLowerCase();
    return (!state.query || text.includes(state.query.toLowerCase()))
      && (state.status === 'All statuses' || record.disposition === state.status);
  }).sort(byNewest);
}

function renderCases() {
  const records = filteredCases();
  content.innerHTML = `
    <div class="page-heading"><div><span class="eyebrow">CASE REGISTER</span><h1>Case records.</h1><p>Search incident notes, charges, and recorded outcomes.</p></div><button class="button button-primary" data-action="new-case"><span aria-hidden="true">＋</span> Add a case</button></div>
    <section class="panel directory-panel"><div class="list-toolbar"><label class="search-field"><span aria-hidden="true">⌕</span><input id="search-input" type="search" placeholder="Search case, person, or officer" value="${escapeHtml(state.query)}" aria-label="Search case records"></label><label class="select-field"><span>Status</span><select id="status-filter"><option>All statuses</option>${['Under investigation', 'Charged', 'Convicted', 'Acquitted', 'Dismissed', 'Closed'].map((status) => `<option${state.status === status ? ' selected' : ''}>${status}</option>`).join('')}</select></label><span class="result-count">${records.length} ${records.length === 1 ? 'record' : 'records'}</span></div>
      <div class="table-wrap"><table class="record-table"><thead><tr><th>CASE</th><th>PERSON</th><th>OFFENSE / CHARGE</th><th>INCIDENT DATE</th><th>STATUS</th><th>OFFICER</th><th>ACTION</th></tr></thead><tbody>${records.map((record) => {
    const person = state.suspects.find((item) => item.id === record.suspectId);
    return `<tr><td><strong class="table-case-number">${escapeHtml(record.caseNumber)}</strong></td><td><button class="table-person" data-action="open-person" data-id="${escapeHtml(record.suspectId)}">${person ? photoMarkup(person, 'table-photo') : ''}<span>${escapeHtml(personName(record.suspectId))}</span><span aria-hidden="true">↗</span></button></td><td>${escapeHtml(record.offense)}</td><td class="muted-cell">${formatDate(record.date)}</td><td>${statusBadge(record.disposition)}</td><td><button class="table-person officer-link" data-action="open-officer" data-id="${escapeHtml(record.officerId)}">${escapeHtml(officerName(record.officerId))}<span aria-hidden="true">↗</span></button></td><td><button class="text-button" data-action="edit-case" data-id="${escapeHtml(record.id)}">Edit</button></td></tr>`;
  }).join('') || '<tr><td colspan="7"><div class="empty-state compact-empty">No case records found.</div></td></tr>'}</tbody></table></div>
    </section><p class="quiet-footnote"><span aria-hidden="true">⌑</span> A charge is an allegation, not a finding of guilt. Confirm outcomes through official sources.</p>`;
  document.querySelector('#search-input').addEventListener('input', (event) => {
    state.query = event.target.value;
    const start = event.target.selectionStart;
    renderCases();
    const input = document.querySelector('#search-input');
    input.focus();
    input.setSelectionRange(start, start);
  });
  document.querySelector('#status-filter').addEventListener('change', (event) => {
    state.status = event.target.value;
    renderCases();
  });
}

function filteredOfficers() {
  return state.officers.filter((officer) => {
    const text = `${officer.name} ${officer.rank} ${officer.badge} ${officer.unit} ${officer.email}`.toLowerCase();
    return !state.query || text.includes(state.query.toLowerCase());
  });
}

function renderOfficers() {
  if (state.selectedOfficer) return renderOfficerDetail();
  const officers = filteredOfficers();
  content.innerHTML = `
    <div class="page-heading"><div><span class="eyebrow">OFFICER DIRECTORY</span><h1>Meet the team.</h1><p>Find staff details, short bios, and the case records assigned to each officer.</p></div><button class="button button-primary" data-action="new-officer"><span aria-hidden="true">＋</span> Add an officer</button></div>
    <section class="panel directory-panel"><div class="list-toolbar"><label class="search-field"><span aria-hidden="true">⌕</span><input id="search-input" type="search" placeholder="Search name, badge, rank, or unit" value="${escapeHtml(state.query)}" aria-label="Search officers"></label><span class="result-count">${officers.length} ${officers.length === 1 ? 'officer' : 'officers'}</span></div>
      <div class="officers-grid">${officers.map((officer) => `<article class="officer-card"><button class="officer-card-open" data-action="open-officer" data-id="${escapeHtml(officer.id)}"><span class="officer-avatar" aria-hidden="true">${escapeHtml(initials(officer.name))}</span><span class="officer-card-body"><span class="officer-name-line"><strong>${escapeHtml(officer.name)}</strong><span aria-hidden="true">↗</span></span><small>${escapeHtml(officer.rank)} · ${escapeHtml(officer.unit)}</small><span class="officer-card-meta"><span>BADGE ${escapeHtml(officer.badge)}</span><span>${officerCases(officer.id).length} case records</span></span><span class="officer-bio-preview">${escapeHtml(officer.bio)}</span></span></button></article>`).join('') || '<div class="empty-state"><span aria-hidden="true">♧</span><strong>No officers found</strong><small>Try another search or add an officer record.</small></div>'}</div>
    </section>
    <p class="quiet-footnote"><span aria-hidden="true">⌑</span> Officer profiles in this prototype are fictional. Use only authorized staff information.</p>`;
  document.querySelector('#search-input').addEventListener('input', (event) => {
    state.query = event.target.value;
    const start = event.target.selectionStart;
    renderOfficers();
    const input = document.querySelector('#search-input');
    input.focus();
    input.setSelectionRange(start, start);
  });
}

function renderOfficerDetail() {
  const officer = state.officers.find((item) => item.id === state.selectedOfficer);
  if (!officer) {
    state.selectedOfficer = null;
    return renderOfficers();
  }
  const records = officerCases(officer.id);
  content.innerHTML = `
    <button class="back-link" data-action="back-officers"><span aria-hidden="true">←</span> Officer directory</button>
    <section class="person-profile panel officer-profile"><div class="profile-cover"><span class="eyebrow">OFFICER PROFILE</span><span class="record-reference">BADGE · ${escapeHtml(officer.badge)}</span></div>
      <div class="profile-main"><span class="officer-avatar officer-profile-avatar" aria-hidden="true">${escapeHtml(initials(officer.name))}</span><div class="profile-identity"><div class="profile-name-line"><div><h1>${escapeHtml(officer.name)}</h1><p>${escapeHtml(officer.rank)} · ${escapeHtml(officer.unit)}</p></div><span class="officer-active-badge"><i></i> Officer</span></div><div class="identity-facts"><span><small>BADGE NUMBER</small><strong>${escapeHtml(officer.badge)}</strong></span><span><small>EMAIL</small><strong><a href="mailto:${escapeHtml(officer.email)}">${escapeHtml(officer.email)}</a></strong></span><span><small>PHONE</small><strong><a href="tel:${escapeHtml(officer.phone.replace(/[^+\d]/g, ''))}">${escapeHtml(officer.phone)}</a></strong></span></div></div></div>
      <div class="officer-bio"><span class="eyebrow">ABOUT</span><p>${escapeHtml(officer.bio)}</p></div>
      <div class="profile-actions"><p>Keep officer information accurate and current.</p><div><button class="button button-outline" data-action="edit-officer" data-id="${escapeHtml(officer.id)}">Edit profile</button><button class="button button-primary" data-action="new-officer-case" data-id="${escapeHtml(officer.id)}"><span aria-hidden="true">＋</span> Add case record</button></div></div>
    </section>
    <section class="panel history-panel"><div class="panel-heading"><div><span class="eyebrow">ASSIGNED CASES</span><h2>Case records</h2><p>Cases currently linked to this officer.</p></div><span class="history-total">${records.length} TOTAL</span></div>
      <div class="officer-case-list">${records.map((record) => `<article class="officer-case-row"><div class="officer-case-heading"><div><small class="case-number">${escapeHtml(record.caseNumber)} · ${formatDate(record.date)}</small><h3>${escapeHtml(record.offense)}</h3></div>${statusBadge(record.disposition)}</div><div class="officer-case-meta"><button class="table-person" data-action="open-person" data-id="${escapeHtml(record.suspectId)}">${escapeHtml(personName(record.suspectId))}<span aria-hidden="true">↗</span></button><button class="text-button" data-action="edit-case" data-id="${escapeHtml(record.id)}">Edit case</button></div></article>`).join('') || '<div class="empty-state"><span aria-hidden="true">▤</span><strong>No cases assigned yet</strong><small>Case records assigned to this officer will appear here.</small></div>'}</div>
    </section>`;
}

function render() {
  updateCounts();
  if (state.page === 'overview') renderOverview();
  else if (state.page === 'cases') renderCases();
  else if (state.page === 'officers') renderOfficers();
  else renderPeople();
}

function field(label, name, type = 'text', options = {}) {
  const required = options.required === false ? '' : ' required';
  const hint = options.hint ? `<small class="field-hint">${escapeHtml(options.hint)}</small>` : '';
  let control;
  if (options.choices) {
    control = `<select name="${name}"${required}>${options.choices.map(([value, title]) => `<option value="${escapeHtml(value)}">${escapeHtml(title)}</option>`).join('')}</select>`;
  } else if (type === 'select-suspect') {
    control = `<select name="${name}"${required}><option value="">Choose a person</option>${state.suspects.map((person) => `<option value="${escapeHtml(person.id)}"${options.selected === person.id ? ' selected' : ''}>${escapeHtml(person.name)}</option>`).join('')}</select>`;
  } else if (type === 'select-officer') {
    control = `<select name="${name}"${required}><option value="">Choose an officer</option>${state.officers.map((officer) => `<option value="${escapeHtml(officer.id)}"${options.selected === officer.id ? ' selected' : ''}>${escapeHtml(officer.rank ? `${officer.rank} ` : '')}${escapeHtml(officer.name)} · ${escapeHtml(officer.badge)}</option>`).join('')}</select>`;
  } else if (type === 'textarea') {
    control = `<textarea name="${name}" rows="${options.rows || 3}" maxlength="${options.maxLength || 1200}"${required} placeholder="${escapeHtml(options.placeholder || '')}"></textarea>`;
  } else {
    control = `<input name="${name}" type="${type}" maxlength="${options.maxLength || 160}"${required} ${options.attrs || ''} placeholder="${escapeHtml(options.placeholder || '')}">`;
  }
  return `<label class="form-field${options.wide ? ' field-wide' : ''}"><span>${escapeHtml(label)}</span>${control}${hint}</label>`;
}

function openModal(kind, selectedId, editId, selectedOfficerId) {
  const fields = document.querySelector('#form-fields');
  document.querySelector('#form-error').hidden = true;
  form.dataset.kind = kind;
  form.dataset.editId = editId || '';
  const record = editId ? (kind === 'suspect' ? state.suspects : kind === 'officer' ? state.officers : state.cases).find((item) => item.id === editId) : null;
  if (kind === 'suspect') {
    document.querySelector('#modal-eyebrow').textContent = record ? 'UPDATE PERSON RECORD' : 'NEW PERSON RECORD';
    document.querySelector('#modal-title').textContent = record ? 'Edit person details' : 'Add a person';
    document.querySelector('#save-label').textContent = record ? 'Save changes' : 'Save person';
    fields.innerHTML = field('Full name', 'name', 'text', { maxLength: 120 })
      + field('Alias / also known as', 'alias', 'text', { required: false, maxLength: 120 })
      + field('Date of birth', 'dateOfBirth', 'date')
      + field('Gender', 'gender', 'text', { maxLength: 40 })
      + field('Record status', 'status', 'select', { choices: [['Wanted', 'Wanted'], ['In custody', 'In custody'], ['Released', 'Released'], ['Archived', 'Archived']] })
      + field('Portrait image URL', 'photo', 'url', { required: false, maxLength: 1000, placeholder: 'https://…', hint: 'Optional HTTPS portrait URL. Use only authorized images.' });
  } else if (kind === 'officer') {
    document.querySelector('#modal-eyebrow').textContent = record ? 'UPDATE OFFICER PROFILE' : 'NEW OFFICER PROFILE';
    document.querySelector('#modal-title').textContent = record ? 'Edit officer profile' : 'Add an officer';
    document.querySelector('#save-label').textContent = record ? 'Save changes' : 'Save officer';
    fields.innerHTML = field('Full name', 'name', 'text', { maxLength: 120 })
      + field('Rank / title', 'rank', 'text', { maxLength: 80 })
      + field('Badge number', 'badge', 'text', { maxLength: 40 })
      + field('Unit / department', 'unit', 'text', { maxLength: 100 })
      + field('Email address', 'email', 'email', { maxLength: 254 })
      + field('Phone number', 'phone', 'tel', { maxLength: 40 })
      + field('Bio', 'bio', 'textarea', { wide: true, maxLength: 800, rows: 4, placeholder: 'A short professional biography.' });
  } else {
    document.querySelector('#modal-eyebrow').textContent = record ? 'UPDATE CASE RECORD' : 'NEW CASE RECORD';
    document.querySelector('#modal-title').textContent = record ? 'Edit case record' : 'Add a case record';
    document.querySelector('#save-label').textContent = record ? 'Save changes' : 'Save case';
    const today = new Date().toISOString().slice(0, 10);
    fields.innerHTML = field('Case number', 'caseNumber', 'text', { maxLength: 40, placeholder: 'CR-2026-0001', hint: 'Use letters, numbers, and hyphens.' })
      + field('Person', 'suspectId', 'select-suspect', { selected: selectedId })
      + field('Offense / charge', 'offense', 'text', { maxLength: 120, placeholder: 'Label allegations as allegations.' })
      + field('Incident date', 'date', 'date', { attrs: `max="${today}"` })
      + field('Case status', 'disposition', 'select', { choices: [['Under investigation', 'Under investigation'], ['Charged', 'Charged'], ['Convicted', 'Convicted'], ['Acquitted', 'Acquitted'], ['Dismissed', 'Dismissed'], ['Closed', 'Closed']] })
      + field('Investigating officer', 'officerId', 'select-officer', { selected: selectedOfficerId })
      + field('Case notes', 'summary', 'textarea', { wide: true, placeholder: 'Brief, factual summary. Avoid unverified conclusions.' });
  }
  if (record) {
    for (const [name, value] of Object.entries(record)) {
      const control = form.elements.namedItem(name);
      if (control) control.value = value;
    }
  }
  modal.hidden = false;
  fields.querySelector('input,select,textarea')?.focus();
}

function closeModal() {
  modal.hidden = true;
  form.reset();
  document.querySelector('#form-error').hidden = true;
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('toast-visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('toast-visible'), 2800);
}

async function refreshData() {
  [state.suspects, state.cases, state.officers] = await Promise.all([
    api('/api/suspects'), api('/api/cases'), api('/api/officers')
  ]);
  render();
}

document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => setPage(button.dataset.page)));
document.querySelector('#new-case-top').addEventListener('click', () => openModal('case'));
document.querySelector('#menu-toggle').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('sidebar-open'));
content.addEventListener('error', (event) => {
  if (event.target instanceof HTMLImageElement) event.target.hidden = true;
}, true);
document.querySelector('#modal-close').addEventListener('click', closeModal);
document.querySelector('#cancel-button').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });

content.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'reload') window.location.reload();
  if (action === 'new-suspect') openModal('suspect');
  if (action === 'new-case') openModal('case', id);
  if (action === 'new-officer') openModal('officer');
  if (action === 'new-officer-case') openModal('case', undefined, undefined, id);
  if (action === 'edit-person') openModal('suspect', undefined, id);
  if (action === 'edit-case') openModal('case', undefined, id);
  if (action === 'edit-officer') openModal('officer', undefined, id);
  if (action === 'go-cases') setPage('cases');
  if (action === 'go-people') setPage('suspects');
  if (action === 'open-officers') setPage('officers');
  if (action === 'open-person') {
    state.page = 'suspects';
    state.selectedSuspect = id;
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.page === 'suspects'));
    document.querySelector('#crumb-current').textContent = 'People';
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (action === 'open-officer') {
    state.page = 'officers';
    state.selectedSuspect = null;
    state.selectedOfficer = id;
    state.query = '';
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.page === 'officers'));
    document.querySelector('#crumb-current').textContent = 'Officers';
    document.querySelector('#sidebar').classList.remove('sidebar-open');
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (action === 'back-people') {
    state.selectedSuspect = null;
    renderPeople();
  }
  if (action === 'back-officers') {
    state.selectedOfficer = null;
    renderOfficers();
  }
  if (action === 'archive-person') {
    if (!window.confirm('Archive this person record? It will remain in the JSON file and case history.')) return;
    try {
      await api('/api/suspects', { method: 'PATCH', body: JSON.stringify({ id, status: 'Archived' }) });
      await refreshData();
      showToast('Person record archived.');
    } catch (error) {
      showToast(error.message);
    }
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form));
  const kind = form.dataset.kind;
  const endpoint = kind === 'suspect' ? '/api/suspects' : kind === 'officer' ? '/api/officers' : '/api/cases';
  const editing = Boolean(form.dataset.editId);
  if (editing) payload.id = form.dataset.editId;
  try {
    const record = await api(endpoint, { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
    closeModal();
    await refreshData();
    if (kind === 'suspect') {
      state.page = 'suspects';
      state.selectedSuspect = record.id;
      state.selectedOfficer = null;
      document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.page === 'suspects'));
      document.querySelector('#crumb-current').textContent = 'People';
      render();
    } else if (kind === 'officer') {
      state.page = 'officers';
      state.selectedSuspect = null;
      state.selectedOfficer = record.id;
      document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.page === 'officers'));
      document.querySelector('#crumb-current').textContent = 'Officers';
      render();
    } else if (state.page === 'suspects' && state.selectedSuspect) {
      renderPersonDetail();
    } else if (state.page === 'officers' && state.selectedOfficer) {
      renderOfficerDetail();
    }
    showToast(editing ? 'Record changes saved.' : kind === 'suspect' ? 'Person record saved.' : kind === 'officer' ? 'Officer profile saved.' : 'Case record saved.');
  } catch (error) {
    const errorBox = document.querySelector('#form-error');
    errorBox.textContent = error.message;
    errorBox.hidden = false;
  }
});

document.querySelector('#today-date').textContent = new Date().toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
refreshData().catch((error) => {
  content.innerHTML = `<div class="load-error"><span aria-hidden="true">⌑</span><h1>Records couldn't be loaded.</h1><p>${escapeHtml(error.message)}</p><button class="button button-primary" data-action="reload">Try again</button></div>`;
});
