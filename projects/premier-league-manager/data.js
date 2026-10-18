(() => {
  // Team IDs are stable keys shared by generated fixtures, saved results, and the UI.
  const teams = [
    { id: "ars", name: "Arsenal", short: "ARS", color: "#d71920", ink: "#fff" },
    { id: "avl", name: "Aston Villa", short: "AVL", color: "#7b1f3a", ink: "#f4c24f" },
    { id: "bou", name: "AFC Bournemouth", short: "BOU", color: "#b5222b", ink: "#fff" },
    { id: "bre", name: "Brentford", short: "BRE", color: "#c92532", ink: "#fff" },
    { id: "bha", name: "Brighton & Hove Albion", short: "BHA", color: "#0757a8", ink: "#fff" },
    { id: "cov", name: "Coventry City", short: "COV", color: "#1878c9", ink: "#fff" },
    { id: "che", name: "Chelsea", short: "CHE", color: "#1765c0", ink: "#fff" },
    { id: "cry", name: "Crystal Palace", short: "CRY", color: "#2458a6", ink: "#e64452" },
    { id: "eve", name: "Everton", short: "EVE", color: "#174b9b", ink: "#fff" },
    { id: "ful", name: "Fulham", short: "FUL", color: "#f5f5f2", ink: "#202937" },
    { id: "hul", name: "Hull City", short: "HUL", color: "#e9a51d", ink: "#202937" },
    { id: "ips", name: "Ipswich Town", short: "IPS", color: "#2876bf", ink: "#fff" },
    { id: "lee", name: "Leeds United", short: "LEE", color: "#f5f5f2", ink: "#202937" },
    { id: "liv", name: "Liverpool", short: "LIV", color: "#c8102e", ink: "#fff" },
    { id: "mci", name: "Manchester City", short: "MCI", color: "#69c6e8", ink: "#102b49" },
    { id: "mun", name: "Manchester United", short: "MUN", color: "#da291c", ink: "#fff" },
    { id: "new", name: "Newcastle United", short: "NEW", color: "#202733", ink: "#fff" },
    { id: "nfo", name: "Nottingham Forest", short: "NFO", color: "#d32030", ink: "#fff" },
    { id: "sun", name: "Sunderland", short: "SUN", color: "#d71920", ink: "#fff" },
    { id: "tot", name: "Tottenham Hotspur", short: "TOT", color: "#f5f5f2", ink: "#142a45" },
  ];

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  };
  const formatDate = (date) => date.toISOString().slice(0, 10);

  // A fixed seed makes the illustrative result set repeatable on every fresh visit.
  let seed = 20260818;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  function demoScore() {
    const goals = [0, 1, 2, 3, 4];
    const weights = [0.19, 0.35, 0.27, 0.14, 0.05];
    const draw = () => {
      let point = random();
      for (let index = 0; index < weights.length; index++) {
        point -= weights[index];
        if (point <= 0) return goals[index];
      }
      return goals.at(-1);
    };
    return [draw(), draw()];
  }

  // The circle method schedules every opponent pair once in the first leg.
  // Holding the first team fixed while rotating the rest avoids repeat pairings.
  const rotation = [...teams];
  const firstLeg = [];
  for (let week = 0; week < teams.length - 1; week++) {
    for (let index = 0; index < teams.length / 2; index++) {
      const first = rotation[index];
      const second = rotation[teams.length - 1 - index];
      const swapHome = (week + index) % 2 === 1;
      firstLeg.push({
        week: week + 1,
        home: swapHome ? second : first,
        away: swapHome ? first : second,
      });
    }
    rotation.splice(1, 0, rotation.pop());
  }

  const fixtures = [];
  // The demo timeline mirrors the selected 2026/27 season; scores are examples,
  // not official match data. Return legs reverse each first-leg home/away pairing.
  const seasonStart = new Date("2026-08-15T00:00:00Z");
  firstLeg.forEach((match, index) => {
    const firstDay = addDays(seasonStart, (match.week - 1) * 7);
    const date = addDays(firstDay, index % 10 === 0 ? 1 : 0);
    const played = match.week <= 9;
    const score = played ? demoScore() : [null, null];
    fixtures.push({
      id: `demo-${String(index + 1).padStart(3, "0")}`,
      week: match.week,
      date: formatDate(date),
      time: ["12:30", "15:00", "17:30", "14:00", "16:30"][index % 5],
      homeId: match.home.id,
      awayId: match.away.id,
      homeScore: score[0],
      awayScore: score[1],
      venue: `${match.home.name} home ground`,
    });
  });
  firstLeg.forEach((match, index) => {
    const returnFixtureIndex = index + firstLeg.length;
    const returnDate = addDays(seasonStart, (match.week - 1 + 19) * 7);
    fixtures.push({
      id: `demo-${String(returnFixtureIndex + 1).padStart(3, "0")}`,
      week: match.week + 19,
      date: formatDate(returnDate),
      time: ["15:00", "17:30", "12:30", "16:30", "14:00"][index % 5],
      homeId: match.away.id,
      awayId: match.home.id,
      homeScore: null,
      awayScore: null,
      venue: `${match.away.name} home ground`,
    });
  });

  // Expose one read-only-by-convention payload for the deferred application script.
  window.PREMIER_LEAGUE_DATA = { teams, fixtures };
})();
