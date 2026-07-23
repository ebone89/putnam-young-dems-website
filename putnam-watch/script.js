/**
 * script.js
 *
 * Handles search, filtering, and rendering for the Putnam Watch roster.
 * Plain vanilla JS on purpose (no jQuery) - the DOM APIs here are simple
 * enough that a library would just add weight without saving real code.
 *
 * Data comes from data.js, loaded before this file in index.html, so the
 * `officials` array is already in scope by the time this file runs.
 */

// Grab every element we'll need once, up front, instead of re-querying
// the DOM on every keystroke.
const searchInput = document.getElementById("search-input");
const levelFilter = document.getElementById("level-filter");
const statusFilter = document.getElementById("status-filter");
const rosterEl = document.getElementById("roster");
const resultCountEl = document.getElementById("result-count");
const noResultsEl = document.getElementById("no-results");

// The detail dialog is a single shared element - we don't build a new one
// per official, we just refill these fields right before opening it.
const detailDialog = document.getElementById("detail-dialog");
const detailLevelEl = document.getElementById("detail-level");
const detailNameEl = document.getElementById("detail-name");
const detailOfficeEl = document.getElementById("detail-office");
const detailPromiseListEl = document.getElementById("detail-promise-list");
const detailCloseButton = document.getElementById("detail-close");

// Human-readable labels for the status tags, so the data file can stay
// in kebab-case ("in-progress") while the UI shows something readable.
const STATUS_LABELS = {
  kept: "Kept",
  "in-progress": "In progress",
  broken: "Broken",
  unclear: "No significant progress made",
  "no-promise-on-file": "No promise on file"
};

const LEVEL_LABELS = {
  federal: "Federal",
  state: "State",
  county: "County",
  municipal: "Municipal"
};

/**
 * Builds the DOM for a single official card, including their promise list.
 * Returns a DOM node rather than an HTML string, so we never have to worry
 * about escaping user-controlled text (there isn't any here, but it's the
 * safer habit to build).
 */
function buildOfficialCard(official) {
  const card = document.createElement("article");
  card.className = "official-card";

  // Level tag and the "up for election soon" badge share a row so the badge
  // doesn't push everything else down when it's not there.
  const topRow = document.createElement("div");
  topRow.className = "card-top-row";

  const level = document.createElement("p");
  level.className = "card-level";
  level.textContent = LEVEL_LABELS[official.level] || official.level;
  topRow.appendChild(level);

  if (official.upForElection) {
    const badge = document.createElement("span");
    badge.className = "election-badge";
    badge.textContent = "Up for election soon";
    topRow.appendChild(badge);
  }

  card.appendChild(topRow);

  // h2, not h3 - the page's only other heading is the h1 in the hero, so
  // jumping straight to h3 here would skip a level for anyone navigating
  // by heading with a screen reader.
  const name = document.createElement("h2");
  name.className = "card-name";
  name.textContent = official.name;
  card.appendChild(name);

  const office = document.createElement("p");
  office.className = "card-office";
  office.textContent = `${official.office} - ${official.party}`;
  card.appendChild(office);

  const promiseList = document.createElement("ul");
  promiseList.className = "promise-list";

  if (official.promises.length === 0) {
    // Shouldn't come up in the current dataset (every official has at
    // least a placeholder entry), but the roster shouldn't render a blank
    // gap if someone's promises array ever does end up empty.
    const empty = document.createElement("li");
    empty.className = "promise-item promise-item--empty";
    empty.textContent = "No promises on file yet.";
    promiseList.appendChild(empty);
  } else {
    official.promises.forEach((promise) => {
      const item = document.createElement("li");
      item.className = "promise-item";

      const tag = document.createElement("span");
      tag.className = `status-tag status-${promise.status}`;
      tag.textContent = STATUS_LABELS[promise.status] || promise.status;

      const text = document.createElement("span");
      text.textContent = promise.text;

      item.appendChild(tag);
      item.appendChild(text);
      promiseList.appendChild(item);
    });
  }

  card.appendChild(promiseList);

  // A real <button>, not a click handler slapped on the whole card, so this
  // stays reachable by keyboard and doesn't need a manual tabindex hack.
  const detailButton = document.createElement("button");
  detailButton.type = "button";
  detailButton.className = "detail-toggle";
  detailButton.textContent = "View full record & sources";
  detailButton.addEventListener("click", () => openDetailDialog(official));
  card.appendChild(detailButton);

  return card;
}

/**
 * Fills the shared detail dialog with one official's full promise list,
 * including the source link the roster cards don't have room for, and
 * opens it. Keeps track of whatever had focus beforehand so it can be
 * restored once the dialog closes.
 */
