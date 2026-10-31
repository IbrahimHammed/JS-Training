// This dashboard deliberately simulates GPS updates locally; it is not connected
// to vehicles, drivers, a cellular network, or a dispatch provider.
// Shared demo data is supplied by data.js; every page loads this script but
// initializes only the components that exist on that page.
const seedData = window.WAYFINDER_DATA;
const cities = seedData.cities;
const cityById = new Map(cities.map((city) => [city.id, city]));
const dataStorageKey = "wayfinder-nigeria-fleet-v1";
const headquarters = cityById.get("lagos");
const vehicleSymbols = { car: "C", bike: "B", truck: "T" };
const pageSize = 8;
const $ = (selector) => document.querySelector(selector);
const svgNS = "http://www.w3.org/2000/svg";
const numberFormat = new Intl.NumberFormat("en-NG");
// Each page starts from a copy so edits do not mutate the immutable seed arrays.
let staff = seedData.staff.map((member) => ({ ...member }));
let vehicles = seedData.vehicles.map((vehicle) => ({ ...vehicle }));
let selectedVehicleId = null;
let currentPage = 1;
let mapScale = 1;
let toastTimer;
let lastDynamicAlertAt = Date.now();
let alertRenderSignature = "";

// Show short, accessible feedback after actions and surface storage errors.
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4200);
}

// Merge browser-saved staff and assignments with the seeded fleet. Vehicle
// movement is intentionally regenerated per page load; only registrations,
// staff, and assignment fields are persisted.
function loadSavedWorkspace() {
  try {
    const raw = localStorage.getItem(dataStorageKey);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object" || !Array.isArray(saved.vehicles) || !Array.isArray(saved.staff)) {
      throw new Error("saved fleet workspace has an invalid format");
    }

    const knownStaff = new Map(staff.map((member) => [member.id, member]));
    saved.staff.forEach((member) => {
      if (member && typeof member.id === "string" && typeof member.name === "string" && member.name.trim()) {
        knownStaff.set(member.id, {
          id: member.id,
          name: member.name.trim().slice(0, 60),
          role: typeof member.role === "string" ? member.role.slice(0, 50) : "Delivery associate",
          phone: typeof member.phone === "string" ? member.phone.slice(0, 20) : "",
        });
      }
    });

    const knownVehicles = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
    saved.vehicles.forEach((vehicle) => {
      if (
        vehicle && typeof vehicle.id === "string" &&
        ["car", "bike", "truck"].includes(vehicle.type) &&
        typeof vehicle.staffId === "string" && knownStaff.has(vehicle.staffId) &&
        typeof vehicle.destinationId === "string" && cityById.has(vehicle.destinationId) &&
        vehicle.destinationId !== headquarters.id
      ) {
        const existing = knownVehicles.get(vehicle.id);
        knownVehicles.set(vehicle.id, {
          ...(existing || {}),
          id: vehicle.id.slice(0, 24),
          type: vehicle.type,
          staffId: vehicle.staffId,
          destinationId: vehicle.destinationId,
          note: typeof vehicle.note === "string" ? vehicle.note.slice(0, 60) : "Assigned delivery run",
          progress: existing?.progress ?? 0.18 + Math.random() * 0.6,
          speed: existing?.speed ?? 0.00006 + Math.random() * 0.000075,
          deviating: existing?.deviating ?? false,
          deviationOffset: existing?.deviationOffset ?? 22 + Math.random() * 20,
          deviationDirection: existing?.deviationDirection ?? (Math.random() > 0.5 ? 1 : -1),
          deviationUntil: existing?.deviationUntil ?? 0,
        });
      }
    });

    staff = [...knownStaff.values()];
    vehicles = [...knownVehicles.values()];
  } catch (error) {
    showToast(`Could not load saved fleet data: ${error.message}`);
  }
}

// Persist only stable vehicle fields so simulated progress and alert timers do
// not appear to be durable GPS history.
function saveWorkspace() {
  try {
    const serializableVehicles = vehicles.map((vehicle) => ({
      id: vehicle.id,
      type: vehicle.type,
      staffId: vehicle.staffId,
      destinationId: vehicle.destinationId,
      note: vehicle.note,
    }));
    localStorage.setItem(dataStorageKey, JSON.stringify({ vehicles: serializableVehicles, staff }));
    return true;
  } catch (error) {
    showToast(`Fleet changes could not be saved in this browser: ${error.message}`);
    return false;
  }
}

// Create SVG elements in the SVG namespace; HTML createElement would produce
// nodes that do not render as map shapes.
function svgNode(tag, attributes = {}) {
  const node = document.createElementNS(svgNS, tag);
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
  return node;
}

