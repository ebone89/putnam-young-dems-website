/**
 * Shared submit handler for the volunteer interest and RSVP forms. Both
 * post to /api/signup on the Worker, which writes to the D1 signups table.
 * Pages build their own payload object (so they can shape checkboxes,
 * dropdowns, etc. however makes sense) and hand it off here.
 */
function submitSignup(payload, statusEl, form) {
  statusEl.textContent = 'Sending…';
  statusEl.className = 'form-status';

  fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(function (r) {
      return r.json().then(function (data) { return { httpOk: r.ok, data: data }; });
    })
    .then(function (result) {
      if (result.httpOk && result.data.ok) {
        if (form) { form.reset(); }
        statusEl.textContent = 'Thanks — you are on the list.';
        statusEl.className = 'form-status form-status-success';
      } else {
        statusEl.textContent = (result.data && result.data.error) || 'Something went wrong. Please try again.';
        statusEl.className = 'form-status form-status-error';
      }
    })
    .catch(function () {
      statusEl.textContent = 'Something went wrong. Please try again.';
      statusEl.className = 'form-status form-status-error';
    });
}
