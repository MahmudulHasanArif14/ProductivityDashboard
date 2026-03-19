function openPage() {
  // selection
  let allElements = document.querySelectorAll(".element");
  let fullElements = document.querySelectorAll(".fullElement");
  let btnBack = document.querySelectorAll(".fullElement .back");
  let dashboard = document.querySelector(".elements");

  allElements.forEach((elem, index) => {
    elem.addEventListener("click", () => {
      if (dashboard) dashboard.style.display = "none";
      let fullView = fullElements[index];
      fullView.style.display = "block";
    });
  });

  btnBack.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      let fullView = fullElements[index];
      fullView.style.display = "none";
      if (dashboard) dashboard.style.display = "flex";
    });
  });
}

openPage();



// TaskList Add and Delete

function taskList() {
  // form
  let form = document.querySelector(".addTask form");
  let taskInput = document.querySelector(".addTask form input");
  let descriptionInput = document.querySelector(".addTask form textarea");
  let submitButton = document.querySelector(".addTask form button");

  let checkbox = document.querySelector(
    ".mark-important input[type='checkbox']",
  );

  let emptyState = document.querySelector(".empty");

  let allTasks = document.querySelector(".allTask");

  let tasksList = [];

  // stop form from submitting and refreshing the page
  form.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  // fetch data from local storage and update tasksList
  function updateEmptyState() {
    let storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      tasksList = JSON.parse(storedTasks);
    }

    checkTasksList();
  }

  updateEmptyState();

  function checkTasksList() {
    renderTasks();
  }

  window.onload = checkTasksList;

  function renderTasks() {
    allTasks.innerHTML = "";

    if (tasksList.length === 0) {
      emptyState.style.display = "grid";
      allTasks.appendChild(emptyState);
      return;
    }

    emptyState.style.display = "none";

    tasksList.forEach((task) => {
      let isImportantClass = task.isImportant ? "important" : "d-hidden";

      let taskEl = document.createElement("div");
      taskEl.className = "task";
      taskEl.innerHTML = `
      <h5>${task.taskName} <span class="${isImportantClass}">Important</span></h5>
      <p>${task.taskDescription}</p>
      <button class="mark-completed">Mark as Completed</button>
    `;

      allTasks.appendChild(taskEl);
    });
  }

  // Mark as Completed functionality (event delegation)
  allTasks.addEventListener("click", (e) => {
    console.log(e);
    let button = e.target.closest(".mark-completed");
    if (!button) return;

    // closest finds the closest element with the class .mark-completed and return it, if not found return null
    let taskEl = button.closest(".task");
    let index = Array.from(allTasks.querySelectorAll(".task")).indexOf(taskEl);

    tasksList.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasksList));
    checkTasksList();
  });

  // add task to tasksList and update the UI
  submitButton.addEventListener("click", () => {
    let taskTitle = taskInput.value.trim();
    let taskDescription = descriptionInput.value.trim();
    let isImportant = checkbox.checked;

    // check if title is empty
    if (taskTitle === "") {
      alert("Please enter a task title.");
      return;
    }

    // add task to tasksList array
    tasksList.push({
      taskName: taskTitle,
      taskDescription: taskDescription,
      isImportant: isImportant,
      status: "pending",
    });

    renderTasks();
    taskInput.value = "";
    descriptionInput.value = "";
    checkbox.checked = false;

    // save tasksList to local storage
    localStorage.setItem("tasks", JSON.stringify(tasksList));
  });
}

taskList();

// Daily Planner Add and Delete

