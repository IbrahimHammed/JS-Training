// Deterministic sample data keeps the dashboard reproducible without a data-entry flow or backend.
(() => {
  const regions = [
    { name: "North America", color: "#5d7cfa", countries: [
      ["United States", "US", 39.5, -98.35], ["Canada", "CA", 56.13, -106.35],
      ["Mexico", "MX", 23.63, -102.55],
    ] },
    { name: "Latin America", color: "#ef8c61", countries: [
      ["Brazil", "BR", -14.24, -51.93], ["Chile", "CL", -35.68, -71.54],
      ["Colombia", "CO", 4.57, -74.3],
    ] },
    { name: "Europe", color: "#8b68dc", countries: [
      ["United Kingdom", "GB", 55.38, -3.44], ["Germany", "DE", 51.17, 10.45],
      ["France", "FR", 46.23, 2.21], ["Spain", "ES", 40.46, -3.75],
      ["Netherlands", "NL", 52.13, 5.29],
    ] },
    { name: "Middle East & Africa", color: "#e7ad4d", countries: [
      ["South Africa", "ZA", -30.56, 22.94], ["United Arab Emirates", "AE", 23.42, 53.85],
      ["Saudi Arabia", "SA", 23.89, 45.08], ["Nigeria", "NG", 9.08, 8.68],
    ] },
    { name: "Asia Pacific", color: "#36b89a", countries: [
      ["China", "CN", 35.86, 104.2], ["Japan", "JP", 36.2, 138.25],
      ["India", "IN", 20.59, 78.96], ["Australia", "AU", -25.27, 133.78],
      ["Singapore", "SG", 1.35, 103.82],
    ] },
  ];
  const categories = [
    { name: "Technology", color: "#6685ff", price: 680 },
    { name: "Home & Living", color: "#55c7a4", price: 245 },
    { name: "Fashion", color: "#ee8d72", price: 165 },
    { name: "Beauty", color: "#c27ce0", price: 92 },
    { name: "Sports & Outdoors", color: "#efbd59", price: 210 },
    { name: "Food & Beverage", color: "#60b8d5", price: 58 },
  ];
  const channels = ["Online store", "Retail", "Marketplace", "Wholesale"];
  const customers = ["New customer", "Returning", "Business"];
  const regionWeights = [28, 14, 24, 12, 22];
  const countryWeights = {
    "North America": [72, 20, 8], "Latin America": [54, 26, 20],
    Europe: [34, 27, 20, 11, 8], "Middle East & Africa": [32, 28, 22, 18],
    "Asia Pacific": [34, 25, 21, 13, 7],
  };
  const channelWeights = [42, 27, 21, 10];
  const customerWeights = [38, 48, 14];

  let seed = 932018;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function chooseWeighted(items, weights) {
    let value = random() * weights.reduce((sum, weight) => sum + weight, 0);
    for (let index = 0; index < items.length; index++) {
      value -= weights[index];
      if (value < 0) return items[index];
    }
    return items[items.length - 1];
  }

  const countryLookup = new Map(regions.flatMap((region) => region.countries.map((country) => [
    country[0], { name: country[0], code: country[1], latitude: country[2], longitude: country[3], region: region.name, color: region.color },
  ])));
  const records = [];
  const end = new Date(Date.UTC(2026, 9, 17));
  for (let index = 0; index < 1000; index++) {
    const region = chooseWeighted(regions, regionWeights);
    const countryName = chooseWeighted(region.countries, countryWeights[region.name])[0];
    const country = countryLookup.get(countryName);
    const category = chooseWeighted(categories, [25, 20, 18, 12, 14, 11]);
    const channel = chooseWeighted(channels, channelWeights);
    const customerType = chooseWeighted(customers, customerWeights);
    const units = 1 + Math.floor(random() * 7);
    const season = 1 + 0.08 * Math.sin((index / 1000) * Math.PI * 2);
    const regionMultiplier = region.name === "North America" ? 1.1 : region.name === "Asia Pacific" ? 1.04 : 0.94;
    const revenue = Math.round(category.price * units * (0.82 + random() * 0.48) * season * regionMultiplier);
    const marginRate = 0.24 + random() * 0.25 + (channel === "Online store" ? 0.025 : 0);
    const dayOffset = Math.floor(random() * 730);
    const date = new Date(end.getTime() - dayOffset * 86400000);
    records.push({
      id: `NS-${String(10001 + index)}`,
      date: date.toISOString().slice(0, 10),
      region: region.name,
      country: country.name,
      countryCode: country.code,
      latitude: country.latitude,
      longitude: country.longitude,
      category: category.name,
      channel,
      customerType,
      units,
      revenue,
      cost: Math.round(revenue * (1 - marginRate)),
    });
  }

  window.NORTHSTAR_DATA = { records, regions, categories, channels, customers, countryLookup };
})();
