const NS = "http://www.w3.org/2000/svg";
const BATCH_SIZE = 500;
const LEG_DURATION = 900;
const LAUNCH_GAP = 165;

const factories = [
  { id: "A", name: "Factory A", capacity: 1000, x: 150, y: 120, color: "#42d9e8" },
  { id: "B", name: "Factory B", capacity: 5000, x: 150, y: 300, color: "#ffba62" },
  { id: "C", name: "Factory C", capacity: 7000, x: 150, y: 480, color: "#a78bfa" },
];
const hubs = [
  { id: "1", name: "Transfer hub 1", x: 600, y: 205 },
  { id: "2", name: "Transfer hub 2", x: 600, y: 425 },
];
const markets = [
  { id: "X", name: "Market X", demand: 3000, x: 1050, y: 120 },
  { id: "Y", name: "Market Y", demand: 4000, x: 1050, y: 300 },
  { id: "Z", name: "Market Z", demand: 5000, x: 1050, y: 480 },
];

const factoryHubCosts = {
  A: { "1": 4, "2": 6 },
  B: { "1": 5, "2": 3 },
  C: { "1": 8, "2": 4 },
};
const hubMarketCosts = {
  "1": { X: 3, Y: 6, Z: 5 },
  "2": { X: 7, Y: 2, Z: 4 },
};

const routeLayer = document.querySelector("#route-layer");
const labelLayer = document.querySelector("#label-layer");
const packetLayer = document.querySelector("#packet-layer");
const nodeLayer = document.querySelector("#node-layer");
const animation = { shipments: [], elapsed: 0, previousTime: 0, running: false, frame: 0, delivered: 0 };
const routeElements = new Map();
const nodeElements = new Map();
const routeTraffic = new Map();
let planShipments = [];
let plannedFlow = 0;
let totalDemandUnits = 0;
let totalSupplyUnits = 0;

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}

function addEdge(graph, from, to, capacity, cost, metadata = null) {
  const forward = { to, reverse: graph[to].length, capacity, cost, initialCapacity: capacity, metadata };
  const reverse = { to: from, reverse: graph[from].length, capacity: 0, cost: -cost, initialCapacity: 0, metadata: null };
  graph[from].push(forward);
  graph[to].push(reverse);
  return forward;
}

function minCostMaxFlow(graph, source, sink, targetFlow) {
  const potentials = Array(graph.length).fill(0);
  let flow = 0;
  let cost = 0;

  while (flow < targetFlow) {
    const distances = Array(graph.length).fill(Infinity);
    const previousNode = Array(graph.length).fill(-1);
    const previousEdge = Array(graph.length).fill(-1);
    const visited = Array(graph.length).fill(false);
    distances[source] = 0;

    for (let pass = 0; pass < graph.length; pass++) {
      let node = -1;
      for (let candidate = 0; candidate < graph.length; candidate++) {
        if (!visited[candidate] && (node === -1 || distances[candidate] < distances[node])) node = candidate;
      }
      if (node === -1 || distances[node] === Infinity) break;
      visited[node] = true;

      graph[node].forEach((edge, edgeIndex) => {
        if (edge.capacity <= 0) return;
        const nextDistance = distances[node] + edge.cost + potentials[node] - potentials[edge.to];
        if (nextDistance >= distances[edge.to]) return;
        distances[edge.to] = nextDistance;
        previousNode[edge.to] = node;
        previousEdge[edge.to] = edgeIndex;
      });
    }

    if (previousNode[sink] === -1) break;
    for (let node = 0; node < graph.length; node++) {
      if (distances[node] < Infinity) potentials[node] += distances[node];
    }

    let amount = targetFlow - flow;
    for (let node = sink; node !== source; node = previousNode[node]) {
      amount = Math.min(amount, graph[previousNode[node]][previousEdge[node]].capacity);
    }
    for (let node = sink; node !== source; node = previousNode[node]) {
      const edge = graph[previousNode[node]][previousEdge[node]];
      edge.capacity -= amount;
      graph[node][edge.reverse].capacity += amount;
      cost += amount * edge.cost;
    }
    flow += amount;
  }
  return { flow, cost };
}

