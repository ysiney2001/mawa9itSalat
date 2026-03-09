const data = [{
  gregorianDay: 9,
  gregorianMonth: 3,
  gregorianYear: 2026,
  fajr: '05:09',
  shuruq: '06:29',
  dhuhr: '12:33',
  asr: '15:50',
  maghrib: '18:27',
  isha: '19:37'
}, {
  gregorianDay: 10,
  gregorianMonth: 3,
  gregorianYear: 2026,
  fajr: '05:08',
  shuruq: '06:27',
  dhuhr: '12:32',
  asr: '15:50',
  maghrib: '18:28',
  isha: '19:38'
}];

const now = new Date("2026-03-09T20:47:34Z");

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Casablanca',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
const [dayStr, monthStr, yearStr] = dateFormatter.format(now).split('/');
const currentDayNumber = parseInt(dayStr, 10);
const currentMonthNumber = parseInt(monthStr, 10);
const currentYearNumber = parseInt(yearStr, 10);

const today = data.find(
  (s) => s.gregorianDay === currentDayNumber && s.gregorianMonth === currentMonthNumber && s.gregorianYear === currentYearNumber
);

const tomorrowDate = new Date(now);
tomorrowDate.setDate(now.getDate() + 1);
const [tDay, tMonth, tYear] = dateFormatter.format(tomorrowDate).split('/');
const tomorrowDayNumber = parseInt(tDay, 10);
const tomorrowMonthNumber = parseInt(tMonth, 10);
const tomorrowYearNumber = parseInt(tYear, 10);

let tomorrow = data.find(
  (s) => s.gregorianDay === tomorrowDayNumber && s.gregorianMonth === tomorrowMonthNumber && s.gregorianYear === tomorrowYearNumber
);

console.log("tomorrowDate:", tomorrowDate.toISOString());
console.log("tomorrow values:", tDay, tMonth, tYear);
console.log("tomorrow found:", tomorrow);
