// ===============================
// CONFIG
// ===============================
const SHEET_ID = "18_M4L-tnd_t4mUZr1ti1V97hJAVHRP6BCaets35q09w"; // <-- replace this
const SHEET_NAME = "Schedule";
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;
// Divisions that have playoffs listed separately
const DIVISIONS_WITH_PLAYOFFS = [
  "Mens Open",
  "Mens Rec",
  "Co-ed Open",
  "Co-ed Open",
  "Womens Open",
  "U15 Boys",
  "U15/16 Girls",
  "U16 Boys",
  "U12 Boys", 
  "U12 Girls",
  "U13 Boys",
  "U13 Girls",
  "U14 Boys", 
  "U14 Girls",
  "U17 Boys",
  "U17 Girls", 
  "U18 Boys", 
];


// ===============================
// STATE
// ===============================
let data = [];

// ===============================
// DOM ELEMENTS
// ===============================
const dateSelect = document.getElementById("dateSelect");
const divisionSelect = document.getElementById("divisionSelect");
const teamSelect = document.getElementById("teamSelect");
const scheduleDiv = document.getElementById("schedule");
const divisionNotice = document.getElementById("divisionNotice");


// ===============================
// FETCH DATA
// ===============================
fetch(URL)
  .then(res => res.json())
  .then(json => {
    data = json;
    populateDates();
  })
  .catch(err => {
    console.error("Error loading schedule:", err);
  });

// ===============================
// POPULATE DATE DROPDOWN
// ===============================
function populateDates() {
  const dates = [...new Set(data.map(row => row.Date))];

  // Sort dates chronologically
  dates.sort((a, b) => new Date(a) - new Date(b));

  dates.forEach(date => {
    const opt = document.createElement("option");
    opt.value = date;
    opt.textContent = formatDate(date);
    dateSelect.appendChild(opt);
  });
}

// ===============================
// DATE CHANGE
// ===============================
dateSelect.addEventListener("change", () => {
  divisionSelect.innerHTML = `<option value="">Select Division</option>`;
  teamSelect.innerHTML = `<option value="">Select Team</option>`;
  scheduleDiv.innerHTML = "";

  divisionSelect.disabled = false;
  teamSelect.disabled = true;

  const divisions = data
    .filter(row => row.Date === dateSelect.value)
    .map(row => row.Division);

  [...new Set(divisions)].forEach(div => {
    const opt = document.createElement("option");
    opt.value = div;
    opt.textContent = div;
    divisionSelect.appendChild(opt);
  });
});

// ===============================
// DIVISION CHANGE
// ===============================
divisionSelect.addEventListener("change", () => {
  teamSelect.innerHTML = `<option value="">Select Team</option>`;
  if (DIVISIONS_WITH_PLAYOFFS.includes(divisionSelect.value)) {
     divisionNotice.style.display = "block";
  } else {
     divisionNotice.style.display = "none";
  }
  scheduleDiv.innerHTML = "";

  const teams = data
    .filter(
      row =>
        row.Date === dateSelect.value &&
        row.Division === divisionSelect.value
    )
    .map(row => row.Team);

  [...new Set(teams)].forEach(team => {
    const opt = document.createElement("option");
    opt.value = team;
    opt.textContent = team;
    teamSelect.appendChild(opt);
  });

  teamSelect.disabled = false;
});

// ===============================
// TEAM CHANGE → SHOW SCHEDULE
// ===============================
teamSelect.addEventListener("change", () => {
  scheduleDiv.innerHTML = "";

  const games = data.filter(
    row =>
      row.Date === dateSelect.value &&
      row.Division === divisionSelect.value &&
      row.Team === teamSelect.value
  );

  // Sort by actual time (not string order)
  games.sort((a, b) => {
    const t1 = new Date(`1970-01-01T${a.StartTime}`);
    const t2 = new Date(`1970-01-01T${b.StartTime}`);
    return t1 - t2;
  });

  games.forEach(game => {
    const div = document.createElement("div");
    div.className = "game";

    div.innerHTML = `
      <div class="time">
        ${formatTime(game.StartTime)} – ${formatTime(game.EndTime)}
      </div>
      <div>Field: ${game.Field}</div>
      <div>vs ${game.Opponent}</div>
    `;

    scheduleDiv.appendChild(div);
  });
});

// ===============================
// HELPERS
// ===============================
function formatTime(t) {
  // Handles "HH:MM" or "HH:MM:SS"
  return t ? t.substring(0, 5) : "";
}

function formatDate(dateStr) {
  // Expecting YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS
  const parts = dateStr.split("T")[0].split("-");
  const year = parts[0];
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const d = new Date(year, month, day);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}