function calculatePlan() {
  totalSupplyUnits = factories.reduce((sum, factory) => sum + factory.capacity, 0);
  totalDemandUnits = markets.reduce((sum, market) => sum + market.demand, 0);
  const targetFlow = Math.min(totalSupplyUnits, totalDemandUnits);
  const names = ["source", ...factories.map((factory) => `factory-${factory.id}`),
    ...hubs.map((hub) => `hub-${hub.id}`), ...markets.map((market) => `market-${market.id}`), "sink"];
  const indexes = new Map(names.map((name, index) => [name, index]));
  const graph = names.map(() => []);
  const routeEdges = new Map();
  const source = indexes.get("source");
  const sink = indexes.get("sink");

  factories.forEach((factory) => addEdge(graph, source, indexes.get(`factory-${factory.id}`), factory.capacity, 0));
  factories.forEach((factory) => hubs.forEach((hub) => {
    const key = `f${factory.id}-h${hub.id}`;
    routeEdges.set(key, addEdge(graph, indexes.get(`factory-${factory.id}`), indexes.get(`hub-${hub.id}`),
      targetFlow, factoryHubCosts[factory.id][hub.id], { key, type: "factory-hub", factoryId: factory.id, hubId: hub.id }));
  }));
  hubs.forEach((hub) => markets.forEach((market) => {
    const key = `h${hub.id}-m${market.id}`;
    routeEdges.set(key, addEdge(graph, indexes.get(`hub-${hub.id}`), indexes.get(`market-${market.id}`),
      targetFlow, hubMarketCosts[hub.id][market.id], { key, type: "hub-market", hubId: hub.id, marketId: market.id }));
  }));
  markets.forEach((market) => addEdge(graph, indexes.get(`market-${market.id}`), sink, market.demand, 0));

  const result = minCostMaxFlow(graph, source, sink, targetFlow);
  const flows = new Map([...routeEdges].map(([key, edge]) => [key, edge.initialCapacity - edge.capacity]));
  return { ...result, flows };
}

function pathForRoute(from, to, side) {
  const startX = side === "factory-hub" ? 260 : 700;
  const endX = side === "factory-hub" ? 500 : 940;
  const firstControlX = side === "factory-hub" ? 360 : 780;
  const secondControlX = side === "factory-hub" ? 400 : 860;
  return `M ${startX} ${from.y} C ${firstControlX} ${from.y}, ${secondControlX} ${to.y}, ${endX} ${to.y}`;
}

function midpoint(path) {
  const probe = svgElement("path", { d: path });
  return probe.getPointAtLength(probe.getTotalLength() / 2);
}

function renderRoutes(flows) {
  routeLayer.replaceChildren();
  labelLayer.replaceChildren();
  routeElements.clear();

  for (const factory of factories) {
    for (const hub of hubs) {
      const key = `f${factory.id}-h${hub.id}`;
      addRoute(key, pathForRoute(factory, hub, "factory-hub"), factoryHubCosts[factory.id][hub.id],
        flows.get(key) || 0, factory.color, factory.id.charCodeAt(0) + Number(hub.id.charCodeAt(0)));
    }
  }
  for (const hub of hubs) {
    for (const market of markets) {
      const key = `h${hub.id}-m${market.id}`;
      addRoute(key, pathForRoute(hub, market, "hub-market"), hubMarketCosts[hub.id][market.id],
        flows.get(key) || 0, "#a7bac8", Number(hub.id) + market.id.charCodeAt(0));
    }
  }
}

function addRoute(key, path, unitCost, flow, color, offset) {
  const route = svgElement("path", {
    id: `route-${key}`,
    class: `route${flow > 0 ? " has-flow" : ""}`,
    d: path,
    style: `--route-color:${color};--route-width:${Math.min(5.5, 1.7 + flow / 2400)}px`,
  });
  const title = svgElement("title");
  title.textContent = `${key}: ${unitCost} cost units per item, ${flow.toLocaleString()} units routed`;
  route.append(title);
  routeLayer.append(route);
  routeElements.set(key, route);

  const point = midpoint(path);
  const labelOffsets = {
    "fA-h1": -6, "fA-h2": 12, "fB-h1": -12, "fB-h2": 8, "fC-h1": -12, "fC-h2": 8,
    "h1-mX": 0, "h1-mY": -10, "h1-mZ": -10, "h2-mX": 10, "h2-mY": 10, "h2-mZ": 10,
  };
  const dy = labelOffsets[key] ?? ((offset % 3) - 1) * 15;
  const group = svgElement("g", { class: "route-label", transform: `translate(${point.x} ${point.y + dy})` });
  const text = svgElement("text", { y: 0 });
  text.textContent = `${unitCost}/u · ${compactNumber(flow)}`;
  const width = Math.max(66, text.textContent.length * 6.1 + 14);
  group.append(svgElement("rect", { x: -width / 2, y: -10, width, height: 20, rx: 5 }));
  group.append(text);
  labelLayer.append(group);
}

