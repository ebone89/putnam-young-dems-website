/**
 * data.js
 *
 * The full roster from Putnam_Officials_Roster.md: every federal, state,
 * county, and municipal official Putnam Watch tracks, plus their promises.
 *
 * Most of these promises are sourced from a real speech, campaign
 * statement, vote, or news report, with a link in the "source" field. A
 * few officials don't have one yet, because research didn't turn up
 * anything specific and sourceable enough to grade. Those use the
 * "no-promise-on-file" status specifically (not "unclear") - there's an
 * intentional difference between "we found a real promise but can't tell
 * if it was kept" and "we don't have a promise to grade at all," and the
 * status field is what carries that distinction, not the wording of the
 * text itself.
 * 
 * Each official record:
 *   name          - string
 *   office        - string, shown under the name
 *   level         - "federal" | "state" | "county" | "municipal"
 *   party         - string
 *   upForElection - boolean, true if their seat's next election is 2026 or 2027
 *   promises      - array of { text, status, source }
 *                   status is one of:
 *                     "kept"               - happened, verifiably
 *                     "in-progress"        - actively moving, not resolved yet
 *                     "broken"             - didn't happen / reversed
 *                     "unclear"            - a real promise exists, but the
 *                                            outcome can't be determined
 *                     "no-promise-on-file" - no sourced promise found yet
 *                                            for this official (placeholder)
 */