// Project the demo's longitude/latitude bounds into the viewBox rectangle that
// is aligned to the bundled Nigeria silhouette.
function mapPoint(location) {
  return {
    x: 85 + ((location.longitude - 2.5) / 12.5) * 830,
    y: 34 + ((14 - location.latitude) / 10) * 700,
  };
}

// Offset each route's quadratic curve perpendicular to its Lagos-to-destination
// line so the many routes remain distinguishable on the map.
function routeControlPoint(destinationPoint) {
  const start = mapPoint(headquarters);
  const dx = destinationPoint.x - start.x;
  const dy = destinationPoint.y - start.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const curve = Math.min(115, distance * 0.17);
  return {
    x: (start.x + destinationPoint.x) / 2 - (dy / distance) * curve,
    y: (start.y + destinationPoint.y) / 2 + (dx / distance) * curve,
  };
}

// Evaluate the quadratic Bezier path at the vehicle's current progress and
// return its endpoints/control point for both rendering and deviation offsets.
function routePosition(vehicle) {
  const destination = cityById.get(vehicle.destinationId);
  const start = mapPoint(headquarters);
  const end = mapPoint(destination);
  const control = routeControlPoint(end);
  const progress = vehicle.progress;
  const remainder = 1 - progress;
  return {
    x: remainder * remainder * start.x + 2 * remainder * progress * control.x + progress * progress * end.x,
    y: remainder * remainder * start.y + 2 * remainder * progress * control.y + progress * progress * end.y,
    control,
    start,
    end,
  };
}

// An alert can be either a seeded persistent deviation or a short timed
// deviation introduced by the simulation.
function isOffRoute(vehicle, now = Date.now()) {
  return Boolean(vehicle.deviating) || vehicle.deviationUntil > now;
}

function staffForVehicle(vehicle) {
  return staff.find((member) => member.id === vehicle.staffId) || { name: "Unassigned staff", role: "Needs assignment", phone: "" };
}

function cityForVehicle(vehicle) {
  return cityById.get(vehicle.destinationId) || cities[1];
}

// Great-circle distance helper retained for map-distance calculations.
// Build one route's SVG path. The selected route receives a stronger animated
// style via CSS while all other routes remain subtle in the background.
function createRoutePath(vehicle, selected = false) {
  const destination = cityById.get(vehicle.destinationId);
  const end = mapPoint(destination);
  const { start } = routePosition(vehicle);
  const control = routeControlPoint(end);
  const path = svgNode("path", {
    class: `assigned-route route-${vehicle.type}${selected ? " is-selected" : ""}`,
    d: `M${start.x.toFixed(1)} ${start.y.toFixed(1)} Q${control.x.toFixed(1)} ${control.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`,
    "data-route-id": vehicle.id,
  });
  return path;
}

// Map symbols are keyboard-operable controls as well as pointer targets.
function createVehiclePin(vehicle) {
  const group = svgNode("g", {
    class: `vehicle-pin type-${vehicle.type}${isOffRoute(vehicle) ? " is-off-route" : ""}`,
    "data-vehicle-id": vehicle.id,
    tabindex: "0",
    role: "button",
    "aria-label": `${vehicle.id}, ${vehicle.type}, ${staffForVehicle(vehicle).name}, destination ${cityForVehicle(vehicle).name}${isOffRoute(vehicle) ? ", off route alert" : ""}`,
  });
  group.append(svgNode("circle", { class: "pin-shadow", r: "12" }));
  group.append(svgNode("circle", { class: "pin-alert-ring", r: "16" }));
  group.append(svgNode("circle", { class: "pin-body", r: "10" }));
  const symbol = svgNode("text", { class: "pin-symbol", x: "0", y: "3.2" });
  symbol.textContent = vehicleSymbols[vehicle.type];
  group.append(symbol);
  group.addEventListener("mouseenter", (event) => showVehicleTooltip(vehicle, event));
  group.addEventListener("mousemove", positionTooltip);
  group.addEventListener("mouseleave", () => { $("#map-tooltip").hidden = true; });
  group.addEventListener("focus", () => showVehicleTooltip(vehicle));
  group.addEventListener("blur", () => { $("#map-tooltip").hidden = true; });
  group.addEventListener("click", () => selectVehicle(vehicle.id));
  group.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectVehicle(vehicle.id);
    }
  });
  return group;
}

// Populate the single positioned tooltip using text nodes so staff-provided
// names and notes are displayed as text, never interpreted as markup.
function showVehicleTooltip(vehicle, event) {
  const tooltip = $("#map-tooltip");
  const destination = cityForVehicle(vehicle);
  const staffMember = staffForVehicle(vehicle);
  tooltip.replaceChildren();
  const title = document.createElement("strong");
  title.textContent = `${vehicle.id} · ${vehicle.type.toUpperCase()}`;
  const person = document.createElement("span");
  person.textContent = staffMember.name;
  const location = document.createElement("b");
  location.textContent = `Lagos → ${destination.name}`;
  const status = document.createElement("small");
  status.textContent = isOffRoute(vehicle) ? `⚠ Off route · ${Math.round(vehicle.deviationOffset * 0.8)} km outside corridor` : `${Math.round(vehicle.progress * 100)}% of assigned route`;
  tooltip.append(title, person, location, status);
  tooltip.hidden = false;
  if (event) positionTooltip(event);
}