function compactNumber(number) {
  if (number >= 1000) return `${(number / 1000).toFixed(number % 1000 === 0 ? 0 : 1)}k`;
  return String(number);
}

function renderNodes() {
  nodeLayer.replaceChildren();
  nodeElements.clear();
  factories.forEach((factory) => addNode(factory, "factory",
    `CAPACITY ${factory.capacity.toLocaleString()}`));
  hubs.forEach((hub) => addNode(hub, "hub", "TRANSFER HUB"));
  markets.forEach((market) => addNode(market, "market",
    `DEMAND ${market.demand.toLocaleString()}`));
}

function addNode(node, kind, typeText) {
  const width = kind === "hub" ? 200 : 220;
  const height = 96;
  const x = node.x - width / 2;
  const y = node.y - height / 2;
  const group = svgElement("g", { class: `node-card ${kind}` });
  group.append(svgElement("rect", { x, y, width, height, rx: 9 }));
  group.append(svgElement("line", { class: "node-accent", x1: x + 12, y1: y + 14, x2: x + 12, y2: y + height - 14 }));
  const title = svgElement("text", { class: "node-title", x: x + 25, y: y + 25 });
  title.textContent = node.name;
  const type = svgElement("text", { class: "node-type", x: x + 25, y: y + 42 });
  type.textContent = typeText;
  group.append(title, type);
  const details = [];
  const detailCount = kind === "hub" ? 2 : 1;
  for (let index = 0; index < detailCount; index++) {
    const detail = svgElement("text", {
      class: `node-flow${index > 0 ? " node-flow-secondary" : ""}`,
      x: x + 25,
      y: y + 64 + index * 14,
    });
    group.append(detail);
    details.push(detail);
  }
  nodeLayer.append(group);
  nodeElements.set(node.id, { details, node, kind });
  updateNodeDetails(node.id);
}

function makeShipments(flows) {
  const inbound = new Map(hubs.map((hub) => [hub.id, factories.map((factory) => ({
    factory, amount: flows.get(`f${factory.id}-h${hub.id}`) || 0,
  })).filter((entry) => entry.amount > 0)]));
  const outbound = new Map(hubs.map((hub) => [hub.id, markets.map((market) => ({
    market, amount: flows.get(`h${hub.id}-m${market.id}`) || 0,
  })).filter((entry) => entry.amount > 0)]));
  const shipments = [];

  hubs.forEach((hub) => {
    const sources = inbound.get(hub.id);
    const sinks = outbound.get(hub.id);
    let sourceIndex = 0;
    let sinkIndex = 0;
    while (sourceIndex < sources.length && sinkIndex < sinks.length) {
      const source = sources[sourceIndex];
      const sink = sinks[sinkIndex];
      const amount = Math.min(source.amount, sink.amount);
      shipments.push({ factory: source.factory, hub, market: sink.market, amount });
      source.amount -= amount;
      sink.amount -= amount;
      if (source.amount === 0) sourceIndex++;
      if (sink.amount === 0) sinkIndex++;
    }
  });

  const batches = [];
  const batchSize = Math.max(BATCH_SIZE, Math.ceil(Math.min(totalSupplyUnits, totalDemandUnits) / 500));
  shipments.forEach((shipment) => {
    let remaining = shipment.amount;
    while (remaining > 0) {
      const amount = Math.min(batchSize, remaining);
      batches.push({ ...shipment, amount, launch: batches.length * LAUNCH_GAP, packet: null, recordedLegs: new Set() });
      remaining -= amount;
    }
  });
  return batches;
}