const officials = [
  {
    name: "Rick Scott",
    office: "U.S. Senate",
    level: "federal",
    party: "Republican",
    upForElection: false,
    promises: [
      { text: "Pass a constitutional amendment establishing term limits for Members of Congress (12 years in the Senate, 6 in the House).", status: "in-progress", source: "https://www.rickscott.senate.gov/2025/1/sen-rick-scott-outlines-legislative-priorities-as-119th-congress-begins" },
      { text: "Pass a Balanced Budget Constitutional Amendment requiring the federal government to balance its budget.", status: "in-progress", source: "https://www.rickscott.senate.gov/2026/2/sen-rick-scott-leads-balanced-budget-responsibility-act-to-stop-washington-s-reckless-spending" }
    ]
  },
  {
    name: "Ashley Moody",
    office: "U.S. Senate (appointed)",
    level: "federal",
    party: "Republican",
    upForElection: true,
    promises: [
      { text: "Crack down on fentanyl and drug smuggling.", status: "in-progress", source: "https://www.moody.senate.gov/press-releases/senator-moody-cosponsors-the-halt-fentanyl-act/" },
      { text: "Finish the border wall and reinstate policies preventing illegal immigration.", status: "unclear", source: "https://ashleymoody.com/priorities/" }
    ]
  },
  {
    name: "Randy Fine",
    office: "U.S. House, District 6",
    level: "federal",
    party: "Republican",
    upForElection: true,
    promises: [
      { text: "Secure our borders.", status: "unclear", source: "https://thehill.com/homenews/house/5967794-house-republicans-break-impasse-save-america-act-appropriations/" },
      { text: "Lower insurance rates and hold insurance companies accountable.", status: "unclear", source: "https://www.voterandyfine.com/special-general-election-information" }
    ]
  },
  {
    name: "Ron DeSantis",
    office: "Governor of Florida",
    level: "state",
    party: "Republican",
    // DeSantis himself is term-limited and can't be on the 2026 ballot, but
    // this flag tracks the seat, and the seat is an open race this November.
    upForElection: true,
    promises: [
      { text: "Sign property insurance reform to stabilize Florida's insurance market and bring down costs for homeowners.", status: "kept", source: "https://www.wctv.tv/2026/01/12/desantis-announces-major-insurance-rate-relief-across-florida/" }
    ]
  },
  {
    name: "Tom Leek",
    office: "Florida Senate, District 7",
    level: "state",
    party: "Republican",
    upForElection: false,
    promises: [
      { text: "Continue working on solutions to the state's property insurance crisis.", status: "in-progress", source: "https://www.flsenate.gov/Session/Bill/2026/883" },
      { text: "Keep taxes low and provide economic incentives to support Florida's entrepreneurial spirit.", status: "unclear", source: "https://www.news4jax.com/voters-guide/2024/07/29/2024-voters-guide-florida-senate-district-7/" }
    ]
  },
  {
    name: "Judson Sapp",
    office: "Florida House, District 20",
    level: "state",
    party: "Republican",
    upForElection: true,
    promises: [
      { text: "Remove a lot of the laws that are in place that have stifled growth and business.", status: "in-progress", source: "https://flhouse.gov/Sections/Bills/billsdetail.aspx?BillId=83554" },
      { text: "Lower property insurance rates and let homeowners harden their homes to reduce insurer risk.", status: "unclear", source: "https://www.wuft.org/politics/florida-votes/2024-10-21/two-businessmen-are-running-for-florida-house-district-20-seat" }
    ]
  },
  {
    name: "J.R. Newbold",
    office: "Putnam County Commission, District 1",
    level: "county",
    party: "Republican",
    upForElection: false,
    promises: [
      { text: "No specific campaign promise is on record for Newbold. He did not complete the 2024 candidate questionnaire, and no public statement of priorities has turned up yet.", status: "no-promise-on-file", source: "" }
    ]
  },
  {
    name: "Leota Wilkinson",
    office: "Putnam County Commission, District 2",
    level: "county",
    party: "Republican",
    upForElection: true,
    promises: [
      { text: "Keep pushing for broadband service, since it's a critical piece of Putnam's future.", status: "unclear", source: "https://www.news4jax.com/voters-guide/2022/07/29/putnam-county-commission-district-2/" }
    ]
  },
  {
    name: "Josh Alexander",
    office: "Putnam County Commission, District 3",
    level: "county",
    party: "Republican",
    upForElection: false,
    promises: [
      { text: "Manage growth through proactive planning and transparency, so that \"the county was better when I left than when I began.\"", status: "in-progress", source: "https://www.news4jax.com/voters-guide/2024/08/01/2024-voters-guide-putnam-county-commission-district-3/" }
    ]
  },
  {
    name: "Larry Harvey",
    office: "Putnam County Commission, District 4",
    level: "county",
    party: "Republican",
    upForElection: true,
    promises: [
      { text: "Secure state funding for the wastewater treatment expansion in Bostwick and the water system upgrade at St. Johns Harbor.", status: "in-progress", source: "https://www.palatkadailynews.com/articles/local-news/budget-season-gets-mixed-reviews-amid-approvals-vetoes/" }
    ]
  },
  {
    name: "Walton Pellicer",
    office: "Putnam County Commission, District 5",
    level: "county",
    party: "Republican",
    upForElection: false,
    promises: [
      { text: "Expand water systems in East Palatka to relieve septic systems along the river, and fix building/zoning staffing shortages.", status: "in-progress", source: "https://www.news4jax.com/voters-guide/2024/08/04/2024-voters-guide-putnam-county-commission-district-5/" }
    ]
  },
  {
    name: "Robbi Correa",
    office: "Mayor / Commissioner, City of Palatka",
    level: "municipal",
    party: "Nonpartisan",
    upForElection: true,
    promises: [
      { text: "Pledged to improve transparency and city communication, and to fix inadequate code enforcement staffing (the city was running with a single patrol car).", status: "in-progress", source: "https://thelocallens.org/palatka-city-commission-tackles-budget-deficit-code-enforcement-and-community-projects/" }
    ]
  },
  {
    name: "Annie Henderson Davis",
    office: "Commissioner, Group 1, City of Palatka",
    level: "municipal",
    party: "Nonpartisan",
    upForElection: false,
    promises: [
      { text: "Ran on improving quality of life, public safety, public-private economic partnerships, and funding for essential services.", status: "unclear", source: "https://ballotpedia.org/Annie_Henderson_Davis_(Palatka_City_Commission_Group_1,_Florida,_candidate_2024)" }
    ]
  },
  {
    name: "Justin Campbell",
    office: "Commissioner, Group 2, City of Palatka",
    level: "municipal",
    party: "Nonpartisan",
    upForElection: true,
    promises: [
      { text: "Convened a January 2025 town hall specifically to confront community violence, telling residents the goal was to address issues the community had been facing \"not just recently but... for quite some time now.\"", status: "in-progress", source: "https://www.news4jax.com/news/local/2025/01/02/palatka-commissioner-hosts-town-hall-to-discuss-ending-violence-other-topics-in-the-community/" }
    ]
  },
  {
    name: "Will Jones",
    office: "Commissioner, Group 3, City of Palatka",
    level: "municipal",
    party: "Nonpartisan",
    upForElection: false,
    promises: [
      { text: "Jones campaigned on listening to residents and addressing their concerns, but no specific, measurable promise is on record yet.", status: "no-promise-on-file", source: "" }
    ]
  },
  {
    name: "Rufus Borom",
    office: "Commissioner, Group 4, City of Palatka",
    level: "municipal",
    party: "Nonpartisan",
    upForElection: true,
    promises: [
      { text: "No specific campaign promise is on record for Borom yet. A state municipal advocacy award recognizes his fiscal-accountability work in office, but that isn't the same as a documented campaign commitment.", status: "no-promise-on-file", source: "" }
    ]
  },
  {
    name: "Michele Myers",
    office: "Mayor / Commissioner, City of Crescent City",
    level: "municipal",
    party: "Nonpartisan",
    upForElection: false,
    promises: [
      { text: "No specific campaign promise is on record for Myers yet, only general coverage of her re-election.", status: "no-promise-on-file", source: "" }
    ]
  },
  {
    name: "Lisa Kane DeVitto",
    office: "Commissioner, Group 1, City of Crescent City",
    level: "municipal",
    party: "Nonpartisan",
    upForElection: true,
    promises: [
      { text: "No specific campaign promise is on record for DeVitto yet, only general biographical coverage of her time on the commission.", status: "no-promise-on-file", source: "" }
    ]
  },
  {
    name: "William \"B.J.\" Laurie",
    office: "Vice Mayor / Commissioner, Group 2, City of Crescent City",
    level: "municipal",
    party: "Nonpartisan",
    upForElection: true,
    promises: [
      { text: "No specific campaign promise is on record for Laurie yet, only coverage of the 2023 special election that returned him to the commission.", status: "no-promise-on-file", source: "" }
    ]
  },
  {
    name: "Linda Moore",
    office: "Commissioner, Group 3, City of Crescent City",
    level: "municipal",
    party: "Nonpartisan",
    upForElection: false,
    promises: [
      { text: "Only a general post-election statement is on record for Moore so far, nothing specific enough to track as a promise.", status: "no-promise-on-file", source: "" }
    ]
  },
  {
    name: "Cynthia Burton",
    office: "Commissioner, Group 4, City of Crescent City",
    level: "municipal",
    party: "Nonpartisan",
    upForElection: false,
    promises: [
      { text: "No campaign promise is on record for Burton yet.", status: "no-promise-on-file", source: "" }
    ]
  }
];