// Keep the tooltip inside the map panel regardless of where a symbol is hovered.
function positionTooltip(event) {
  if (!event.clientX && !event.clientY) return;
  const bounds = $(".map-stage").getBoundingClientRect();
  const tooltip = $("#map-tooltip");
  tooltip.style.left = `${Math.max(8, Math.min(event.clientX - bounds.left + 12, bounds.width - 210))}px`;
  tooltip.style.top = `${Math.max(8, Math.min(event.clientY - bounds.top - 18, bounds.height - 94))}px`;
}

// Draw destination labels and the pulsing Lagos hub once whenever the map is
// built; individual vehicle updates only move existing vehicle symbols.
function renderCities() {
  const layer = $("#city-layer");
  layer.replaceChildren();
  cities.filter((city) => !city.hub).forEach((city) => {
    const point = mapPoint(city);
    const group = svgNode("g", { class: "city-pin", transform: `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})` });
    group.append(svgNode("circle", { r: city.name === "Abuja" ? "4.5" : "3", class: "city-dot" }));
    const label = svgNode("text", {
      x: city.longitude < 4.2 ? "8" : "-8",
      y: city.latitude > 11.7 ? "-8" : "13",
      "text-anchor": city.longitude < 4.2 ? "start" : "end",
      class: "city-label",
    });
    label.textContent = city.name;
    group.append(label);
    layer.append(group);
  });

  const hq = mapPoint(headquarters);
  const group = svgNode("g", { class: "headquarters-pin", transform: `translate(${hq.x.toFixed(1)} ${hq.y.toFixed(1)})` });
  group.append(svgNode("circle", { class: "hq-wave hq-wave-one", r: "13" }));
  group.append(svgNode("circle", { class: "hq-wave hq-wave-two", r: "13" }));
  group.append(svgNode("circle", { class: "hq-core", r: "7" }));
  const label = svgNode("text", { x: "-12", y: "24", "text-anchor": "end", class: "hq-label" });
  label.textContent = "WAYFINDER HQ · LAGOS";
  group.append(label);
  $("#hq-layer").replaceChildren(group);
}

// Recreate route and vehicle SVG layers after assignments change. Seeded and
// active deviations receive a lateral offset from their planned route.
function renderMap() {
  const routeLayer = $("#route-layer");
  const vehicleLayer = $("#vehicle-layer");
  routeLayer.replaceChildren();
  vehicleLayer.replaceChildren();
  vehicles.forEach((vehicle) => {
    routeLayer.append(createRoutePath(vehicle, vehicle.id === selectedVehicleId));
    const position = routePosition(vehicle);
    let x = position.x;
    let y = position.y;
    if (isOffRoute(vehicle)) {
      const dx = position.end.x - position.control.x;
      const dy = position.end.y - position.control.y;
      const magnitude = Math.max(1, Math.hypot(dx, dy));
      const offset = vehicle.deviationOffset;
      const wobble = Math.sin(vehicle.progress * 17) * 4;
      x += ((-dy / magnitude) * offset + wobble) * vehicle.deviationDirection;
      y += (dx / magnitude) * offset * vehicle.deviationDirection;
    }
    const pin = createVehiclePin(vehicle);
    pin.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    if (vehicle.id === selectedVehicleId) pin.classList.add("is-selected");
    vehicleLayer.append(pin);
  });
  renderCities();
}

// Update existing symbols in-place on each simulation tick to avoid rebuilding
// all 100 SVG controls every 850 milliseconds.
function updateMapPositions(now) {
  vehicles.forEach((vehicle) => {
    const pin = $(`#vehicle-layer [data-vehicle-id="${vehicle.id}"]`);
    if (!pin) return;
    const position = routePosition(vehicle);
    let x = position.x;
    let y = position.y;
    const offRoute = isOffRoute(vehicle, now);
    if (offRoute) {
      const dx = position.end.x - position.control.x;
      const dy = position.end.y - position.control.y;
      const magnitude = Math.max(1, Math.hypot(dx, dy));
      const offset = vehicle.deviationOffset;
      const wobble = Math.sin(vehicle.progress * 17) * 4;
      x += ((-dy / magnitude) * offset + wobble) * vehicle.deviationDirection;
      y += (dx / magnitude) * offset * vehicle.deviationDirection;
    }
    pin.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    pin.classList.toggle("is-off-route", offRoute);
    pin.classList.toggle("is-selected", vehicle.id === selectedVehicleId);
    pin.setAttribute("aria-label", `${vehicle.id}, ${vehicle.type}, ${staffForVehicle(vehicle).name}, destination ${cityForVehicle(vehicle).name}${offRoute ? ", off route alert" : ""}`);
  });
}