function updateNodeFlow(nodeId, text) {
  const element = nodeElements.get(nodeId);
  if (element) element.flow.textContent = text;
}

function createPacket(shipment) {
  const group = svgElement("g", { class: "packet", opacity: 0, "aria-hidden": "true" });
  group.style.color = shipment.factory.color;
  group.append(svgElement("circle", { r: 5, fill: shipment.factory.color }));
  const text = svgElement("text", { x: 8, y: 3 });
  text.textContent = String(shipment.amount);
  group.append(text);
  packetLayer.append(group);
  return group;
}

function prepareAnimation() {
  packetLayer.replaceChildren();
  animation.shipments = planShipments.map((shipment) => ({
    ...shipment,
    packet: createPacket(shipment),
    recordedLegs: new Set(),
    legs: [
      document.querySelector(`#route-f${shipment.factory.id}-h${shipment.hub.id}`),
      document.querySelector(`#route-h${shipment.hub.id}-m${shipment.market.id}`),
    ].map((path) => ({ path, length: path.getTotalLength() })),
  }));
  animation.elapsed = 0;
  animation.delivered = 0;
  animation.previousTime = 0;
  routeTraffic.clear();
  for (const factory of factories) {
    for (const hub of hubs) routeTraffic.set(`f${factory.id}-h${hub.id}`, 0);
  }
  for (const hub of hubs) {
    for (const market of markets) routeTraffic.set(`h${hub.id}-m${market.id}`, 0);
  }
  updateProgress();
  resetNodeFlows();
}

function resetNodeFlows() {
  nodeElements.forEach(({ node }) => updateNodeDetails(node.id));
}

function recordLegDelivery(shipment, legIndex) {
  if (shipment.recordedLegs.has(legIndex)) return;
  shipment.recordedLegs.add(legIndex);
  const quantity = shipment.amount;
  const routeKey = legIndex === 0
    ? `f${shipment.factory.id}-h${shipment.hub.id}`
    : `h${shipment.hub.id}-m${shipment.market.id}`;
  routeTraffic.set(routeKey, routeTraffic.get(routeKey) + quantity);
  if (legIndex === 0) {
    updateNodeDetails(shipment.factory.id);
  } else {
    updateNodeDetails(shipment.market.id);
    animation.delivered += quantity;
    updateProgress();
  }
  updateNodeDetails(shipment.hub.id);
}

function updateNodeDetails(nodeId) {
  const entry = nodeElements.get(nodeId);
  if (!entry) return;
  const { details, kind, node } = entry;
  const quantity = (key) => compactNumber(routeTraffic.get(key) || 0);
  if (kind === "factory") {
    details[0].textContent = `to Hub 1: ${quantity(`f${node.id}-h1`)} · Hub 2: ${quantity(`f${node.id}-h2`)}`;
  } else if (kind === "hub") {
    details[0].textContent = `from A: ${quantity(`fA-h${node.id}`)} · B: ${quantity(`fB-h${node.id}`)} · C: ${quantity(`fC-h${node.id}`)}`;
    details[1].textContent = `to X: ${quantity(`h${node.id}-mX`)} · Y: ${quantity(`h${node.id}-mY`)} · Z: ${quantity(`h${node.id}-mZ`)}`;
  } else {
    details[0].textContent = `from Hub 1: ${quantity(`h1-m${node.id}`)} · Hub 2: ${quantity(`h2-m${node.id}`)}`;
  }
}

function updateProgress() {
  document.querySelector("#metric-progress").textContent = animation.delivered.toLocaleString();
  const progressPercent = plannedFlow ? (animation.delivered / plannedFlow) * 100 : 0;
  document.querySelector("#progress-bar").style.width = `${progressPercent}%`;
  document.querySelector("#metric-progress-total").textContent = plannedFlow.toLocaleString();
  if (animation.delivered >= plannedFlow && plannedFlow > 0) {
    const unmetDemand = totalDemandUnits - plannedFlow;
    document.querySelector("#run-status").textContent = unmetDemand
      ? `Plan complete · ${unmetDemand.toLocaleString()} demand unmet`
      : "All demand delivered";
    return;
  }
  if (plannedFlow === 0) {
    document.querySelector("#run-status").textContent = "No units available to ship";
    return;
  }
  if (animation.running) document.querySelector("#run-status").textContent = "Shipments in transit";
}

