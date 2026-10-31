(() => {
  // This file provides deterministic browser-side demo data. Coordinates use
  // WGS84 and represent simplified city locations, not street-level addresses.
  // Lagos is the only hub; all other listed cities can be trip destinations.
  const cities = [
    { id: "lagos", name: "Lagos", state: "Lagos", latitude: 6.5244, longitude: 3.3792, hub: true },
    { id: "abeokuta", name: "Abeokuta", state: "Ogun", latitude: 7.1475, longitude: 3.3619 },
    { id: "ibadan", name: "Ibadan", state: "Oyo", latitude: 7.3775, longitude: 3.9470 },
    { id: "akure", name: "Akure", state: "Ondo", latitude: 7.2571, longitude: 5.2058 },
    { id: "ilorin", name: "Ilorin", state: "Kwara", latitude: 8.4966, longitude: 4.5421 },
    { id: "lokoja", name: "Lokoja", state: "Kogi", latitude: 7.8023, longitude: 6.7333 },
    { id: "benin", name: "Benin City", state: "Edo", latitude: 6.3350, longitude: 5.6037 },
    { id: "warri", name: "Warri", state: "Delta", latitude: 5.5167, longitude: 5.7500 },
    { id: "owerri", name: "Owerri", state: "Imo", latitude: 5.4836, longitude: 7.0333 },
    { id: "onitsha", name: "Onitsha", state: "Anambra", latitude: 6.1500, longitude: 6.7833 },
    { id: "enugu", name: "Enugu", state: "Enugu", latitude: 6.4584, longitude: 7.5464 },
    { id: "port-harcourt", name: "Port Harcourt", state: "Rivers", latitude: 4.8156, longitude: 7.0498 },
    { id: "calabar", name: "Calabar", state: "Cross River", latitude: 4.9757, longitude: 8.3417 },
    { id: "uyo", name: "Uyo", state: "Akwa Ibom", latitude: 5.0377, longitude: 7.9128 },
    { id: "makurdi", name: "Makurdi", state: "Benue", latitude: 7.7322, longitude: 8.5391 },
    { id: "abuja", name: "Abuja", state: "FCT", latitude: 9.0765, longitude: 7.3986 },
    { id: "jos", name: "Jos", state: "Plateau", latitude: 9.8965, longitude: 8.8583 },
    { id: "kaduna", name: "Kaduna", state: "Kaduna", latitude: 10.5105, longitude: 7.4165 },
    { id: "kano", name: "Kano", state: "Kano", latitude: 12.0022, longitude: 8.5920 },
    { id: "sokoto", name: "Sokoto", state: "Sokoto", latitude: 13.0059, longitude: 5.2476 },
    { id: "maiduguri", name: "Maiduguri", state: "Borno", latitude: 11.8311, longitude: 13.1510 },
    { id: "bauchi", name: "Bauchi", state: "Bauchi", latitude: 10.3103, longitude: 9.8439 },
    { id: "minna", name: "Minna", state: "Niger", latitude: 9.6139, longitude: 6.5569 },
    { id: "yola", name: "Yola", state: "Adamawa", latitude: 9.2035, longitude: 12.4954 },
  ];

  // Name pools create plausible synthetic profiles without real employee data.
  // Combining the pools creates repeatable fictional names for the seed roster.
  const firstNames = [
    "Ada", "Adebayo", "Aisha", "Amaka", "Bello", "Chidi", "Chinwe", "Danjuma",
    "Emeka", "Fatima", "Hauwa", "Ibrahim", "Ifunanya", "James", "Kabiru", "Kemi",
    "Ngozi", "Ola", "Olu", "Peter", "Sadiq", "Samuel", "Tunde", "Zainab",
  ];
  const lastNames = [
    "Abiola", "Adebisi", "Adesanya", "Ahmed", "Akinyemi", "Bala", "Bello", "Chukwu",
    "Danladi", "Eze", "Garba", "Ibrahim", "Ifeanyi", "Lawal", "Mohammed", "Nwosu",
    "Okafor", "Okonkwo", "Oladipo", "Salami", "Sule", "Udo", "Yusuf", "Zakari",
  ];
  // Exclude the Lagos hub from destinations so each assignment represents a
  // journey from HQ to another Nigerian city.
  const destinations = cities.filter((city) => !city.hub);
  const types = ["car", "bike", "truck"];
  // A staff member is seeded for every initial vehicle. Role and phone values
  // are fictional and exist only to make the management pages demonstrable.
  const staff = Array.from({ length: 100 }, (_, index) => ({
    id: `STF-${String(index + 1).padStart(3, "0")}`,
    name: `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`,
    role: index % 4 === 0 ? "Sales representative" : index % 9 === 0 ? "Field supervisor" : "Delivery associate",
    phone: `+234 80${String(10000000 + index * 7919).slice(-8)}`,
  }));
  // These counts define the exact 100-vehicle composition shown on the map.
  const vehicleCounts = { car: 48, bike: 32, truck: 20 };

  // A small linear-congruential generator keeps the initial fleet reproducible
  // across reloads while still varying destinations, progress, and deviation.
  let seed = 1261020;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const vehicles = [];
  let index = 0;
  // Build vehicles in type groups and bind each one to one seeded staff record.
  // Progress, speed, and deviation attributes are transient simulation state.
  types.forEach((type) => {
    for (let count = 0; count < vehicleCounts[type]; count++) {
      const destination = destinations[Math.floor(random() * destinations.length)];
      const assignedStaff = staff[index];
      const progress = 0.1 + random() * 0.76;
      vehicles.push({
        id: `NG-${String(index + 1).padStart(3, "0")}`,
        type,
        staffId: assignedStaff.id,
        destinationId: destination.id,
        note: type === "truck" ? "Regional stock replenishment" : type === "bike" ? "Local customer delivery" : "Sales and delivery run",
        progress,
        speed: 0.00006 + random() * 0.000075,
        deviating: index % 13 === 4,
        deviationOffset: 22 + random() * 20,
        deviationDirection: random() > 0.5 ? 1 : -1,
        deviationUntil: 0,
      });
      index++;
    }
  });

  // app.js reads this single namespace on the overview, fleet, and staff pages.
  window.WAYFINDER_DATA = { cities, destinations, staff, vehicles };
})();