// Selecting an alert or map marker highlights its route without changing the
// saved assignment or disturbing filters on the separate fleet page.
function selectVehicle(id) {
  selectedVehicleId = selectedVehicleId === id ? null : id;
  const vehicle = vehicles.find((item) => item.id === selectedVehicleId);
  if (vehicle) {
    const destination = cityForVehicle(vehicle);
    $("#route-layer").querySelectorAll(".assigned-route").forEach((route) => {
      route.classList.toggle("is-selected", route.dataset.routeId === vehicle.id);
    });
    showToast(`${vehicle.id}: ${staffForVehicle(vehicle).name} · Lagos to ${destination.name}`);
  } else {
    $("#route-layer").querySelectorAll(".assigned-route").forEach((route) => route.classList.remove("is-selected"));
  }
  updateMapPositions(Date.now());
}

// Refresh overview totals from the same in-memory fleet state used by alerts.
function renderMetrics() {
  const now = Date.now();
  const offRoute = vehicles.filter((vehicle) => isOffRoute(vehicle, now));
  const uniqueCities = new Set(vehicles.map((vehicle) => vehicle.destinationId));
  $("#metric-active").textContent = numberFormat.format(vehicles.length);
  $("#metric-deliveries").textContent = numberFormat.format(vehicles.length);
  $("#metric-alerts").textContent = numberFormat.format(offRoute.length);
  $("#metric-cities").textContent = numberFormat.format(uniqueCities.size);
  $("#map-live-count").textContent = numberFormat.format(vehicles.length);
  $("#nav-alert-count").textContent = String(offRoute.length);
  $("#alert-count").textContent = String(offRoute.length);
  $("#metric-alert-note").textContent = offRoute.length
    ? `${offRoute.length} unit${offRoute.length === 1 ? "" : "s"} outside route corridor`
    : "All units on assigned routes";
  $("#alert-summary-title").textContent = offRoute.length ? `${offRoute.length} route deviation${offRoute.length === 1 ? "" : "s"} detected` : "All clear";
  $("#alert-summary-copy").textContent = offRoute.length
    ? "These vehicles are beyond their assigned route."
    : "No vehicles have left their assigned routes.";
  $("#alert-count").classList.toggle("has-alerts", offRoute.length > 0);
  $("#nav-alert-count").classList.toggle("has-alerts", offRoute.length > 0);
}

// Only rebuild alert rows when the set of affected vehicles changes; timed
// progress ticks otherwise need only update the metrics and marker positions.
function renderAlerts(now = Date.now()) {
  const alerts = vehicles.filter((vehicle) => isOffRoute(vehicle, now));
  const signature = alerts.map((vehicle) => vehicle.id).sort().join(",");
  if (signature === alertRenderSignature) return;
  alertRenderSignature = signature;
  const list = $("#alert-list");
  list.replaceChildren();
  if (!alerts.length) {
    const empty = document.createElement("div");
    empty.className = "alert-empty";
    empty.innerHTML = '<span>✓</span><strong>Routes looking good</strong><small>Deviation alerts will appear here.</small>';
    list.append(empty);
    return;
  }
  alerts.slice(0, 5).forEach((vehicle) => {
    const item = document.createElement("button");
    item.className = "alert-item";
    item.type = "button";
    item.dataset.vehicleId = vehicle.id;
    const marker = document.createElement("span");
    marker.className = `mini-vehicle ${vehicle.type}`;
    marker.textContent = vehicleSymbols[vehicle.type];
    const copy = document.createElement("span");
    copy.className = "alert-copy";
    const title = document.createElement("strong");
    title.textContent = `${vehicle.id} · ${cityForVehicle(vehicle).name}`;
    const description = document.createElement("small");
    description.textContent = `${staffForVehicle(vehicle).name} · approx. ${Math.round(vehicle.deviationOffset * 0.8)} km off route`;
    copy.append(title, description);
    const arrow = document.createElement("span");
    arrow.className = "alert-arrow";
    arrow.textContent = "↗";
    item.append(marker, copy, arrow);
    item.addEventListener("click", () => selectVehicle(vehicle.id));
    list.append(item);
  });
  if (alerts.length > 5) {
    const more = document.createElement("button");
    more.className = "more-alerts";
    more.type = "button";
    more.textContent = `View all ${alerts.length} alerts →`;
    more.addEventListener("click", () => {
      window.location.href = "fleet.html?status=off-route";
    });
    list.append(more);
  }
}

