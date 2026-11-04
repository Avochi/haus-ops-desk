/**
 * config.js
 * SATU-SATUNYA tempat yang perlu lu ubah setelah deploy backend.
 * Tempel URL web app Google Apps Script (berakhiran /exec) pada API_URL.
 * Jangan taruh passcode atau rahasia apa pun di file ini: frontend bersifat publik.
 */
window.Haus = window.Haus || {};
window.Haus.config = {
  API_URL: 'https://script.google.com/macros/s/AKfycbyfn35Mt4uq1Rz62a9lOr2Mov1EE4aBHuhoxYTOOxKu7OQ3DbKCmljLrjnA6RPaawedeQ/exec',
  REQUEST_TIMEOUT_MS: 25000
};
