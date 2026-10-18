// data.js must load first; keep the fixture catalog in one place for the UI.
const { teams, fixtures: demoFixtures } = window.PREMIER_LEAGUE_DATA;
const teamById = new Map(teams.map((team) => [team.id, team]));
// Schedule and optional crest images are stored separately so importing artwork
// never changes a user's match data.
const storageKey = "touchline-premier-league-2026-27";
const crestStorageKey = `${storageKey}-crests`;
const maxCrestStorageBytes = 1_500_000;
const pageSize = 7;
let fixtures = loadFixtures();
let crestAssets = loadCrests();
let currentPage = 1;
let toastTimer;

// Small shared formatters/helpers keep generated DOM consistent across renderers.
const $ = (selector) => document.querySelector(selector);
const numberFormat = new Intl.NumberFormat("en-GB");
const dateFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });

// Decorative motifs are original SVG line art keyed by team ID, not official crests.
const clubMotifs = {
  ars: '<path d="m20 10 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2-4.5-4.4 6.2-.9Z"/>',
  avl: '<path d="m20 10 8 8-8 8-8-8Z"/><path d="m20 13 5 5-5 5-5-5Z" fill="#f2c76e" stroke="none"/>',
  bou: '<path d="M10 14c4 0 4 5 8 5s4-5 8-5"/><path d="M10 20c4 0 4 5 8 5s4-5 8-5"/>',
  bre: '<path d="m20 11 6 4v7l-6 4-6-4v-7Z"/><circle cx="20" cy="18.5" r="2"/><circle cx="16.5" cy="23" r="1"/>',
  bha: '<circle cx="20" cy="19" r="3"/><path d="m20 10 1.2 5.5M28 13l-4.8 3.2M28 24l-5.4-1.4M20 28l-1.2-5.5M12 24l4.8-3.2M12 13l5.4 1.4"/>',
  cov: '<path d="m20 10 3 5 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1Z"/><path d="m20 14 1.4 3.1 3.4.4-2.5 2.4.6 3.4-2.9-1.6-2.9 1.6.6-3.4-2.5-2.4 3.4-.4Z" fill="#f2c76e" stroke="none"/>',
  che: '<path d="M20 10 28 18 20 26 12 18Z"/><circle cx="20" cy="18" r="2.5" fill="#f2c76e" stroke="none"/>',
  cry: '<circle cx="20" cy="18" r="8"/><circle cx="20" cy="18" r="3"/><path d="M12 18h16M20 10v16"/>',
  eve: '<path d="M12 16c3-4 5-4 8 0s5 4 8 0M12 22c3-4 5-4 8 0s5 4 8 0"/>',
  ful: '<path d="M13 25V17l7-6 7 6v8Z"/><path d="M17 25v-6h6v6"/><path d="M16 15h8"/>',
  hul: '<path d="m12 15 16-4M12 20l16-4M12 25l16-4"/>',
  ips: '<path d="m20 10 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/><path d="M13 28h14"/>',
  lee: '<path d="m15 13 2 4 4 1-4 2-2 4-2-4-4-2 4-1ZM25 18l1.5 3 3 .7-3 1.2-1.5 3-1.2-3-3-.9 3-.9Z"/>',
  liv: '<path d="M20 27c-7-5-8-12-1-17 0 5 3 5 4 8 2-2 3-4 3-6 4 8 2 13-6 15Z"/><path d="M16 24c2-3 4-6 7-8"/>',
  mci: '<circle cx="20" cy="18" r="7"/><path d="m20 13 1.6 3.4 3.7.5-2.7 2.6.7 3.7-3.3-1.8-3.3 1.8.7-3.7-2.7-2.6 3.7-.5Z"/>',
  mun: '<path d="m22 10-8 10h6l-2 7 8-11h-6Z"/>',
  new: '<path d="m14 14 4 4-4 4-4-4ZM24 14l4 4-4 4-4-4ZM19 22l3 3-3 3-3-3Z"/>',
  nfo: '<path d="M20 10v17M20 16c-5-1-7-3-7-6 5 0 7 2 7 6ZM20 20c5-1 7-3 7-6-5 0-7 2-7 6ZM14 28h12"/>',
  sun: '<circle cx="20" cy="17" r="4"/><path d="M20 10v2M20 22v2M13 17h2M25 17h2M15 12l1.5 1.5M23.5 20.5 25 22M25 12l-1.5 1.5M16.5 20.5 15 22M12 27h16"/>',
  tot: '<path d="M20 10v16M15 14h10M14 18h12M15 23h10"/><circle cx="20" cy="10" r="2" fill="#f2c76e" stroke="none"/>',
};