// Apply text, vehicle-type, and route-status filters before sorting IDs for a
// stable table order and predictable pagination.
function getFilteredVehicles() {
  const search = $("#fleet-search").value.trim().toLowerCase();
  const type = $("#type-filter").value;
  const routeStatus = $("#route-filter").value;
  return vehicles.filter((vehicle) => {
    const member = staffForVehicle(vehicle);
    const city = cityForVehicle(vehicle);
    const searchMatches = !search ||
      `${vehicle.id} ${vehicle.type} ${member.name} ${member.role} ${vehicle.note} ${city.name} ${city.state}`.toLowerCase().includes(search);
    return searchMatches &&
      (type === "all" || vehicle.type === type) &&
      (routeStatus === "all" || (routeStatus === "off-route" ? isOffRoute(vehicle) : !isOffRoute(vehicle)));
  }).sort((left, right) => left.id.localeCompare(right.id));
}

// Construct a fleet row with DOM nodes, keeping assignment values separate
// from HTML parsing and attaching row selection/edit interactions.
function createFleetRow(vehicle) {
  const member = staffForVehicle(vehicle);
  const city = cityForVehicle(vehicle);
  const offRoute = isOffRoute(vehicle);
  const row = document.createElement("tr");
  row.className = `${offRoute ? "fleet-off-route" : ""}${vehicle.id === selectedVehicleId ? " is-selected" : ""}`;
  row.dataset.vehicleId = vehicle.id;

  const asset = document.createElement("td");
  const assetWrap = document.createElement("span");
  assetWrap.className = "asset-cell";
  const icon = document.createElement("span");
  icon.className = `asset-icon ${vehicle.type}`;
  icon.textContent = vehicleSymbols[vehicle.type];
  const labels = document.createElement("span");
  labels.className = "asset-labels";
  const id = document.createElement("strong");
  id.textContent = vehicle.id;
  const kind = document.createElement("small");
  kind.textContent = vehicle.type === "bike" ? "Motorcycle" : vehicle.type[0].toUpperCase() + vehicle.type.slice(1);
  labels.append(id, kind);
  assetWrap.append(icon, labels);
  asset.append(assetWrap);

  const staffCell = document.createElement("td");
  const staffWrap = document.createElement("span");
  staffWrap.className = "staff-cell";
  const avatar = document.createElement("span");
  avatar.className = "staff-avatar";
  avatar.textContent = member.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const staffLabels = document.createElement("span");
  staffLabels.className = "staff-labels";
  const name = document.createElement("strong");
  name.textContent = member.name;
  const role = document.createElement("small");
  role.textContent = member.role;
  staffLabels.append(name, role);
  staffWrap.append(avatar, staffLabels);
  staffCell.append(staffWrap);

  const destination = document.createElement("td");
  const routeCell = document.createElement("span");
  routeCell.className = "destination-cell";
  const routeIcon = document.createElement("span");
  routeIcon.textContent = "↗";
  const destinationLabel = document.createElement("span");
  destinationLabel.className = "destination-label";
  const destinationName = document.createElement("strong");
  destinationName.textContent = city.name;
  const destinationState = document.createElement("small");
  destinationState.textContent = city.state;
  destinationLabel.append(destinationName, destinationState);
  routeCell.append(routeIcon, destinationLabel);
  destination.append(routeCell);

  const progress = document.createElement("td");
  const progressWrap = document.createElement("span");
  progressWrap.className = "progress-cell";
  const progressTop = document.createElement("span");
  progressTop.className = "progress-top";
  const progressLabel = document.createElement("small");
  progressLabel.textContent = offRoute ? "DEVIATION" : "EN ROUTE";
  const progressValue = document.createElement("strong");
  progressValue.textContent = `${Math.round(vehicle.progress * 100)}%`;
  progressTop.append(progressLabel, progressValue);
  const track = document.createElement("span");
  track.className = "progress-track";
  const fill = document.createElement("i");
  fill.style.width = `${Math.round(vehicle.progress * 100)}%`;
  track.append(fill);
  progressWrap.append(progressTop, track);
  progress.append(progressWrap);

  const status = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `status-badge ${offRoute ? "off-route" : "on-route"}`;
  badge.innerHTML = `<i></i>${offRoute ? "Off route" : "On route"}`;
  status.append(badge);

  const actions = document.createElement("td");
  const edit = document.createElement("button");
  edit.className = "table-action";
  edit.type = "button";
  edit.dataset.editVehicle = vehicle.id;
  edit.setAttribute("aria-label", `Edit ${vehicle.id} allocation`);
  edit.title = "Edit vehicle and staff assignment";
  edit.textContent = "···";
  actions.append(edit);
  row.append(asset, staffCell, destination, progress, status, actions);
  row.addEventListener("click", (event) => {
    if (event.target.closest("[data-edit-vehicle]")) {
      openVehicleDialog(vehicle.id);
      return;
    }
    selectVehicle(vehicle.id);
  });
  return row;
}

