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

function applyImage(id, value) {
  if (value == null || value === '') { return; }
  var el = document.getElementById(id);
  if (el) { el.src = value; }
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
  var existing = el.querySelectorAll('.card');
  // When the markup already holds the same number of cards (the static
  // fallback), swap the text in place. That keeps the decorative icon baked
  // into each card and uses textContent instead of innerHTML. Only if the
  // count differs (a card added or removed in the CMS) fall back to a plain
  // text-only rebuild, which drops the icons but never the content.
  if (existing.length === cards.length) {
    cards.forEach(function (card, i) {
      var h3 = existing[i].querySelector('h3');
      var p = existing[i].querySelector('p');
      if (h3) { h3.textContent = card.title; }
      if (p) { p.textContent = card.body; }
    });
    return;
  }
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