function dailyPlanner() {
  // Daily planner date picker
  let plannerDateInput = document.querySelector("#plannerDate");
  let selectedDateLabel = document.querySelector(
    ".dailySchedulePage .selected-date",
  );

  // generate hours from 6:00 to 24:00
  var hours = Array.from({ length: 18 }, (_, i) => `${i + 6}:00 - ${i + 7}:00`);

  function formatPlannerDate(dateValue) {
    if (!dateValue) return "Today";
    let dateObj = new Date(`${dateValue}T00:00:00`);
    return dateObj.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  // set today's date as default value for the date input and update the label
  if (plannerDateInput && selectedDateLabel) {
    let today = new Date();
    plannerDateInput.valueAsDate = today;
    selectedDateLabel.textContent = formatPlannerDate(plannerDateInput.value);
  }

  // parent div for the time slots and tasks
  let dailyPlanner = document.querySelector(".day-planner");

  function createTimeSlots() {
    let wholeDay = "";

    hours.forEach((hour, idx) => {
      let startTime = hour.split(" - ")[0];
      let endTime = hour.split(" - ")[1];

      if (endTime === "24:00") {
        endTime = "00:00";
      }

      wholeDay += ` <div class="day-planner-time">
                    <div class="time-range" data-date="${plannerDateInput.value}">
                        <span class="start">${startTime}</span>
                        <span class="dash">-</span>
                        <span class="end">${endTime}</span>
                    </div>
                    <input id="task-${idx}" type="text" placeholder="Add a task for this time slot">
                </div>`;
    });

    dailyPlanner.innerHTML = wholeDay;
  }

  createTimeSlots();

  // handle input changes and save to local storage with date as key
  let dayPlanerInput = document.querySelectorAll(".day-planner input");

  function getPlannerDateKey() {
    return plannerDateInput.value;
  }

  function loadDailyTasksByDate() {
    return JSON.parse(localStorage.getItem("dailyTasksByDate") || "{}");
  }

  function saveDailyTasksByDate(data) {
    localStorage.setItem("dailyTasksByDate", JSON.stringify(data));
  }

  // restore tasks for the selected date from local storage and populate the input fields
  function restoreTasksForDate() {
    let dateKey = getPlannerDateKey();
    let allData = loadDailyTasksByDate();
    let dateTasks = allData[dateKey] || {};
    console.log(dateTasks);

    dayPlanerInput.forEach((input) => {
      input.value = dateTasks[input.id] || "";
    });
  }

  // add event listeners to each input field to save changes to local storage whenever user types something
  dayPlanerInput.forEach((input) => {
    input.addEventListener("input", (e) => {
      let dateKey = getPlannerDateKey();
      let allData = loadDailyTasksByDate();

      if (!allData[dateKey]) allData[dateKey] = {};
      allData[dateKey][input.id] = e.target.value;

      saveDailyTasksByDate(allData);
    });
  });

  if (plannerDateInput && selectedDateLabel) {
    plannerDateInput.addEventListener("change", () => {
      selectedDateLabel.textContent = formatPlannerDate(plannerDateInput.value);
      document.querySelectorAll(".day-planner .time-range").forEach((el) => {
        el.dataset.date = plannerDateInput.value;
      });
      restoreTasksForDate();
    });

    restoreTasksForDate();
  }
}

dailyPlanner();

function motivationalQuotes() {
  let quoteText = document.querySelector(".quote");
  let quoteAuthor = document.querySelector(".author");
  let refreshQuoteBtn = document.querySelector(".refresh-quote");

  refreshQuoteBtn.addEventListener("click", () => {
    fetchQuote();
  });

  function fetchQuote() {
    fetch("https://cdn.jsdelivr.net/gh/gomezmig03/MotivationalAPI/en.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to retrieve data from the server.");
        }
        return response.json();
      })
      .then((data) => {
        const randomIndex =
          Math.floor(Math.random() * data.length) +
          Math.floor(Math.random() * 5);
        const phrase = data[randomIndex].phrase;
        const author = data[randomIndex].author;

        quoteText.textContent = `"${phrase}"`;
        quoteAuthor.textContent = `- ${author}`;
        console.log(("quote".textContent = `"${phrase}" - ${author}`));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  fetchQuote();
}
motivationalQuotes();

// Daily Goals
function dailyGoals() {
  let form = document.querySelector(".goal-form");
  let titleInput = document.querySelector(".goal-title");
  let notesInput = document.querySelector(".goal-notes");
  let priorityInput = document.querySelector(".goal-priority");
  let timeInput = document.querySelector(".goal-time");
  let goalsList = document.querySelector(".goals-list");
  let emptyState = document.querySelector(".goals-empty");
  let countEl = document.querySelector(".goals-count .count");

  if (!form || !goalsList) return;

  let goals = [];

  function loadGoals() {
    let stored = localStorage.getItem("dailyGoals");
    goals = stored ? JSON.parse(stored) : [];
  }

  function saveGoals() {
    localStorage.setItem("dailyGoals", JSON.stringify(goals));
  }

  function updateCount() {
    let active = goals.filter((goal) => !goal.done).length;
    countEl.textContent = active;
  }

  function renderGoals() {
    goalsList.innerHTML = "";

    if (goals.length === 0) {
      goalsList.appendChild(emptyState);
      updateCount();
      return;
    }

    goals.forEach((goal, index) => {
      let goalCard = document.createElement("div");
      goalCard.className = `goal-card${goal.done ? " done" : ""}`;
      goalCard.dataset.index = index;

      let timeTag = goal.time ? `<span class="goal-tag">${goal.time}</span>` : "";

      goalCard.innerHTML = `
        <input type="checkbox" class="goal-check" ${goal.done ? "checked" : ""}>
        <div class="goal-info">
          <div class="goal-title-text">${goal.title}</div>
          <div class="goal-notes-text">${goal.notes || "No notes added."}</div>
          <div class="goal-tags">
            <span class="goal-tag">${goal.priority}</span>
            ${timeTag}
          </div>
        </div>
        <div class="goal-actions">
          <button class="goal-btn delete">Delete</button>
        </div>
      `;

      goalsList.appendChild(goalCard);
    });

    updateCount();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let title = titleInput.value.trim();
    if (!title) return;

    goals.unshift({
      title: title,
      notes: notesInput.value.trim(),
      priority: priorityInput.value,
      time: timeInput.value,
      done: false,
    });

    saveGoals();
    renderGoals();

    titleInput.value = "";
    notesInput.value = "";
    priorityInput.value = "high";
    timeInput.value = "";
  });

  goalsList.addEventListener("click", (e) => {
    let deleteBtn = e.target.closest(".goal-btn.delete");
    if (!deleteBtn) return;

    let card = deleteBtn.closest(".goal-card");
    let index = Number(card.dataset.index);
    goals.splice(index, 1);
    saveGoals();
    renderGoals();
  });

  goalsList.addEventListener("change", (e) => {
    let checkbox = e.target.closest(".goal-check");
    if (!checkbox) return;

    let card = checkbox.closest(".goal-card");
    let index = Number(card.dataset.index);
    goals[index].done = checkbox.checked;
    saveGoals();
    renderGoals();
  });

  loadGoals();
  renderGoals();
}