function svgNode(tag, attributes = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
  return node;
}

// Validate the saved record shape before using it. A result must contain both
// non-negative integer scores or neither; each fixture must reference known clubs.
function safeFixtures(value) {
  return Array.isArray(value) && value.every((fixture) =>
    fixture && typeof fixture.id === "string" &&
    Number.isInteger(fixture.week) && fixture.week >= 1 && fixture.week <= 38 &&
    /^\d{4}-\d{2}-\d{2}$/.test(fixture.date) &&
    typeof fixture.time === "string" &&
    teamById.has(fixture.homeId) && teamById.has(fixture.awayId) &&
    fixture.homeId !== fixture.awayId &&
    (fixture.homeScore === null || (Number.isInteger(fixture.homeScore) && fixture.homeScore >= 0 && fixture.homeScore <= 99)) &&
    (fixture.awayScore === null || (Number.isInteger(fixture.awayScore) && fixture.awayScore >= 0 && fixture.awayScore <= 99)) &&
    ((fixture.homeScore === null) === (fixture.awayScore === null))
  );
}

/** Load a valid saved schedule or start from the deterministic demo fixtures. */
function loadFixtures() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === null) return structuredClone(demoFixtures);
    const parsed = JSON.parse(saved);
    if (safeFixtures(parsed)) return parsed;
    showToast("Saved fixture data was invalid. The sample schedule has been restored.");
  } catch (error) {
    showToast(`Could not read saved fixtures: ${error.message}`);
  }
  return structuredClone(demoFixtures);
}

/** Persist fixture edits and report browser storage failures to the user. */
function saveFixtures() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(fixtures));
    $("#save-status").textContent = `Saved at ${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date())}`;
    return true;
  } catch (error) {
    $("#save-status").textContent = "Save failed";
    showToast(`Your change could not be saved in this browser: ${error.message}`);
    return false;
  }
}

/** Display short-lived confirmations and validation/storage errors. */
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4200);
}

/** Restore only data-URL images associated with known team IDs. */
function loadCrests() {
  try {
    const saved = localStorage.getItem(crestStorageKey);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("saved crest list has an invalid format");
    }
    return Object.fromEntries(Object.entries(parsed).filter(([teamId, source]) =>
      teamById.has(teamId) &&
      typeof source === "string" &&
      /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(source)
    ));
  } catch (error) {
    showToast(`Could not read saved crests: ${error.message}`);
    return {};
  }
}

/** Keep aggregate image data below a practical local-storage limit. */
function persistCrests(nextAssets) {
  try {
    const contents = JSON.stringify(nextAssets);
    if (contents.length > maxCrestStorageBytes) {
      throw new Error("crest images exceed the 1.5 MB storage limit");
    }
    localStorage.setItem(crestStorageKey, contents);
    return true;
  } catch (error) {
    showToast(`Crests could not be saved in this browser: ${error.message}`);
    return false;
  }
}

/** Read an uploaded image without sending it to a server. */
function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        reject(new Error(`${file.name} could not be read as an image.`));
        return;
      }
      resolve(reader.result);
    });
    reader.addEventListener("error", () => reject(new Error(`${file.name} could not be read: ${reader.error?.message || "unknown file error"}`)));
    reader.readAsDataURL(file);
  });
}

