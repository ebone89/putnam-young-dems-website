/**
 * Shared event data + date helpers for the homepage and events page.
 * The monthly meeting is computed on the fly (first Thursday of the month,
 * 6:30 p.m., rolling to next month once the 7 p.m. cutoff passes) so nobody
 * has to remember to update it. Everything else comes from _data/events.json,
 * which is edited through /admin.
 */
var PCYDEvents = (function () {
  var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Parsing "YYYY-MM-DD" with `new Date(str)` reads it as UTC and can shift
  // a day in either direction depending on the browser's timezone, so build
  // the date from its parts instead.
  function parseISODate(isoDate) {
    var parts = isoDate.split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function toISODate(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function getNextFirstThursday() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();

    var d = new Date(year, month, 1);
    while (d.getDay() !== 4) { d.setDate(d.getDate() + 1); }

    if (new Date(d.getFullYear(), d.getMonth(), d.getDate(), 19, 0) < now) {
      if (++month > 11) { month = 0; year++; }
      d = new Date(year, month, 1);
      while (d.getDay() !== 4) { d.setDate(d.getDate() + 1); }
    }
    return d;
  }

  // Returns the monthly meeting in the same shape as a CMS event so both
  // can be sorted, filtered, and rendered through one code path.
  function getMonthlyMeeting() {
    var d = getNextFirstThursday();
    return {
      title: 'Monthly Meeting',
      startDate: toISODate(d),
      endDate: null,
      timeLabel: '6:30 p.m.',
      location: 'Putnam County Democratic Center',
      address: '914 St. Johns Ave., Suite 2',
      cityState: 'Palatka, FL 32177',
      description: 'PCYD monthly member meeting. All members and prospective members are welcome.',
      recurring: true
    };
  }

  function formatDateRange(startDate, endDate) {
    var start = parseISODate(startDate);
    var startStr = DAY_NAMES[start.getDay()] + ', ' + MONTH_NAMES[start.getMonth()] + ' ' + start.getDate();

    if (!endDate || endDate === startDate) {
      return startStr + ', ' + start.getFullYear();
    }

    var end = parseISODate(endDate);
    var endStr = DAY_NAMES[end.getDay()] + ', ' + MONTH_NAMES[end.getMonth()] + ' ' + end.getDate();
    return startStr + ' through ' + endStr + ', ' + end.getFullYear();
  }

  function formatEventHeading(ev) {
    var range = formatDateRange(ev.startDate, ev.endDate);
    return ev.timeLabel ? range + ' · ' + ev.timeLabel : range;
  }

  function fetchEvents() {
    return fetch('_data/events.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        return (data.events || []).filter(function (ev) { return ev.published !== false; });
      })
      .catch(function () { return []; });
  }

  // Combines the monthly meeting with CMS events and sorts by date so the
  // list and calendar always agree on ordering.
  function getUpcomingEvents(cmsEvents) {
    var all = [getMonthlyMeeting()].concat(cmsEvents);
    var todayISO = toISODate(new Date());
    return all
      .filter(function (ev) { return ev.startDate >= todayISO; })
      .sort(function (a, b) { return a.startDate < b.startDate ? -1 : 1; });
  }

  function eventCardHTML(ev) {
    return '<div class="event-date">' + formatEventHeading(ev) + '</div>' +
      '<h3>' + ev.title + '</h3>' +
      '<p class="event-details">' + ev.location + '<br>' + ev.address + ', ' + ev.cityState + '</p>' +
      '<p>' + ev.description + '</p>';
  }

  return {
    parseISODate: parseISODate,
    toISODate: toISODate,
    getMonthlyMeeting: getMonthlyMeeting,
    formatDateRange: formatDateRange,
    formatEventHeading: formatEventHeading,
    fetchEvents: fetchEvents,
    getUpcomingEvents: getUpcomingEvents,
    eventCardHTML: eventCardHTML,
    MONTH_NAMES: MONTH_NAMES,
    DAY_NAMES: DAY_NAMES
  };
})();
