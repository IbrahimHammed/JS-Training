const data = window.NORTHSTAR_DATA;
const { records, regions, categories, channels, customers, countryLookup } = data;
const oneDay = 86400000;
const endDate = new Date(Math.max(...records.map((record) => Date.parse(`${record.date}T00:00:00Z`))));
const state = { period: 365, region: "all", country: null, category: null };
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const number = new Intl.NumberFormat("en-US");
const svgNS = "http://www.w3.org/2000/svg";

function svgNode(tag, attrs = {}) {
  const node = document.createElementNS(svgNS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

// Apply all selected dimensions in one place so every visualization stays coordinated.
function filteredRecords({ includePeriod = true, includeCategory = true } = {}) {
  const start = endDate.getTime() - state.period * oneDay;
  const end = includePeriod ? endDate.getTime() : Infinity;
  const periodStart = includePeriod ? start : -Infinity;
  return records.filter((record) => {
    const timestamp = Date.parse(`${record.date}T00:00:00Z`);
    return timestamp >= periodStart && timestamp <= end &&
      (state.region === "all" || record.region === state.region) &&
      (!state.country || record.country === state.country) &&
      (!includeCategory || !state.category || record.category === state.category);
  });
}

function aggregate(items, key) {
  const result = new Map();
  items.forEach((item) => {
    const current = result.get(item[key]) || { orders: 0, revenue: 0, cost: 0, units: 0 };
    current.orders += 1;
    current.revenue += item.revenue;
    current.cost += item.cost;
    current.units += item.units;
    result.set(item[key], current);
  });
  return result;
}

function sum(items, key) {
  return items.reduce((total, item) => total + item[key], 0);
}

function renderKpis(items) {
  const revenue = sum(items, "revenue");
  const cost = sum(items, "cost");
  const margin = revenue ? ((revenue - cost) / revenue) * 100 : 0;
  const aov = items.length ? revenue / items.length : 0;
  document.querySelector("#kpi-sales").textContent = compactMoney.format(revenue);
  document.querySelector("#kpi-orders").textContent = number.format(items.length);
  document.querySelector("#kpi-margin").innerHTML = `${margin.toFixed(1)}<small>%</small>`;
  document.querySelector("#kpi-aov").textContent = money.format(aov);

  const windowEnd = endDate.getTime() - state.period * oneDay;
  const previousStart = windowEnd - state.period * oneDay;
  const previous = records.filter((record) => {
    const timestamp = Date.parse(`${record.date}T00:00:00Z`);
    return timestamp >= previousStart && timestamp < windowEnd &&
      (state.region === "all" || record.region === state.region) &&
      (!state.country || record.country === state.country) &&
      (!state.category || record.category === state.category);
  });
  const previousRevenue = sum(previous, "revenue");
  const previousMargin = previousRevenue ? ((previousRevenue - sum(previous, "cost")) / previousRevenue) * 100 : 0;
  setTrend("#sales-trend", revenue, previousRevenue, false);
  setTrend("#orders-trend", items.length, previous.length, false);
  const marginTrend = document.querySelector("#margin-trend");
  const marginDelta = margin - previousMargin;
  marginTrend.className = `trend-chip ${marginDelta >= 0 ? "positive" : "negative"}`;
  marginTrend.textContent = `${marginDelta >= 0 ? "↑" : "↓"} ${Math.abs(marginDelta).toFixed(1)} pts`;
  setTrend("#aov-trend", aov, previous.length ? previousRevenue / previous.length : 0, false);
}

function setTrend(selector, current, previous) {
  const element = document.querySelector(selector);
  if (!previous) {
    element.className = "trend-chip neutral";
    element.textContent = "—";
    return;
  }
  const change = ((current - previous) / previous) * 100;
  element.className = `trend-chip ${change >= 0 ? "positive" : "negative"}`;
  element.textContent = `${change >= 0 ? "↑" : "↓"} ${Math.abs(change).toFixed(1)}%`;
}

function renderSparkline(container, values, color) {
  container.replaceChildren();
  if (!values.length) return;
  const width = 64;
  const height = 23;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((value, index) => {
    const x = (index / Math.max(1, values.length - 1)) * width;
    const y = height - 2 - ((value - min) / Math.max(1, max - min)) * (height - 5);
    return `${x},${y}`;
  }).join(" ");
  const svg = svgNode("svg", { viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true" });
  svg.append(svgNode("polyline", { points, fill: "none", stroke: color, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" }));
  container.append(svg);
}

function renderSalesChart(items) {
  const chart = document.querySelector("#sales-chart");
  const definitions = chart.querySelector("defs");
  chart.replaceChildren();
  if (definitions) chart.append(definitions);
  const pointCount = state.period <= 30 ? 7 : state.period <= 90 ? 12 : 12;
  const interval = state.period / pointCount;
  const bins = Array.from({ length: pointCount }, () => 0);
  items.forEach((item) => {
    const age = (endDate.getTime() - Date.parse(`${item.date}T00:00:00Z`)) / oneDay;
    const binIndex = Math.min(pointCount - 1, Math.floor((state.period - age) / interval));
    if (binIndex >= 0) bins[binIndex] += item.revenue;
  });

  const left = 54;
  const right = 758;
  const top = 22;
  const bottom = 194;
  const max = Math.max(...bins, 1) * 1.14;
  for (let index = 0; index < 4; index++) {
    const y = top + ((bottom - top) / 3) * index;
    const value = max * (1 - index / 3);
    chart.append(svgNode("line", { x1: left, y1: y, x2: right, y2: y, class: "chart-gridline" }));
    const label = svgNode("text", { x: 0, y: y + 4, class: "axis-label" });
    label.textContent = compactMoney.format(value);
    chart.append(label);
  }
  const coordinates = bins.map((value, index) => ({
    x: left + (index / Math.max(1, pointCount - 1)) * (right - left),
    y: bottom - (value / max) * (bottom - top),
    value,
    index,
  }));
  const lineData = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
  const areaData = `M ${left} ${bottom} L ${lineData.replaceAll(" ", " L ")} L ${right} ${bottom} Z`;
  chart.append(svgNode("path", { d: areaData, class: "chart-area" }));
  chart.append(svgNode("polyline", { points: lineData, class: "chart-line" }));
  coordinates.forEach((point) => {
    chart.append(svgNode("circle", { cx: point.x, cy: point.y, r: 3.5, class: "chart-point" }));
    const label = svgNode("text", { x: point.x, y: 220, class: "axis-label month-label", "text-anchor": "middle" });
    label.textContent = chartPeriodLabel(point.index, pointCount);
    chart.append(label);
  });
  renderSparkline(document.querySelector("#sales-spark"), bins, "#5676ee");
  renderSparkline(document.querySelector("#orders-spark"), bins.map((value) => value / 850), "#43b995");
  renderSparkline(document.querySelector("#margin-spark"), bins.map((value, index) => value * (0.42 + 0.04 * Math.sin(index))), "#ad75df");
  renderSparkline(document.querySelector("#aov-spark"), bins.map((value, index) => value / Math.max(1, items.length) + index * 100), "#eaa552");
  const periodName = state.period <= 30 ? "Daily" : state.period <= 90 ? "Weekly" : "Monthly";
  document.querySelector("#sales-period-label").textContent = `${periodName} performance · ${number.format(items.length)} orders`;
  document.querySelector("#sales-insight").textContent = bins.length > 1 && bins.at(-1) >= bins[0] ? "Sales are trending up" : "Sales are finding their rhythm";
}

function chartPeriodLabel(index, count) {
  const date = new Date(endDate.getTime() - (state.period * (count - index - 1) / count) * oneDay);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: state.period <= 30 ? "numeric" : undefined }).format(date);
}

function renderCategoryChart(items) {
  const totals = aggregate(items, "category");
  const allRevenue = sum(items, "revenue") || 1;
  const donut = document.querySelector("#category-donut");
  const legend = document.querySelector("#category-legend");
  donut.replaceChildren();
  legend.replaceChildren();
  let angle = -90;
  const cx = 90;
  const cy = 90;
  const radius = 65;

  categories.forEach((category) => {
    const value = totals.get(category.name)?.revenue || 0;
    const sweep = (value / allRevenue) * 360;
    if (sweep > 0) {
      const endAngle = angle + sweep;
      const start = polar(cx, cy, radius, angle);
      const end = polar(cx, cy, radius, endAngle);
      const largeArc = sweep > 180 ? 1 : 0;
      donut.append(svgNode("path", {
        d: `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
        class: `donut-segment${state.category === category.name ? " is-selected" : ""}`,
        stroke: category.color,
        "stroke-width": 17,
        "stroke-linecap": "butt",
        "data-category": category.name,
      }));
    }
    angle += sweep;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `legend-row${state.category === category.name ? " is-selected" : ""}`;
    button.dataset.category = category.name;
    const swatch = document.createElement("i");
    swatch.style.backgroundColor = category.color;
    const name = document.createElement("span");
    name.textContent = category.name;
    const valueNode = document.createElement("strong");
    valueNode.textContent = compactMoney.format(value);
    button.append(swatch, name, valueNode);
    button.addEventListener("click", () => {
      state.category = state.category === category.name ? null : category.name;
      renderDashboard();
    });
    legend.append(button);
  });

  const centerValue = svgNode("text", { x: cx, y: cy - 2, class: "donut-total" });
  centerValue.textContent = compactMoney.format(allRevenue);
  const centerLabel = svgNode("text", { x: cx, y: cy + 15, class: "donut-label" });
  centerLabel.textContent = "NET SALES";
  donut.append(centerValue, centerLabel);
  document.querySelector("#clear-category").hidden = !state.category;
}

function polar(cx, cy, radius, degrees) {
  const radians = (degrees * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

function renderMap(items) {
  const container = document.querySelector("#country-markers");
  const tooltip = document.querySelector("#map-tooltip");
  container.replaceChildren();
  tooltip.hidden = true;
  const totals = aggregate(items, "country");
  const maxSales = Math.max(1, ...[...totals.values()].map((value) => value.revenue));
  countryLookup.forEach((country) => {
    const stats = totals.get(country.name);
    if (!stats) return;
    const x = ((country.longitude + 180) / 360) * 900;
    const y = ((85 - country.latitude) / 145) * 410;
    const radius = 5 + Math.sqrt(stats.revenue / maxSales) * 12;
    const group = svgNode("g", {
      class: `country-marker${state.country === country.name ? " is-selected" : ""}`,
      transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})`,
      tabindex: 0,
      role: "button",
      "aria-label": `${country.name}, ${money.format(stats.revenue)} net sales, ${stats.orders} orders`,
    });
    group.append(svgNode("circle", { r: radius + 4, class: "marker-halo", fill: country.color }));
    group.append(svgNode("circle", { r: radius, class: "marker-core", fill: country.color }));
    const code = svgNode("text", { x: 0, y: 3, class: "marker-code" });
    code.textContent = country.code;
    group.append(code);
    group.addEventListener("mouseenter", (event) => showMapTooltip(tooltip, country, stats, event));
    group.addEventListener("mousemove", (event) => positionTooltip(tooltip, event));
    group.addEventListener("mouseleave", () => { tooltip.hidden = true; });
    group.addEventListener("focus", () => showMapTooltip(tooltip, country, stats));
    group.addEventListener("blur", () => { tooltip.hidden = true; });
    group.addEventListener("click", () => {
      state.country = state.country === country.name ? null : country.name;
      renderDashboard();
    });
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        group.click();
      }
    });
    container.append(group);
  });

  const regionLabel = state.region === "all" ? "all regions" : state.region;
  document.querySelector("#map-summary").textContent = `${totals.size} countries · ${regionLabel} · select a marker to filter`;
  const hasCountryFilter = Boolean(state.country);
  document.querySelector("#clear-country").hidden = !hasCountryFilter;
  document.querySelector("#clear-map-filter").hidden = !hasCountryFilter;
}

function showMapTooltip(tooltip, country, stats, event) {
  tooltip.innerHTML = `<strong>${country.name}</strong><span>${country.region}</span><b>${money.format(stats.revenue)}</b><small>${number.format(stats.orders)} orders</small>`;
  tooltip.hidden = false;
  if (event) positionTooltip(tooltip, event);
}

function positionTooltip(tooltip, event) {
  const bounds = document.querySelector(".map-wrap").getBoundingClientRect();
  tooltip.style.left = `${Math.min(event.clientX - bounds.left + 12, bounds.width - 170)}px`;
  tooltip.style.top = `${Math.max(6, event.clientY - bounds.top - 25)}px`;
}

function renderChannels(items) {
  const container = document.querySelector("#channel-list");
  container.replaceChildren();
  const totals = aggregate(items, "channel");
  const overall = sum(items, "revenue") || 1;
  const colors = ["#607cf4", "#42b995", "#f0a65d", "#b07add"];
  channels.forEach((channel, index) => {
    const stats = totals.get(channel) || { revenue: 0 };
    const row = document.createElement("div");
    row.className = "channel-row";
    const heading = document.createElement("div");
    heading.className = "channel-row-heading";
    const name = document.createElement("span");
    name.innerHTML = `<i style="--channel-color:${colors[index]}"></i>${channel}`;
    const sales = document.createElement("strong");
    sales.textContent = compactMoney.format(stats.revenue);
    heading.append(name, sales);
    const track = document.createElement("div");
    track.className = "channel-track";
    const fill = document.createElement("span");
    fill.style.width = `${(stats.revenue / overall) * 100}%`;
    fill.style.backgroundColor = colors[index];
    track.append(fill);
    const percent = document.createElement("small");
    percent.textContent = `${((stats.revenue / overall) * 100).toFixed(1)}% of sales`;
    row.append(heading, track, percent);
    container.append(row);
  });

  const customerList = document.querySelector("#customer-list");
  customerList.replaceChildren();
  const customerTotals = aggregate(items, "customerType");
  const customerColors = ["#607cf4", "#42b995", "#efa75e"];
  customers.forEach((customer, index) => {
    const stats = customerTotals.get(customer) || { orders: 0 };
    const row = document.createElement("div");
    row.className = "customer-row";
    row.innerHTML = `<span><i style="--customer-color:${customerColors[index]}"></i>${customer}</span><strong>${number.format(stats.orders)}</strong><small>${items.length ? ((stats.orders / items.length) * 100).toFixed(0) : 0}%</small>`;
    customerList.append(row);
  });
}

function renderCountryTable(items) {
  const tbody = document.querySelector("#country-table");
  tbody.replaceChildren();
  const totals = aggregate(items, "country");
  const sorted = [...totals.entries()].sort((left, right) => right[1].revenue - left[1].revenue).slice(0, 6);
  const allRevenue = sum(items, "revenue") || 1;
  sorted.forEach(([countryName, stats], index) => {
    const country = countryLookup.get(countryName);
    const row = document.createElement("tr");
    row.className = state.country === countryName ? "is-selected" : "";
    const countryCell = document.createElement("td");
    countryCell.innerHTML = `<span class="country-rank">${String(index + 1).padStart(2, "0")}</span><span class="flag-dot" style="--flag-color:${country.color}"></span><strong>${countryName}</strong>`;
    const regionCell = document.createElement("td");
    regionCell.textContent = country.region;
    const ordersCell = document.createElement("td");
    ordersCell.textContent = number.format(stats.orders);
    const revenueCell = document.createElement("td");
    revenueCell.className = "table-revenue";
    revenueCell.textContent = money.format(stats.revenue);
    const shareCell = document.createElement("td");
    const share = (stats.revenue / allRevenue) * 100;
    shareCell.innerHTML = `<span class="share-wrap"><i><b style="width:${share}%"></b></i><small>${share.toFixed(1)}%</small></span>`;
    row.append(countryCell, regionCell, ordersCell, revenueCell, shareCell);
    row.addEventListener("click", () => {
      state.country = state.country === countryName ? null : countryName;
      renderDashboard();
    });
    tbody.append(row);
  });
  document.querySelector("#table-summary").textContent = state.country
    ? `Selected market · ${state.country}`
    : `Top ${sorted.length} markets by net sales`;
}

function renderDashboard() {
  const items = filteredRecords();
  renderKpis(items);
  renderSalesChart(items);
  renderCategoryChart(items);
  renderMap(items);
  renderChannels(items);
  renderCountryTable(items);
}

function initialize() {
  document.querySelector("#report-date").textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date()).toUpperCase();
  const regionFilter = document.querySelector("#region-filter");
  regions.forEach((region) => {
    const option = document.createElement("option");
    option.value = region.name;
    option.textContent = region.name;
    regionFilter.append(option);
  });
  document.querySelector("#period-filter").addEventListener("change", (event) => {
    state.period = Number(event.target.value);
    renderDashboard();
  });
  regionFilter.addEventListener("change", (event) => {
    state.region = event.target.value;
    state.country = null;
    renderDashboard();
  });
  document.querySelector("#reset-filters").addEventListener("click", () => {
    state.period = 365;
    state.region = "all";
    state.country = null;
    state.category = null;
    document.querySelector("#period-filter").value = "365";
    regionFilter.value = "all";
    renderDashboard();
  });
  document.querySelector("#clear-category").addEventListener("click", () => {
    state.category = null;
    renderDashboard();
  });
  ["clear-country", "clear-map-filter"].forEach((id) => document.querySelector(`#${id}`).addEventListener("click", () => {
    state.country = null;
    renderDashboard();
  }));
  renderDashboard();
}

initialize();