/** Import correctly named, small raster images as optional club artwork. */
async function importCrests(files) {
  const filesByTeam = new Map();
  for (const file of files) {
    const match = file.name.match(/^([a-z0-9]+)\.(png|jpe?g|webp)$/i);
    const teamId = match?.[1]?.toLowerCase();
    if (!match || !teamById.has(teamId) || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      showToast(`Skipped "${file.name}". Use a team ID and .png, .jpg, .jpeg, or .webp, e.g. ars.png.`);
      continue;
    }
    if (file.size > 350_000) {
      showToast(`Skipped "${file.name}". Each crest must be 350 KB or smaller.`);
      continue;
    }
    filesByTeam.set(teamId, file);
  }
  if (filesByTeam.size === 0) return;
  try {
    const imported = Object.fromEntries(await Promise.all(
      [...filesByTeam].map(async ([teamId, file]) => [teamId, await readImageFile(file)])
    ));
    const nextAssets = { ...crestAssets, ...imported };
    if (!persistCrests(nextAssets)) return;
    crestAssets = nextAssets;
    renderDashboard();
    showToast(`Added ${filesByTeam.size} crest${filesByTeam.size === 1 ? "" : "s"}.`);
  } catch (error) {
    showToast(`Crests could not be imported: ${error.message}`);
  }
}

/** Return an independent statistics record for one club. */
function emptyStats() {
  return { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, form: [] };
}

/**
 * Rebuild standings from played fixtures so edits/deletions cannot leave stale totals.
 * Premier League scoring is 3 points for a win, 1 for a draw, and 0 for a loss.
 */
function calculateStandings() {
  const table = new Map(teams.map((team) => [team.id, emptyStats()]));
  const playedFixtures = fixtures.filter((fixture) => fixture.homeScore !== null);
  playedFixtures.forEach((fixture) => {
    const home = table.get(fixture.homeId);
    const away = table.get(fixture.awayId);
    home.played++;
    away.played++;
    home.goalsFor += fixture.homeScore;
    home.goalsAgainst += fixture.awayScore;
    away.goalsFor += fixture.awayScore;
    away.goalsAgainst += fixture.homeScore;
    if (fixture.homeScore > fixture.awayScore) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (fixture.homeScore < fixture.awayScore) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points++;
      away.points++;
    }
    home.form.push({ date: fixture.date, result: fixture.homeScore > fixture.awayScore ? "W" : fixture.homeScore < fixture.awayScore ? "L" : "D" });
    away.form.push({ date: fixture.date, result: fixture.awayScore > fixture.homeScore ? "W" : fixture.awayScore < fixture.homeScore ? "L" : "D" });
  });

  // Sort the last five results chronologically, then apply table tie-breakers:
  // points, goal difference, goals scored, and a stable alphabetical fallback.
  return teams.map((team) => {
    const stats = table.get(team.id);
    stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
    stats.form.sort((left, right) => left.date.localeCompare(right.date));
    stats.form = stats.form.slice(-5);
    return { ...team, ...stats };
  }).sort((left, right) =>
    right.points - left.points ||
    right.goalDifference - left.goalDifference ||
    right.goalsFor - left.goalsFor ||
    left.name.localeCompare(right.name)
  );
}

/** Build a team-coloured SVG shield, optionally covered by an uploaded crest. */
function createTeamMark(team, extraClass = "") {
  const mark = document.createElement("span");
  mark.className = `team-mark${crestAssets[team.id] ? " has-crest" : ""} ${extraClass}`.trim();
  mark.style.setProperty("--team-ink", team.ink);
  mark.setAttribute("role", "img");
  mark.setAttribute("aria-label", `${team.name} custom badge`);

  const svg = svgNode("svg", { class: "club-emblem", viewBox: "0 0 40 46", focusable: "false", "aria-hidden": "true" });
  svg.append(svgNode("path", {
    class: "emblem-shield",
    d: "M5 2h30l3 3v20c0 9-9 15-18 20C11 40 2 34 2 25V5z",
    fill: team.color,
  }));
  svg.append(svgNode("path", {
    class: "emblem-outline",
    d: "M6.5 4.5h27l2 2v18.4c0 7.4-7.7 13.4-15.5 17.7C12.2 38.3 4 32.3 4 24.9V6.5z",
    fill: "none",
  }));
  svg.append(svgNode("path", {
    class: "emblem-band",
    d: "M7 7h26v5H7z",
    fill: team.ink,
  }));
  const motif = svgNode("g", {
    class: "emblem-motif",
    fill: "none",
    stroke: team.ink,
    "stroke-width": "1.7",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  });
  motif.innerHTML = clubMotifs[team.id];
  svg.append(motif);
  svg.append(svgNode("circle", { class: "emblem-dot", cx: "20", cy: "33", r: "1.35", fill: team.ink }));
  mark.append(svg);
  if (crestAssets[team.id]) {
    const image = document.createElement("img");
    image.className = "team-crest";
    image.src = crestAssets[team.id];
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.addEventListener("load", () => {
      mark.classList.add("crest-loaded");
    }, { once: true });
    image.addEventListener("error", () => {
      delete crestAssets[team.id];
      persistCrests(crestAssets);
      mark.classList.remove("has-crest");
      showToast(`The saved crest for ${team.name} could not be displayed. The custom badge is shown instead.`);
      image.remove();
    }, { once: true });
    mark.append(image);
  }
  return mark;
}