// Render the current filtered fleet page, clamp pagination after filtering,
// and keep the optional alert-filter reset control in sync.
function renderFleet() {
  const filtered = getFilteredVehicles();
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  currentPage = Math.min(Math.max(1, currentPage), pageCount);
  const body = $("#fleet-table-body");
  body.replaceChildren();
  if (!filtered.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "fleet-empty";
    cell.textContent = "No vehicles match these filters.";
    row.append(cell);
    body.append(row);
  } else {
    const start = (currentPage - 1) * pageSize;
    filtered.slice(start, start + pageSize).forEach((vehicle) => body.append(createFleetRow(vehicle)));
  }
  const startCount = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
  $("#fleet-showing").textContent = `Showing ${startCount}–${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length} units`;
  $("#fleet-page").textContent = `${currentPage} / ${pageCount}`;
  $("#fleet-prev").disabled = currentPage <= 1;
  $("#fleet-next").disabled = currentPage >= pageCount;
  $("#fleet-total-label").textContent = `${vehicles.length} units`;
  const clearFilter = $("#clear-alert-filter");
  if (clearFilter) clearFilter.hidden = $("#route-filter").value === "all";
}

// Build the staff-to-vehicles index once per directory render, then filter and
// alphabetize the directory while showing each staff member's assignments.
function renderStaffDirectory() {
  const search = $("#staff-search").value.trim().toLowerCase();
  const assignedVehicles = new Map();
  vehicles.forEach((vehicle) => {
    const assignments = assignedVehicles.get(vehicle.staffId) || [];
    assignments.push(vehicle.id);
    assignedVehicles.set(vehicle.staffId, assignments);
  });

  const filteredStaff = staff.filter((member) => {
    const assignments = assignedVehicles.get(member.id) || [];
    return `${member.name} ${member.role} ${member.phone} ${assignments.join(" ")}`.toLowerCase().includes(search);
  }).sort((left, right) => left.name.localeCompare(right.name));

  const body = $("#staff-directory-body");
  body.replaceChildren();
  if (!filteredStaff.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "fleet-empty";
    cell.textContent = "No staff members match this search.";
    row.append(cell);
    body.append(row);
  } else {
    filteredStaff.forEach((member) => {
      const row = document.createElement("tr");
      const memberCell = document.createElement("td");
      const memberWrap = document.createElement("span");
      memberWrap.className = "staff-cell";
      const avatar = document.createElement("span");
      avatar.className = "staff-avatar";
      avatar.textContent = member.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
      const labels = document.createElement("span");
      labels.className = "staff-labels";
      const name = document.createElement("strong");
      name.textContent = member.name;
      const id = document.createElement("small");
      id.textContent = member.id;
      labels.append(name, id);
      memberWrap.append(avatar, labels);
      memberCell.append(memberWrap);

      const roleCell = document.createElement("td");
      roleCell.textContent = member.role;
      const phoneCell = document.createElement("td");
      phoneCell.textContent = member.phone || "—";
      const assignmentCell = document.createElement("td");
      const assignmentIds = assignedVehicles.get(member.id) || [];
      assignmentCell.textContent = assignmentIds.length ? assignmentIds.join(", ") : "Unassigned";
      row.append(memberCell, roleCell, phoneCell, assignmentCell);
      body.append(row);
    });
  }
  $("#staff-total-label").textContent = `${staff.length} staff`;
  $("#staff-showing").textContent = `Showing ${filteredStaff.length} of ${staff.length} staff members`;
}

// Show a small sample of currently on-route units as a visual activity feed;
// timestamps are illustrative demo copy, not a real event log.
function renderActivity() {
  const activity = $("#activity-list");
  activity.replaceChildren();
  vehicles.filter((vehicle) => !isOffRoute(vehicle)).slice(2, 5).forEach((vehicle, index) => {
    const item = document.createElement("div");
    item.className = "activity-item";
    const marker = document.createElement("span");
    marker.className = `activity-marker ${vehicle.type}`;
    marker.textContent = vehicleSymbols[vehicle.type];
    const line = document.createElement("span");
    line.className = "activity-copy";
    const message = document.createElement("strong");
    message.textContent = `${vehicle.id} heading to ${cityForVehicle(vehicle).name}`;
    const detail = document.createElement("small");
    detail.textContent = `${staffForVehicle(vehicle).name} · ${index + 2} min ago`;
    line.append(message, detail);
    const pulse = document.createElement("i");
    pulse.className = "activity-live";
    item.append(marker, line, pulse);
    activity.append(item);
  });
}

