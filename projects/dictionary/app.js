/*
 * Wordwell's browser-side controller.
 *
 * The word list is stored in data/words.json and loaded from the local web
 * server. Its expected shape is:
 * {
 *   metadata: { entryCount: 500, ... },
 *   words: {
 *     apple: {
 *       word: "apple",
 *       phonetic: "...", // optional
 *       meanings: [{
 *         partOfSpeech: "noun",
 *         definitions: [{ definition: "...", example: "..." }] // example optional
 *       }],
 *       source: "..." // informational; not currently displayed
 *     }
 *   }
 * }
 *
 * Searches are performed against this local data only; no dictionary API is
 * called. Run the project's local server so fetch() can load the JSON file.
 */

// Cache references to the page controls and results container once at startup.
const form = document.querySelector("#search-form");
const input = document.querySelector("#word-input");
const goButton = document.querySelector("#go-button");
const panelTitle = document.querySelector("#panel-title");
const resultsContent = document.querySelector("#results-content");
const wordChips = document.querySelectorAll(".word-chip");

// Keep the in-flight or fulfilled load promise so repeated searches do not
// download and parse the same JSON file again.
let dictionaryPromise;

// Submitting the form supports both tapping Go and pressing Enter on mobile
// keyboards. Prevent the browser's default navigation/reload behavior.
form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchWord(input.value);
});

// Suggested-word chips use the exact same lookup path as a manually entered
// search, keeping normalization, errors, and rendering consistent.
wordChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    searchWord(chip.dataset.word);
  });
});

/**
 * Look up one word in the cached local dictionary and update the results area.
 *
 * Input is trimmed and lowercased to make searches case-insensitive. A missing
 * word is a normal result, while a missing or malformed JSON file is an app
 * loading error. The button is disabled while the dictionary is being read so
 * the user cannot accidentally start overlapping searches.
 *
 * @param {string} value Raw word supplied by the input or a suggestion chip.
 * @returns {Promise<void>}
 */
async function searchWord(value) {
  const word = value.trim().toLowerCase();
  if (!word) {
    // The input is required in the markup; return focus if called with blanks.
    input.focus();
    return;
  }

  input.value = word;
  goButton.disabled = true;
  panelTitle.textContent = "Looking up your word";
  showStatus("loading", "One moment…", `Searching the local dictionary for “${word}”.`);

  try {
    const dictionary = await loadDictionary();
    // Check own properties only: words such as "constructor" must not resolve
    // to inherited JavaScript object members when there is no dictionary entry.
    const entry = Object.hasOwn(dictionary.words, word) ? dictionary.words[word] : undefined;
    if (!entry) {
      showStatus(
        "not-found",
        `“${word}” isn’t in this dictionary yet.`,
        `Try another word from the local collection of ${dictionary.metadata.entryCount} English words.`
      );
      panelTitle.textContent = "No definition found";
      return;
    }

    renderEntries([entry]);
    panelTitle.textContent = "A word, opened up";
  } catch (error) {
    // Log the underlying failure for debugging, but give visitors a concise
    // recovery hint. Clear the rejected promise so a later search can retry.
    console.error("The local dictionary could not be loaded:", error);
    dictionaryPromise = undefined;
    panelTitle.textContent = "The local dictionary couldn’t be loaded";
    showStatus(
      "error",
      "The word list isn’t available.",
      "Start the app with “npm start” from the dictionary folder, then refresh this page."
    );
  } finally {
    // Also runs after a missing word or a loading error, restoring the search.
    goButton.disabled = false;
  }
}

/**
 * Load and validate the local word list, caching the promise for later searches.
 *
 * Fetching the JSON through HTTP (rather than opening index.html as file://)
 * avoids browsers' restrictions on reading local files. The entry-count checks
 * catch an incomplete or incorrectly shaped dataset before any lookup uses it.
 *
 * @returns {Promise<{metadata: {entryCount: number}, words: Object}>}
 */