dailyGoals();

// promodoro timer
function pomodoroTimer() {
  let startBtn = document.querySelector(".timer-btn.start");
let pauseBtn = document.querySelector(".timer-btn.pause");
let resetBtn = document.querySelector(".timer-btn.reset");
let timerDisplay = document.querySelector(".timer-display .time");
let label = document.querySelector(".timer-display .label");

let timerDuration = 25 * 60;
let timerInterval;
let remainingTime = timerDuration;

function updateTimerDisplay() {
  let minutes = Math.floor(remainingTime / 60);
  let seconds = remainingTime % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
updateTimerDisplay();

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;

  console.log(isShortBreak);
  if (isShortBreak) {
    shortBreak();
  } else {
    focusSession();
  }
}

resetBtn.addEventListener("click", resetTimer);
let isShortBreak = false;

function shortBreak() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerDuration = 5 * 60;
  remainingTime = timerDuration;
  updateTimerDisplay();
  label.textContent = "Short Break";
  isShortBreak = true;
}

function focusSession() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerDuration = 25 * 60;
  remainingTime = timerDuration;
  updateTimerDisplay();
  label.textContent = "Focus Session";
  isShortBreak = false;
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;

      if (isShortBreak) {
        isShortBreak = false;
        resetTimer();
      } else {
        alert("Time's up! Take a break.");
        shortBreak();
      }
    }
  }, 1000);
}
startBtn.addEventListener("click", startTimer);

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
pauseBtn.addEventListener("click", pauseTimer);

}
pomodoroTimer();