function renderForm(form) {
  const container = document.createElement("span");
  container.className = "form-dots";
  if (!form.length) {
    container.innerHTML = '<span class="form-empty">—</span>';
    return container;
  }
  form.forEach(({ result }) => {
    const dot = document.createElement("span");
    dot.className = `form-dot ${result.toLowerCase()}`;
    dot.textContent = result;
    dot.title = result === "W" ? "Win" : result === "D" ? "Draw" : "Loss";
    container.append(dot);
  });
  return container;
}

/** Recreate all twenty rows, including qualification zones and the top-four divider. */
function renderStandings(standings) {
  const body = $("#league-table-body");
  body.replaceChildren();
  standings.forEach((team, index) => {
    const row = document.createElement("tr");
    row.className = index < 4 ? "zone-champions" : index >= 17 ? "zone-relegation" : "";
    if (index === 3) row.classList.add("top-four-cut");
    const position = document.createElement("td");
    position.className = "position-cell";
    position.textContent = String(index + 1).padStart(2, "0");

    const club = document.createElement("td");
    const clubLabel = document.createElement("span");
    clubLabel.className = "team-cell";
    clubLabel.append(createTeamMark(team));
    const teamName = document.createElement("span");
    teamName.textContent = team.name;
    clubLabel.append(teamName);
    club.append(clubLabel);

    row.append(position, club);
    [
      team.played,
      team.won,
      team.drawn,
      team.lost,
      team.goalsFor,
      team.goalsAgainst,
    ].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = numberFormat.format(value);
      row.append(cell);
    });
    const goalDifference = document.createElement("td");
    goalDifference.className = team.goalDifference > 0 ? "gd-positive" : team.goalDifference < 0 ? "gd-negative" : "";
    goalDifference.textContent = team.goalDifference > 0 ? `+${team.goalDifference}` : String(team.goalDifference);
    const points = document.createElement("td");
    points.className = "points-cell";
    points.textContent = numberFormat.format(team.points);
    const form = document.createElement("td");
    form.className = "form-cell";
    form.append(renderForm(team.form));
    row.append(goalDifference, points, form);
    body.append(row);
  });
}

/** Keep the summary cards derived from the same current fixture/results state. */
function renderMetrics(standings) {
  const played = fixtures.filter((fixture) => fixture.homeScore !== null);
  const goals = played.reduce((total, fixture) => total + fixture.homeScore + fixture.awayScore, 0);
  const leader = standings[0];
  $("#matches-played").textContent = numberFormat.format(played.length);
  $("#matches-total").textContent = `of ${numberFormat.format(fixtures.length)} fixtures`;
  $("#played-progress").style.width = `${fixtures.length ? (played.length / fixtures.length) * 100 : 0}%`;
  $("#goals-scored").textContent = numberFormat.format(goals);
  $("#goals-average").textContent = `${played.length ? (goals / played.length).toFixed(2) : "0.00"} per match`;
  $("#league-leader").textContent = leader?.name || "No leader yet";
  $("#leader-points").textContent = `${leader?.points || 0} points · after ${leader?.played || 0} matches`;
  const playedWeeks = played.map((fixture) => fixture.week);
  $("#hero-matchweek").textContent = String(Math.min(38, Math.max(1, Math.max(...playedWeeks, 0) + 1))).padStart(2, "0");
}