function animationFrame(timestamp) {
  if (!animation.running) return;
  if (!animation.previousTime) animation.previousTime = timestamp;
  const delta = Math.min(timestamp - animation.previousTime, 50);
  animation.previousTime = timestamp;
  animation.elapsed += delta * Number(document.querySelector("#simulation-speed").value);

  let completed = 0;
  animation.shipments.forEach((shipment) => {
    const activeTime = animation.elapsed - shipment.launch;
    const totalTime = LEG_DURATION * shipment.legs.length;
    if (activeTime < 0) {
      shipment.packet.setAttribute("opacity", "0");
      return;
    }
    if (activeTime >= totalTime) {
      shipment.packet.setAttribute("opacity", "0");
      if (!shipment.completed) {
        shipment.completed = true;
        recordLegDelivery(shipment, 0);
        recordLegDelivery(shipment, 1);
      }
      completed++;
      return;
    }

    const legIndex = Math.floor(activeTime / LEG_DURATION);
    const progress = (activeTime % LEG_DURATION) / LEG_DURATION;
    const leg = shipment.legs[legIndex];
    const point = leg.path.getPointAtLength(leg.length * progress);
    shipment.packet.setAttribute("transform", `translate(${point.x} ${point.y})`);
    shipment.packet.setAttribute("opacity", "1");
    if (legIndex > (shipment.previousLegIndex ?? -1)) {
      shipment.previousLegIndex = legIndex;
      if (legIndex > 0) recordLegDelivery(shipment, legIndex - 1);
    }
  });

  if (completed === animation.shipments.length) {
    animation.running = false;
    setPlayButton(false);
    updateProgress();
    return;
  }
  animation.frame = requestAnimationFrame(animationFrame);
}

function setPlayButton(isRunning) {
  const button = document.querySelector("#play-button");
  button.disabled = !isRunning && plannedFlow === 0;
  if (isRunning) {
    button.innerHTML = '<span aria-hidden="true">Ⅱ</span> Pause';
  } else if (animation.delivered >= plannedFlow && plannedFlow > 0) {
    button.innerHTML = '<span aria-hidden="true">↻</span> Replay';
  } else if (animation.elapsed > 0) {
    button.innerHTML = '<span aria-hidden="true">▶</span> Resume';
  } else {
    button.innerHTML = '<span aria-hidden="true">▶</span> Start simulation';
  }
}

function startAnimation() {
  if (plannedFlow === 0) return;
  if (animation.delivered >= plannedFlow) prepareAnimation();
  if (animation.running) return;
  animation.running = true;
  animation.previousTime = 0;
  setPlayButton(true);
  document.querySelector("#run-status").textContent = "Shipments in transit";
  animation.frame = requestAnimationFrame(animationFrame);
}

function pauseAnimation() {
  animation.running = false;
  cancelAnimationFrame(animation.frame);
  setPlayButton(false);
  if (animation.delivered < plannedFlow) document.querySelector("#run-status").textContent = "Dispatch paused";
}

function resetAnimation() {
  pauseAnimation();
  prepareAnimation();
  document.querySelector("#run-status").textContent = plannedFlow ? "Ready to dispatch" : "No units available to ship";
  setPlayButton(false);
}

function renderRates() {
  const factoryContainer = document.querySelector("#factory-rates");
  const marketContainer = document.querySelector("#market-rates");
  factoryContainer.replaceChildren();
  marketContainer.replaceChildren();
  factories.forEach((factory) => hubs.forEach((hub) => {
    addRate(factoryContainer, `${factory.id} → Hub ${hub.id}`, factoryHubCosts[factory.id][hub.id]);
  }));
  hubs.forEach((hub) => markets.forEach((market) => {
    addRate(marketContainer, `Hub ${hub.id} → ${market.id}`, hubMarketCosts[hub.id][market.id]);
  }));
}

function addRate(container, route, rate) {
  const row = document.createElement("div");
  row.className = "rate-row";
  const name = document.createElement("span");
  name.textContent = route;
  const value = document.createElement("strong");
  value.textContent = `${rate} <em>/ unit</em>`;
  row.append(name, value);
  container.append(row);
}