// Header: clock, location, weather
function headerStatus() {
  let clockEl = document.querySelector(".clock-time");
  let locationEl = document.querySelector(".location-name");
  let tempEl = document.querySelector(".weather-temp");
  let descEl = document.querySelector(".weather-desc");
  let themeToggle = document.querySelector(".theme-toggle");

  function formatTime(date) {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  function updateClock() {
    if (!clockEl) return;
    clockEl.textContent = formatTime(new Date());
  }

  function setWeatherDisplay(temp, desc) {
    if (tempEl) tempEl.textContent = `${Math.round(temp)}°C`;
    if (descEl) descEl.textContent = desc;
  }


  // fetch weather data from open-meteo API using user's latitude and longitude and update the UI
  function fetchWeather(lat, lon) {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
    )
      .then((response) => response.json())
      .then((data) => {
        if (!data || !data.current_weather) return;
        console.log(data);
        let temp = data.current_weather.temperature;
        let code = data.current_weather.weathercode;
        let desc = weatherCodeToText(code);
        setWeatherDisplay(temp, desc);
      })
      .catch(() => {
        setWeatherDisplay(0, "Weather unavailable");
      });
  }

  function fetchLocationName(lat, lon) {
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    )
      .then((response) => response.json())
      .then((data) => {
        if (!data || !data.address) return;
        console.log(data);
        let city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.state ||
          "Your location";
        if (locationEl) locationEl.textContent = city ;
      })
      .catch(() => {
        if (locationEl) locationEl.textContent = "Location unavailable";
      });
  }

  function weatherCodeToText(code) {
    let map = {
      0: "Clear",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Rime fog",
      51: "Light drizzle",
      53: "Drizzle",
      55: "Heavy drizzle",
      61: "Light rain",
      63: "Rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Snow",
      75: "Heavy snow",
      80: "Rain showers",
      81: "Showers",
      82: "Heavy showers",
      95: "Thunderstorm",
    };
    return map[code] || "Weather";
  }

  updateClock();
  setInterval(updateClock, 1000);

  let themes = ["default", "theme-alt", "theme-ocean", "theme-sunset"];
  let savedTheme = localStorage.getItem("theme") || "default";
  if (savedTheme !== "default") {
    document.body.classList.add(savedTheme);
  }
  updateThemeLabel();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      let current = themes.find((t) => t !== "default" && document.body.classList.contains(t)) || "default";
      let nextIndex = (themes.indexOf(current) + 1) % themes.length;
      let nextTheme = themes[nextIndex];

      themes.forEach((t) => document.body.classList.remove(t));
      if (nextTheme !== "default") {
        document.body.classList.add(nextTheme);
      }
      localStorage.setItem("theme", nextTheme);
      updateThemeLabel();
    });
  }
    function updateThemeLabel() {
    if (!themeToggle) return;
    let current = themes.find((t) => t !== "default" && document.body.classList.contains(t)) || "default";
    console.log(current);
    let label = current.replace("theme-", "");
    console.log(label);
    themeToggle.querySelector("span").textContent = label;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        let lat = pos.coords.latitude;
        let lon = pos.coords.longitude;
        fetchLocationName(lat, lon);
        fetchWeather(lat, lon);
      },
      () => {
        if (locationEl) locationEl.textContent = "Location blocked";
        setWeatherDisplay(0, "Enable location");
      },
    );
  } else {
    if (locationEl) locationEl.textContent = "Location unsupported";
    setWeatherDisplay(0, "Weather unavailable");
  }


}

headerStatus();