/** Parse date-only values at local midday to avoid timezone day shifts. */
function formatMatchDate(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`);
  return dateFormat.format(date);
}

/** Create one accessible fixture/result row and its edit control. */
function createMatchRow(fixture) {
  const home = teamById.get(fixture.homeId);
  const away = teamById.get(fixture.awayId);
  const played = fixture.homeScore !== null;
  const row = document.createElement("article");
  row.className = "match-row";
  const meta = document.createElement("div");
  meta.className = "match-meta";
  const metaLeft = document.createElement("span");
  metaLeft.className = "match-meta-left";
  const week = document.createElement("span");
  week.className = "match-week";
  week.textContent = `MW ${String(fixture.week).padStart(2, "0")}`;
  const kickoff = document.createElement("span");
  kickoff.className = "match-time";
  kickoff.textContent = `${formatMatchDate(fixture.date)} · ${fixture.time}`;
  metaLeft.append(week, kickoff);
  meta.append(metaLeft);
  if (played) {
    const result = document.createElement("span");
    result.className = "match-result";
    result.innerHTML = "<i></i> FULL TIME";
    meta.append(result);
  }

  const content = document.createElement("div");
  content.className = "match-content";
  const homeLabel = document.createElement("div");
  homeLabel.className = "match-team";
  homeLabel.append(createTeamMark(home));
  const homeName = document.createElement("span");
  homeName.className = "team-name";
  homeName.textContent = home.name;
  homeLabel.append(homeName);

  const score = document.createElement("span");
  score.className = `match-score${played ? "" : " upcoming"}`;
  score.textContent = played ? `${fixture.homeScore} – ${fixture.awayScore}` : "vs";

  const awayLabel = document.createElement("div");
  awayLabel.className = "match-team away";
  const awayName = document.createElement("span");
  awayName.className = "team-name";
  awayName.textContent = away.name;
  awayLabel.append(awayName, createTeamMark(away));

  const action = document.createElement("button");
  action.className = "match-action";
  action.type = "button";
  action.dataset.editMatch = fixture.id;
  action.setAttribute("aria-label", `Edit ${home.name} versus ${away.name}`);
  action.title = played ? "Edit match or result" : "Edit fixture or enter result";
  action.textContent = "↗";
  content.append(homeLabel, score, awayLabel, action);

  const venue = document.createElement("div");
  venue.className = "venue-line";
  venue.textContent = `⌖ ${fixture.venue || `${home.name} home ground`}`;
  row.append(meta, content, venue);
  return row;
}

/** Apply all selected filters before sorting matches into kickoff order. */
function getFilteredFixtures() {
  const selectedWeek = $("#week-filter").value;
  const selectedTeam = $("#team-filter").value;
  const selectedStatus = $("#status-filter").value;
  return fixtures.filter((fixture) =>
    (selectedWeek === "all" || fixture.week === Number(selectedWeek)) &&
    (selectedTeam === "all" || fixture.homeId === selectedTeam || fixture.awayId === selectedTeam) &&
    (selectedStatus === "all" ||
      (selectedStatus === "played" && fixture.homeScore !== null) ||
      (selectedStatus === "upcoming" && fixture.homeScore === null))
  ).sort((left, right) =>
    left.date.localeCompare(right.date) || left.time.localeCompare(right.time) || left.id.localeCompare(right.id)
  );
}

/** Render one page and keep pagination counts and disabled states synchronized. */
function renderFixtures() {
  const matches = getFilteredFixtures();
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  currentPage = Math.min(currentPage, pageCount);
  const list = $("#fixture-list");
  list.replaceChildren();

  if (matches.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const heading = document.createElement("strong");
    heading.textContent = "No matches in this view";
    const message = document.createElement("span");
    message.textContent = "Try another filter or schedule a new fixture.";
    empty.append(heading, message);
    list.append(empty);
  } else {
    const start = (currentPage - 1) * pageSize;
    matches.slice(start, start + pageSize).forEach((fixture) => list.append(createMatchRow(fixture)));
  }
  const startNumber = matches.length ? (currentPage - 1) * pageSize + 1 : 0;
  const endNumber = Math.min(currentPage * pageSize, matches.length);
  $("#fixture-count").textContent = matches.length ? `${startNumber}–${endNumber} of ${matches.length} matches` : "0 matches";
  $("#page-indicator").textContent = `${currentPage} / ${pageCount}`;
  $("#previous-page").disabled = currentPage <= 1;
  $("#next-page").disabled = currentPage >= pageCount;
}

/** Recompute every data view after a schedule or result change. */
function renderDashboard() {
  const standings = calculateStandings();
  renderStandings(standings);
  renderMetrics(standings);
  renderFixtures();
}

/** Populate club and matchweek options from the shared league data. */
function populateFilters() {
  const teamFilter = $("#team-filter");
  const homeTeam = $("#home-team");
  const awayTeam = $("#away-team");
  teams.forEach((team) => {
    const teamOption = document.createElement("option");
    teamOption.value = team.id;
    teamOption.textContent = team.name;
    teamFilter.append(teamOption);
    const homeOption = teamOption.cloneNode(true);
    const awayOption = teamOption.cloneNode(true);
    homeTeam.append(homeOption);
    awayTeam.append(awayOption);
  });

  for (let week = 1; week <= 38; week++) {
    const label = `Matchweek ${String(week).padStart(2, "0")}`;
    const filterOption = document.createElement("option");
    filterOption.value = String(week);
    filterOption.textContent = label;
    $("#week-filter").append(filterOption);
    const formOption = filterOption.cloneNode(true);
    $("#match-week").append(formOption);
  }
}

/** Return a date input value in local calendar time, not UTC. */
function localToday() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function showFormError(message) {
  const error = $("#form-error");
  error.textContent = message;
  error.hidden = !message;
}

/** Start a blank match form using the current filters as convenient defaults. */
function openNewMatch() {
  $("#match-form").reset();
  $("#match-id").value = "";
  $("#match-week").value = $("#week-filter").value === "all" ? "8" : $("#week-filter").value;
  $("#match-date").value = localToday();
  $("#match-time").value = "15:00";
  $("#home-team").value = $("#team-filter").value === "all" ? teams[0].id : $("#team-filter").value;
  $("#away-team").value = teams.find((team) => team.id !== $("#home-team").value).id;
  $("#match-venue").value = "";
  $("#home-score-label").textContent = teamById.get($("#home-team").value).short;
  $("#away-score-label").textContent = teamById.get($("#away-team").value).short;
  $("#dialog-title").textContent = "Schedule a match";
  $("#save-button-label").textContent = "Save fixture";
  $("#delete-match").hidden = true;
  showFormError("");
  $("#match-dialog").showModal();
}

/** Fill the editor from an existing fixture, including its optional score. */
function openEditMatch(id) {
  const fixture = fixtures.find((match) => match.id === id);
  if (!fixture) {
    showToast("That fixture is no longer available.");
    return;
  }
  $("#match-id").value = fixture.id;
  $("#match-week").value = String(fixture.week);
  $("#match-date").value = fixture.date;
  $("#match-time").value = fixture.time;
  $("#home-team").value = fixture.homeId;
  $("#away-team").value = fixture.awayId;
  $("#match-venue").value = fixture.venue || "";
  $("#home-score").value = fixture.homeScore ?? "";
  $("#away-score").value = fixture.awayScore ?? "";
  $("#home-score-label").textContent = teamById.get(fixture.homeId).short;
  $("#away-score-label").textContent = teamById.get(fixture.awayId).short;
  $("#dialog-title").textContent = fixture.homeScore === null ? "Edit fixture" : "Edit fixture & result";
  $("#save-button-label").textContent = "Save changes";
  $("#delete-match").hidden = false;
  showFormError("");
  $("#match-dialog").showModal();
}

/** Keep home and away clubs distinct and update score labels when changed. */
function onTeamSelectionChange() {
  const home = $("#home-team").value;
  const away = $("#away-team").value;
  if (home === away) {
    const replacement = teams.find((team) => team.id !== home);
    $("#away-team").value = replacement.id;
    $("#away-score-label").textContent = replacement.short;
  }
  $("#home-score-label").textContent = teamById.get($("#home-team").value).short;
}

/** Validate and either add a fixture or replace one before recalculating the table. */
function onMatchSubmit(event) {
  event.preventDefault();
  const existingId = $("#match-id").value;
  const week = Number($("#match-week").value);
  const homeId = $("#home-team").value;
  const awayId = $("#away-team").value;
  const homeScoreText = $("#home-score").value.trim();
  const awayScoreText = $("#away-score").value.trim();
  const homeScore = homeScoreText === "" ? null : Number(homeScoreText);
  const awayScore = awayScoreText === "" ? null : Number(awayScoreText);

  if (homeId === awayId) return showFormError("Choose two different clubs.");
  if ((homeScore === null) !== (awayScore === null)) return showFormError("Enter both full-time scores, or leave both blank.");
  if ([homeScore, awayScore].some((score) => score !== null && (!Number.isInteger(score) || score < 0 || score > 99))) {
    return showFormError("Scores must be whole numbers between 0 and 99.");
  }
  const teamAlreadyScheduled = fixtures.some((fixture) =>
    fixture.id !== existingId && fixture.week === week &&
    [fixture.homeId, fixture.awayId].some((teamId) => teamId === homeId || teamId === awayId)
  );
  if (teamAlreadyScheduled) return showFormError("A club can only play once in a matchweek. Choose another matchweek.");

  const match = {
    id: existingId || `match-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    week,
    date: $("#match-date").value,
    time: $("#match-time").value,
    homeId,
    awayId,
    homeScore,
    awayScore,
    venue: $("#match-venue").value.trim() || `${teamById.get(homeId).name} home ground`,
  };
  if (existingId) {
    fixtures = fixtures.map((fixture) => fixture.id === existingId ? match : fixture);
  } else {
    fixtures.push(match);
  }
  saveFixtures();
  $("#match-dialog").close();
  currentPage = 1;
  renderDashboard();
  showToast(homeScore === null ? "Fixture saved to the schedule." : "Result saved — league table updated.");
}

