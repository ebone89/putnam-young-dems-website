/**
 * Shared helpers for pages that pull editable text from a _data/*.json
 * file. Each page keeps its real copy in the HTML as a fallback, then
 * these swap it in if the fetch succeeds — nothing goes blank if it fails.
 */
function applyText(id, value) {
  if (value == null) { return; }
  var el = document.getElementById(id);
  if (el) { el.textContent = value; }
}

function applyParagraphs(id, value) {
  if (value == null) { return; }
  var el = document.getElementById(id);
  if (!el) { return; }
  el.innerHTML = value.split('\n\n').map(function (para) {
    return '<p>' + para + '</p>';
  }).join('');
}

function applyCards(containerId, cards) {
  if (!cards) { return; }
  var el = document.getElementById(containerId);
  if (!el) { return; }
  el.innerHTML = cards.map(function (card) {
    return '<div class="card"><h3>' + card.title + '</h3><p>' + card.body + '</p></div>';
  }).join('');
}

function loadPageContent(file, applyFn) {
  fetch(file)
    .then(function (r) { return r.json(); })
    .then(applyFn)
    .catch(function () {
      // Keep the fallback copy already in the page
    });
}