// All pages use West Africa Time so the dashboard clock is consistent with HQ.
function updateClock() {
  $("#current-time").textContent = `${new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date())} WAT`;
}

// Zoom by shrinking the SVG viewBox around its center, bounded to keep the
// map usable and to avoid exposing excessive blank space.
function setMapZoom(scale) {
  mapScale = Math.min(1.7, Math.max(0.82, scale));
  const width = 1000 / mapScale;
  const height = 800 / mapScale;
  $("#fleet-map").setAttribute("viewBox", `${(1000 - width) / 2} ${(800 - height) / 2} ${width} ${height}`);
}

// Compose the live overview once at startup; other pages render their own tables.
function renderAll() {
  renderMap();
  renderMetrics();
  renderAlerts();
  renderActivity();
  updateClock();
}

// Advance demo trips, rotate completed destinations, and periodically introduce
// a temporary route deviation to demonstrate the alert workflow.
function updateSimulation() {
  const now = Date.now();
  vehicles.forEach((vehicle) => {
    vehicle.progress += vehicle.speed;
    if (vehicle.progress >= 1) {
      vehicle.progress = 0.015;
      if (!vehicle.deviating) {
        vehicle.destinationId = seedData.destinations[Math.floor(Math.random() * seedData.destinations.length)].id;
      }
    }
  });

  // Create brief extra deviations in the demo so admins can see the alert flow.
  if (now - lastDynamicAlertAt > 24000) {
    const candidates = vehicles.filter((vehicle) => !vehicle.deviating && vehicle.deviationUntil <= now);
    const candidate = candidates[Math.floor(Math.random() * candidates.length)];
    if (candidate) {
      candidate.deviationUntil = now + 18000;
      lastDynamicAlertAt = now;
    }
  }

  updateMapPositions(now);
  renderMetrics();
  renderAlerts(now);
  $("#last-update").textContent = `Updated ${new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())} WAT`;
  updateClock();
}

// Rebuild a select's options from trusted in-memory records and optionally add
// a blank prompt that forces the user to make an explicit choice.
function populateSelect(select, items, getValue, getLabel, emptyLabel) {
  select.replaceChildren();
  if (emptyLabel) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = emptyLabel;
    select.append(placeholder);
  }
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = getValue(item);
    option.textContent = getLabel(item);
    select.append(option);
  });
}

// Share one form for creating a vehicle and editing an existing vehicle's
// assignment. IDs are immutable after registration to preserve references.
function openVehicleDialog(vehicleId = null) {
  const form = $("#vehicle-form");
  form.reset();
  $("#vehicle-error").hidden = true;
  $("#vehicle-id").value = vehicleId || "";
  populateSelect($("#vehicle-staff"), staff, (member) => member.id, (member) => `${member.name} · ${member.role}`, "Choose staff member");
  populateSelect($("#vehicle-destination"), seedData.destinations, (city) => city.id, (city) => `${city.name}, ${city.state}`, "Choose destination");
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  if (vehicle) {
    $("#vehicle-dialog-title").textContent = `Edit ${vehicle.id} assignment`;
    $("#vehicle-save-label").textContent = "Save allocation";
    $("#vehicle-type").value = vehicle.type;
    $("#vehicle-registration").value = vehicle.id;
    $("#vehicle-staff").value = vehicle.staffId;
    $("#vehicle-destination").value = vehicle.destinationId;
    $("#vehicle-note").value = vehicle.note;
    $("#vehicle-registration").readOnly = true;
  } else {
    $("#vehicle-dialog-title").textContent = "Register a vehicle";
    $("#vehicle-save-label").textContent = "Register & assign";
    $("#vehicle-registration").readOnly = false;
    $("#vehicle-type").value = "car";
  }
  $("#vehicle-dialog").showModal();
}

// Reset validation state before opening the dedicated staff-registration form.
function openStaffDialog() {
  $("#staff-form").reset();
  $("#staff-error").hidden = true;
  $("#staff-dialog").showModal();
}