/** Confirm destructive removal before deleting and recomputing standings. */
function deleteCurrentMatch() {
  const id = $("#match-id").value;
  const fixture = fixtures.find((match) => match.id === id);
  if (!fixture) return;
  const home = teamById.get(fixture.homeId).name;
  const away = teamById.get(fixture.awayId).name;
  if (!window.confirm(`Delete ${home} versus ${away}? This will also update the league table.`)) return;
  fixtures = fixtures.filter((match) => match.id !== id);
  saveFixtures();
  $("#match-dialog").close();
  currentPage = 1;
  renderDashboard();
  showToast("Fixture deleted.");
}

/** Wire controls once, initialize filters, then render the initial workspace. */
function initialize() {
  populateFilters();
  $("#status-filter").value = "upcoming";
  $("#schedule-match").addEventListener("click", openNewMatch);
  $("#schedule-match-small").addEventListener("click", openNewMatch);
  ["week-filter", "team-filter", "status-filter"].forEach((id) => {
    $(`#${id}`).addEventListener("change", () => {
      currentPage = 1;
      renderFixtures();
    });
  });
  $("#fixture-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-match]");
    if (button) openEditMatch(button.dataset.editMatch);
  });
  $("#previous-page").addEventListener("click", () => {
    currentPage--;
    renderFixtures();
  });
  $("#next-page").addEventListener("click", () => {
    currentPage++;
    renderFixtures();
  });
  $("#match-form").addEventListener("submit", onMatchSubmit);
  $("#home-team").addEventListener("change", onTeamSelectionChange);
  $("#away-team").addEventListener("change", () => {
    onTeamSelectionChange();
    $("#away-score-label").textContent = teamById.get($("#away-team").value).short;
  });
  $("#close-dialog").addEventListener("click", () => $("#match-dialog").close());
  $("#cancel-dialog").addEventListener("click", () => $("#match-dialog").close());
  $("#delete-match").addEventListener("click", deleteCurrentMatch);
  $("#crest-upload-button").addEventListener("click", () => $("#crest-file-input").click());
  $("#crest-file-input").addEventListener("change", async (event) => {
    await importCrests([...event.target.files]);
    event.target.value = "";
  });
  $("#match-dialog").addEventListener("click", (event) => {
    if (event.target === $("#match-dialog")) $("#match-dialog").close();
  });
  renderDashboard();
}

initialize();