function updateSummary(plan) {
  plannedFlow = plan.flow;
  const shortfall = Math.max(0, totalDemandUnits - totalSupplyUnits);
  document.querySelector("#metric-delivered").textContent = plan.flow.toLocaleString();
  document.querySelector("#metric-cost").textContent = plan.cost.toLocaleString();
  document.querySelector("#metric-unused").textContent = (totalSupplyUnits - plan.flow).toLocaleString();
  document.querySelector("#metric-demand-note").textContent =
    `of ${totalDemandUnits.toLocaleString()} demand · ${(totalDemandUnits - plan.flow).toLocaleString()} unmet`;
  document.querySelector("#metric-progress-total").textContent = plan.flow.toLocaleString();
  document.querySelector("#factory-total").textContent = `${totalSupplyUnits.toLocaleString()} total capacity`;
  document.querySelector("#market-total").textContent = `${totalDemandUnits.toLocaleString()} total demand`;
  document.querySelector("#footer-totals").textContent =
    `${totalSupplyUnits.toLocaleString()} supply capacity · ${totalDemandUnits.toLocaleString()} required demand`;
  const notice = document.querySelector("#shortfall-notice");
  notice.hidden = shortfall === 0;
  if (shortfall > 0) {
    document.querySelector("#shortfall-title").textContent = "The markets are extra hungry!";
    document.querySelector("#shortfall-detail").textContent =
      `Factories can send ${totalSupplyUnits.toLocaleString()} units, but orders call for ${totalDemandUnits.toLocaleString()}.`;
    document.querySelector("#shortfall-amount").textContent = shortfall.toLocaleString();
  }
}

function applyNetworkInputs(event) {
  event.preventDefault();
  const setupForm = document.querySelector("#network-setup");
  const message = document.querySelector("#setup-message");
  if (!setupForm.reportValidity()) return;
  const values = new FormData(setupForm);
  const capacities = factories.map((factory) => values.get(`capacity-${factory.id}`));
  const demands = markets.map((market) => values.get(`demand-${market.id}`));
  if ([...capacities, ...demands].some((value) => !Number.isSafeInteger(Number(value)))) {
    message.textContent = "Enter whole-number capacities and demands within the allowed range.";
    message.classList.add("is-error");
    return;
  }

  factories.forEach((factory) => { factory.capacity = Number(values.get(`capacity-${factory.id}`)); });
  markets.forEach((market) => { market.demand = Number(values.get(`demand-${market.id}`)); });

  pauseAnimation();
  const plan = calculatePlan();
  if (plan.flow !== Math.min(totalSupplyUnits, totalDemandUnits)) {
    message.textContent = "The network could not route the full possible quantity. Please try different values.";
    message.classList.add("is-error");
    return;
  }
  planShipments = makeShipments(plan.flows);
  updateSummary(plan);
  renderRoutes(plan.flows);
  renderNodes();
  prepareAnimation();
  document.querySelector("#run-status").textContent = plan.flow ? "Ready to dispatch" : "No units available to ship";
  setPlayButton(false);
  const unmet = totalDemandUnits - plan.flow;
  const unused = totalSupplyUnits - plan.flow;
  const outcome = unmet > 0 ? `${unmet.toLocaleString()} demand unmet` : `${unused.toLocaleString()} capacity unused`;
  message.textContent = `Optimized: ${plan.flow.toLocaleString()} units · ${plan.cost.toLocaleString()} cost · ${outcome}.`;
  message.classList.remove("is-error");
}

function initialize() {
  document.querySelector("#network-setup").addEventListener("submit", applyNetworkInputs);
  const plan = calculatePlan();
  if (plan.flow !== Math.min(totalSupplyUnits, totalDemandUnits)) {
    throw new Error(`Only ${plan.flow} of ${Math.min(totalSupplyUnits, totalDemandUnits)} available units can be routed.`);
  }
  planShipments = makeShipments(plan.flows);
  updateSummary(plan);
  renderRoutes(plan.flows);
  renderNodes();
  renderRates();
  prepareAnimation();
  setPlayButton(false);
  document.querySelector("#play-button").addEventListener("click", () => {
    if (animation.running) pauseAnimation();
    else startAnimation();
  });
  document.querySelector("#reset-button").addEventListener("click", resetAnimation);
}

initialize();