// Validate the assigned employee, destination, and unique asset ID before
// updating the fleet and writing the result to browser storage.
function submitVehicle(event) {
  event.preventDefault();
  const id = $("#vehicle-registration").value.trim().toUpperCase();
  const existing = $("#vehicle-id").value;
  const type = $("#vehicle-type").value;
  const staffId = $("#vehicle-staff").value;
  const destinationId = $("#vehicle-destination").value;
  const error = $("#vehicle-error");
  if (!/^[A-Z0-9-]{3,24}$/.test(id)) {
    error.textContent = "Use 3–24 letters, numbers, or hyphens for the asset ID.";
    error.hidden = false;
    return;
  }
  if (!staff.some((member) => member.id === staffId)) {
    error.textContent = "Select a registered staff member.";
    error.hidden = false;
    return;
  }
  if (!cityById.has(destinationId) || destinationId === headquarters.id) {
    error.textContent = "Select a destination outside the Lagos headquarters.";
    error.hidden = false;
    return;
  }
  if (!existing && vehicles.some((vehicle) => vehicle.id.toLowerCase() === id.toLowerCase())) {
    error.textContent = "That vehicle ID is already in the fleet.";
    error.hidden = false;
    return;
  }

  if (existing) {
    const vehicle = vehicles.find((item) => item.id === existing);
    Object.assign(vehicle, { type, staffId, destinationId, note: $("#vehicle-note").value.trim() || "Assigned delivery run" });
  } else {
    vehicles.push({
      id,
      type,
      staffId,
      destinationId,
      note: $("#vehicle-note").value.trim() || "Assigned delivery run",
      progress: 0.04,
      speed: 0.00006 + Math.random() * 0.000075,
      deviating: false,
      deviationOffset: 25,
      deviationDirection: Math.random() > 0.5 ? 1 : -1,
      deviationUntil: 0,
    });
  }
  const saved = saveWorkspace();
  selectedVehicleId = id;
  currentPage = 1;
  $("#vehicle-dialog").close();
  renderFleet();
  if (saved) showToast(existing ? `${id} allocation updated.` : `${id} registered and allocated.`);
}

// Add staff to the shared in-memory list and persistence store so new hires
// immediately appear in assignment pickers on every page.
function submitStaff(event) {
  event.preventDefault();
  const name = $("#staff-name").value.trim();
  const error = $("#staff-error");
  if (name.length < 2) {
    error.textContent = "Enter a staff member's name.";
    error.hidden = false;
    return;
  }
  const member = {
    id: `STF-${Date.now().toString(36).toUpperCase()}`,
    name,
    role: $("#staff-role").value,
    phone: $("#staff-phone").value.trim(),
  };
  staff.push(member);
  const saved = saveWorkspace();
  if ($("#staff-directory-body")) renderStaffDirectory();
  $("#staff-dialog").close();
  if (saved) showToast(`${member.name} added to the staff directory.`);
}

// Wire only the controls present on the selected page. This allows the overview,
// fleet register, and staff directory to share one script without requiring
// hidden pages' markup or starting the map simulation on management pages.
function initialize() {
  const page = document.body.dataset.page || "overview";
  loadSavedWorkspace();

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  if ($("#vehicle-form")) {
    populateSelect($("#vehicle-staff"), staff, (member) => member.id, (member) => member.name);
    populateSelect($("#vehicle-destination"), seedData.destinations, (city) => city.id, (city) => city.name);
    $("#vehicle-form").addEventListener("submit", submitVehicle);
    $("#register-vehicle").addEventListener("click", () => openVehicleDialog());
  }
  if ($("#staff-form")) {
    $("#staff-form").addEventListener("submit", submitStaff);
    $("#register-staff")?.addEventListener("click", openStaffDialog);
    $("#directory-add-staff")?.addEventListener("click", openStaffDialog);
  }

  if (page === "overview") {
    renderAll();
    $("#center-map").addEventListener("click", () => setMapZoom(1));
    $("#zoom-in").addEventListener("click", () => setMapZoom(mapScale * 1.18));
    $("#zoom-out").addEventListener("click", () => setMapZoom(mapScale / 1.18));
    $("#show-all-vehicles").addEventListener("click", () => {
      window.location.href = "fleet.html";
    });
    $("#clear-alert-filter")?.addEventListener("click", () => {
      $("#route-filter").value = "all";
      currentPage = 1;
      renderFleet();
    });
    window.setInterval(updateSimulation, 850);
  } else if (page === "fleet") {
    renderFleet();
    $("#fleet-table-body").addEventListener("click", (event) => {
      const button = event.target.closest("[data-edit-vehicle]");
      if (button) openVehicleDialog(button.dataset.editVehicle);
    });
    ["fleet-search", "type-filter", "route-filter"].forEach((id) => {
      $(`#${id}`).addEventListener("input", () => {
        currentPage = 1;
        renderFleet();
      });
      $(`#${id}`).addEventListener("change", () => {
        currentPage = 1;
        renderFleet();
      });
    });
    $("#fleet-prev").addEventListener("click", () => { currentPage--; renderFleet(); });
    $("#fleet-next").addEventListener("click", () => { currentPage++; renderFleet(); });
    const statusFilter = new URLSearchParams(window.location.search).get("status");
    if (statusFilter === "off-route") {
      $("#route-filter").value = statusFilter;
      renderFleet();
    }
  } else if (page === "staff") {
    renderStaffDirectory();
    $("#staff-search").addEventListener("input", renderStaffDirectory);
  }
  updateClock();
}

initialize();
