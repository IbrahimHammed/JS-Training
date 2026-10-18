# Adding licensed club crests

Touchline displays original, illustrated, club-color shield badges by default. These custom geometric motifs are generated in the app and are not official club crests. If you have permission to use club artwork, select **Add licensed crests** and upload the images. Each crest replaces that club's custom badge throughout the table and fixtures; clubs without an image continue to use the illustrated badge.

## Code map

- `index.html` defines the accessible dashboard structure, the standings table, fixture filters, and the shared add/edit match dialog.
- `data.js` owns the club catalog and deterministic demo schedule. A round-robin rotation creates the first leg, and the return leg reverses each pairing's home and away teams. Demo scores are illustrative, not official.
- `app.js` loads and validates browser-saved fixtures, builds the table from played matches, renders filters and pages of fixtures, validates schedule/result edits, and saves changes. The standings order follows points, goal difference, and goals scored.
- `styles.css` holds theme/layout rules, badge and match-row presentation, and tablet/mobile breakpoints.

Fixtures and uploaded crest images use separate local-storage keys. No backend is required; clearing the browser's local storage restores the demo schedule and removes custom uploads. Inline comments in the source explain the important calculations, validation rules, rendering steps, and layout sections.

Name each PNG, JPEG, or WebP file with the club ID below (for example, `ars.png`). Images must be 350 KB or smaller each, and all saved crests together must fit within 1.5 MB. Crest files are stored in this browser's local storage and are not added to the project or uploaded to a server.

| Club | File name |
|---|---|
| AFC Bournemouth | `bou.png` |
| Arsenal | `ars.png` |
| Aston Villa | `avl.png` |
| Brentford | `bre.png` |
| Brighton & Hove Albion | `bha.png` |
| Chelsea | `che.png` |
| Coventry City | `cov.png` |
| Crystal Palace | `cry.png` |
| Everton | `eve.png` |
| Fulham | `ful.png` |
| Hull City | `hul.png` |
| Ipswich Town | `ips.png` |
| Leeds United | `lee.png` |
| Liverpool | `liv.png` |
| Manchester City | `mci.png` |
| Manchester United | `mun.png` |
| Newcastle United | `new.png` |
| Nottingham Forest | `nfo.png` |
| Sunderland | `sun.png` |
| Tottenham Hotspur | `tot.png` |

Use only images you are authorized to use. The bundled demo intentionally contains no third-party crest artwork.