function loadDictionary() {
  if (!dictionaryPromise) {
    dictionaryPromise = fetch("./data/words.json")
      .then((response) => {
        // fetch() resolves for HTTP errors too, so explicitly reject non-2xx
        // responses instead of trying to parse an error page as JSON.
        if (!response.ok) {
          throw new Error(`Loading the word list failed with status ${response.status}.`);
        }
        return response.json();
      })
      .then((dictionary) => {
        // Keep the declared count and actual map size in sync. The UI also uses
        // the metadata count to describe the size of the searchable collection.
        if (
          !dictionary.metadata ||
          dictionary.metadata.entryCount !== 500 ||
          !dictionary.words ||
          Object.keys(dictionary.words).length !== 500
        ) {
          throw new Error("The local word list is incomplete or invalid.");
        }
        return dictionary;
      });
  }
  return dictionaryPromise;
}

/**
 * Replace the results area with one or more dictionary entries.
 *
 * Each entry gets a word heading; each part of speech gets its own section;
 * and each definition is rendered as a separate numbered card. All supplied
 * dictionary text is assigned with textContent, so it is displayed as text
 * rather than interpreted as HTML.
 *
 * @param {Array<Object>} entries Entries using the local JSON schema documented
 *   at the top of this file.
 * @returns {void}
 */
function renderEntries(entries) {
  // A new search replaces the previous word and all of its meanings.
  resultsContent.replaceChildren();

  entries.forEach((entry) => {
    const header = document.createElement("div");
    header.className = "results-word";

    const wordHeading = document.createElement("h3");
    wordHeading.textContent = entry.word || "Word";
    header.append(wordHeading);

    // Phonetic notation is optional in the dataset.
    if (entry.phonetic) {
      const phoneticLabel = document.createElement("span");
      phoneticLabel.className = "word-phonetic";
      phoneticLabel.textContent = entry.phonetic;
      header.append(phoneticLabel);
    }
    resultsContent.append(header);

    (entry.meanings || []).forEach((meaning) => {
      const group = document.createElement("section");
      group.className = "meaning-group";

      const partOfSpeech = document.createElement("h4");
      partOfSpeech.className = "part-of-speech";
      partOfSpeech.textContent = meaning.partOfSpeech || "Meaning";
      group.append(partOfSpeech);

      const definitions = document.createElement("ol");
      definitions.className = "definition-list";
      (meaning.definitions || []).forEach((definition) => {
        // Keep every sense visually distinct, with an example only when one
        // has been provided in the local data.
        const item = document.createElement("li");
        item.className = "definition-card";

        const definitionText = document.createElement("p");
        definitionText.className = "definition-text";
        definitionText.textContent = definition.definition;
        item.append(definitionText);

        if (definition.example) {
          const example = document.createElement("p");
          example.className = "example-text";
          example.textContent = `“${definition.example}”`;
          item.append(example);
        }
        definitions.append(item);
      });

      if (definitions.childElementCount) {
        group.append(definitions);
        resultsContent.append(group);
      }
    });
  });
}

/**
 * Show a loading, not-found, or error message instead of dictionary results.
 *
 * The kind selects only the accompanying icon/spinner; the supplied title and
 * copy are inserted as plain text. role="status" announces updates to assistive
 * technology without moving keyboard focus away from the search field.
 *
 * @param {"loading"|"not-found"|"error"} kind State controlling the icon.
 * @param {string} title Short status heading.
 * @param {string} copy Supporting explanation shown beneath the heading.
 * @returns {void}
 */
function showStatus(kind, title, copy) {
  // Status and result views share one container, so remove stale content first.
  resultsContent.replaceChildren();

  const state = document.createElement("div");
  state.className = "status-state";
  state.setAttribute("role", "status");

  if (kind === "loading") {
    const loader = document.createElement("span");
    loader.className = "loader";
    loader.setAttribute("aria-hidden", "true");
    state.append(loader);
  } else {
    const icon = document.createElement("span");
    icon.className = "status-icon";
    icon.setAttribute("aria-hidden", "true");
    // Keep decorative symbols out of the accessibility tree; the text below
    // communicates the actual status.
    icon.textContent = kind === "not-found" ? "⌕" : "↻";
    state.append(icon);
  }

  const titleElement = document.createElement("p");
  titleElement.className = "status-title";
  titleElement.textContent = title;
  const copyElement = document.createElement("p");
  copyElement.className = "status-copy";
  copyElement.textContent = copy;
  state.append(titleElement, copyElement);
  resultsContent.append(state);
}