let elementFocusedBeforeDialog = null;

function openDetailDialog(official) {
  elementFocusedBeforeDialog = document.activeElement;

  detailLevelEl.textContent = `${LEVEL_LABELS[official.level] || official.level} - ${official.party}`;
  detailNameEl.textContent = official.name;
  detailOfficeEl.textContent = official.office;

  detailPromiseListEl.innerHTML = "";

  if (official.promises.length === 0) {
    const empty = document.createElement("li");
    empty.className = "detail-promise-item";
    empty.textContent = "No promises on file yet.";
    detailPromiseListEl.appendChild(empty);
    detailDialog.showModal();
    return;
  }

  official.promises.forEach((promise) => {
    const item = document.createElement("li");
    item.className = "detail-promise-item";

    const tag = document.createElement("span");
    tag.className = `status-tag status-${promise.status}`;
    tag.textContent = STATUS_LABELS[promise.status] || promise.status;
    item.appendChild(tag);

    const text = document.createElement("p");
    text.className = "detail-promise-text";
    text.textContent = promise.text;
    item.appendChild(text);

    // Some placeholder entries still don't have a real source yet - say so
    // instead of rendering a broken or empty link.
    if (promise.source) {
      const link = document.createElement("a");
      link.className = "detail-promise-source";
      link.href = promise.source;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View source";

      // Visually the external-link icon convention would say this, but
      // there's no icon here, so say it for screen reader users directly.
      const newTabNote = document.createElement("span");
      newTabNote.className = "sr-only";
      newTabNote.textContent = " (opens in a new tab)";
      link.appendChild(newTabNote);

      item.appendChild(link);
    } else {
      const missing = document.createElement("p");
      missing.className = "detail-promise-source detail-promise-source--missing";
      missing.textContent = "No source on file yet.";
      item.appendChild(missing);
    }

    detailPromiseListEl.appendChild(item);
  });

  detailDialog.showModal();
}

function closeDetailDialog() {
  detailDialog.close();
}

detailCloseButton.addEventListener("click", closeDetailDialog);

// A click that lands on the <dialog> element itself (not anything inside
// it) means it landed on the backdrop, since the dialog box is sized to
// its content. Treat that the same as clicking the close button.
detailDialog.addEventListener("click", (event) => {
  if (event.target === detailDialog) closeDetailDialog();
});

// <dialog> already closes on Escape on its own, but it doesn't return focus
// to whatever opened it, so that part is on us.
detailDialog.addEventListener("close", () => {
  if (elementFocusedBeforeDialog) elementFocusedBeforeDialog.focus();
});

/**
 * Returns true if `official` matches the current search term: a case
 * insensitive match against either the name or the office field.
 */
function matchesSearch(official, term) {
  if (!term) return true; // empty search matches everything
  const haystack = `${official.name} ${official.office}`.toLowerCase();
  return haystack.includes(term);
}

/**
 * Returns true if `official` has at least one promise at the selected
 * status. "all" always matches.
 */
function matchesStatus(official, status) {
  if (status === "all") return true;
  return official.promises.some((p) => p.status === status);
}

/**
 * Re-reads the three controls, filters the officials array, and re-renders
 * the roster. This is the one function everything else calls.
 */
function renderRoster() {
  // .trim() so a search of "  sapp  " still matches "Sapp" - basic input
  // validation so stray whitespace can't silently break a search.
  const term = searchInput.value.trim().toLowerCase();
  const level = levelFilter.value;
  const status = statusFilter.value;

  const results = officials.filter((official) => {
    const levelMatches = level === "all" || official.level === level;
    return levelMatches && matchesSearch(official, term) && matchesStatus(official, status);
  });

  // Clear the roster and rebuild it from the filtered results.
  rosterEl.innerHTML = "";
  results.forEach((official) => rosterEl.appendChild(buildOfficialCard(official)));

  // Toggle the "no results" message and update the screen-reader-announced count.
  const hasResults = results.length > 0;
  noResultsEl.hidden = hasResults;
  rosterEl.hidden = !hasResults;
  resultCountEl.textContent = hasResults
    ? `Showing ${results.length} of ${officials.length} officials`
    : "";
}

// Re-render whenever any control changes. "input" fires on every keystroke
// for the search box; "change" is enough for the two <select> menus.
searchInput.addEventListener("input", renderRoster);
levelFilter.addEventListener("change", renderRoster);
statusFilter.addEventListener("change", renderRoster);

// Initial render on page load.
renderRoster();
