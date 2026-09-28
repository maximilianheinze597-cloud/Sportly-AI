/* =========================================================
   SPORTLY AI
   "Dein Sport. Dein Fortschritt."
   Version 1.0
   ========================================================= */

const STORAGE_KEY = "sportlyAI_v1";

let state = {
    xp: 0,
    trainings: [],
    foods: []
};

let selectedSport = "";
let modalSport = "";


/* =========================================================
   STORAGE
   ========================================================= */

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            const parsed = JSON.parse(saved);

            state = {
                xp: Number(parsed.xp) || 0,
                trainings: Array.isArray(parsed.trainings)
                    ? parsed.trainings
                    : [],
                foods: Array.isArray(parsed.foods)
                    ? parsed.foods
                    : []
            };
        }
    } catch (error) {
        console.error("Sportly AI Daten konnten nicht geladen werden.", error);
    }
}


function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Sportly AI Daten konnten nicht gespeichert werden.", error);
    }
}


/* =========================================================
   HILFSFUNKTIONEN
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function escapeHtml(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getDateFromKey(key) {
    const [year, month, day] = key.split("-").map(Number);

    return new Date(year, month - 1, day);
}


function formatDate(dateString) {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
}


function formatShortDate(dateString) {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit"
    }).format(date);
}


/* =========================================================
   SEITEN-NAVIGATION
   ========================================================= */

function showPage(page) {

    document.querySelectorAll(".page").forEach(element => {
        element.classList.remove("active");
    });

    const target = $(`page-${page}`);

    if (target) {
        target.classList.add("active");
    }

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");

        if (item.dataset.page === page) {
            item.classList.add("active");
        }
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    updateDashboard();
}


/* =========================================================
   DATUM
   ========================================================= */

function updateDate() {

    const element = $("current-date");

    if (!element) return;

    const now = new Date();

    element.textContent = new Intl.DateTimeFormat("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long"
    }).format(now);
}


/* =========================================================
   TRAINING
   ========================================================= */

function addTraining(sport, duration, note = "") {

    duration = Number(duration);

    if (!sport) {
        showToast("⚠️", "Bitte wähle eine Sportart.");
        return false;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
        showToast("⚠️", "Bitte gib eine gültige Dauer ein.");
        return false;
    }

    if (duration > 600) {
        showToast("⚠️", "Die Trainingsdauer ist zu lang.");
        return false;
    }

    const training = {
        id: Date.now().toString(),
        sport: sport,
        duration: Math.round(duration),
        note: note.trim(),
        date: new Date().toISOString(),
        dateKey: getDateKey()
    };

    state.trainings.push(training);

    // XP für Training
    state.xp += 100;

    saveState();

    updateDashboard();

    showToast(
        "🔥",
        `Training gespeichert! +100 XP`
    );

    return true;
}


/* =========================================================
   TRAINING AUSWÄHLEN
   ========================================================= */

function selectSport(sport) {

    selectedSport = sport;

    const selected = $("selected-sport");
    const form = $("training-form");

    if (selected) {
        selected.textContent = sport;
    }

    if (form) {
        form.classList.remove("hidden");

        setTimeout(() => {
            form.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }, 50);
    }
}


function saveTraining() {

    const durationInput = $("training-duration");
    const noteInput = $("training-note");

    const duration = durationInput
        ? durationInput.value
        : "";

    const note = noteInput
        ? noteInput.value
        : "";

    if (!selectedSport) {
        showToast("⚠️", "Wähle zuerst eine Sportart.");
        return;
    }

    if (addTraining(selectedSport, duration, note)) {

        if (durationInput) {
            durationInput.value = "";
        }

        if (noteInput) {
            noteInput.value = "";
        }

        const form = $("training-form");

        if (form) {
            form.classList.add("hidden");
        }

        selectedSport = "";
    }
}


/* =========================================================
   MODAL – SCHNELLES TRAINING
   ========================================================= */

function openAddTraining() {

    const modal = $("training-modal");

    if (!modal) return;

    modal.classList.remove("hidden");

    modalSport = "";

    const durationContainer = $("modal-duration-container");

    if (durationContainer) {
        durationContainer.classList.add("hidden");
    }

    const duration = $("modal-duration");

    if (duration) {
        duration.value = "";
    }
}


function closeModal() {

    const modal = $("training-modal");

    if (!modal) return;

    modal.classList.add("hidden");

    modalSport = "";

    const durationContainer = $("modal-duration-container");

    if (durationContainer) {
        durationContainer.classList.add("hidden");
    }
}


function chooseModalSport(sport) {

    modalSport = sport;

    const durationContainer = $("modal-duration-container");

    if (durationContainer) {
        durationContainer.classList.remove("hidden");
    }

    const duration = $("modal-duration");

    if (duration) {
        duration.focus();
    }
}


function saveModalTraining() {

    if (!modalSport) {
        showToast("⚠️", "Bitte wähle zuerst eine Sportart.");
        return;
    }

    const durationInput = $("modal-duration");

    const duration = durationInput
        ? durationInput.value
        : "";

    if (addTraining(modalSport, duration)) {
        closeModal();
    }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    updateDate();
    updateToday();
    updateWeek();
    updateRecentTraining();
    updateProgress();
}


/* =========================================================
   HEUTIGES TRAINING
   ========================================================= */

function getTodayTrainings() {

    const today = getDateKey();

    return state.trainings.filter(training => {
        return training.dateKey === today;
    });
}


function updateToday() {

    const todayTrainings = getTodayTrainings();

    const minutes = todayTrainings.reduce(
        (sum, training) => sum + Number(training.duration || 0),
        0
    );

    const trainingElement = $("today-training");
    const minutesElement = $("today-minutes");
    const streakElement = $("streak");
    const xpElement = $("xp");

    if (trainingElement) {
        trainingElement.textContent = todayTrainings.length;
    }

    if (minutesElement) {
        minutesElement.textContent = minutes;
    }

    if (streakElement) {
        streakElement.textContent = calculateStreak();
    }

    if (xpElement) {
        xpElement.textContent = state.xp;
    }
}


/* =========================================================
   STREAK
   ========================================================= */

function calculateStreak() {

    if (state.trainings.length === 0) {
        return 0;
    }

    const activeDays = new Set(
        state.trainings.map(training => training.dateKey)
    );

    let currentDate = new Date();
    let streak = 0;

    while (true) {

        const key = getDateKey(currentDate);

        if (!activeDays.has(key)) {
            break;
        }

        streak++;

        currentDate.setDate(
            currentDate.getDate() - 1
        );
    }

    return streak;
}


/* =========================================================
   WOCHENSTATISTIK
   ========================================================= */

function getStartOfWeek(date = new Date()) {

    const result = new Date(date);

    const day = result.getDay();

    // Montag = 0
    const difference = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + difference);
    result.setHours(0, 0, 0, 0);

    return result;
}


function updateWeek() {

    const startOfWeek = getStartOfWeek();

    const days = [];

    for (let i = 0; i < 7; i++) {

        const date = new Date(startOfWeek);

        date.setDate(
            startOfWeek.getDate() + i
        );

        days.push({
            key: getDateKey(date),
            minutes: 0
        });
    }

    state.trainings.forEach(training => {

        const day = days.find(
            item => item.key === training.dateKey
        );

        if (day) {
            day.minutes += Number(training.duration || 0);
        }
    });

    const maxMinutes = Math.max(
        ...days.map(day => day.minutes),
        30
    );

    const barIds = [
        "bar-mon",
        "bar-tue",
        "bar-wed",
        "bar-thu",
        "bar-fri",
        "bar-sat",
        "bar-sun"
    ];

    days.forEach((day, index) => {

        const bar = $(barIds[index]);

        if (!bar) return;

        let height = 0;

        if (day.minutes > 0) {
            height = Math.max(
                8,
                Math.round(
                    (day.minutes / maxMinutes) * 100
                )
            );
        }

        bar.style.height = `${height}%`;
    });

    const weekMinutes = days.reduce(
        (sum, day) => sum + day.minutes,
        0
    );

    const weekTraining = $("week-training");

    if (weekTraining) {
        weekTraining.textContent = weekMinutes;
    }
}


/* =========================================================
   LETZTE TRAININGS
   ========================================================= */

function updateRecentTraining() {

    const container = $("recent-training");

    if (!container) return;

    const trainings = [...state.trainings]
        .sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        })
        .slice(0, 5);

    if (trainings.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏃</div>
                <p>Noch kein Training gespeichert.</p>
                <small>Starte dein erstes Training!</small>
            </div>
        `;

        return;
    }

    container.innerHTML = trainings.map(training => {

        const sport = escapeHtml(training.sport);
        const note = escapeHtml(training.note);

        return `
            <div class="recent-training-item">

                <div class="recent-training-icon">
                    ${getSportEmoji(training.sport)}
                </div>

                <div class="recent-training-info">

                    <strong>${sport}</strong>

                    <span>
                        ${training.duration} Minuten
                        · ${formatShortDate(training.date)}
                    </span>

                    ${
                        note
                            ? `<small>${note}</small>`
                            : ""
                    }

                </div>

                <div class="recent-training-xp">
                    +100 XP
                </div>

            </div>
        `;

    }).join("");
}


/* =========================================================
   SPORT-EMOJIS
   ========================================================= */

function getSportEmoji(sport) {

    const text = String(sport).toLowerCase();

    if (text.includes("fußball")) {
        return "⚽";
    }

    if (text.includes("schwimmen")) {
        return "🏊";
    }

    if (text.includes("laufen")) {
        return "🏃";
    }

    if (text.includes("workout")) {
        return "💪";
    }

    return "🏅";
}


/* =========================================================
   PROGRESS / LEVEL
   ========================================================= */

function getLevel() {

    return Math.floor(state.xp / 100) + 1;
}


function getLevelXP() {

    return state.xp % 100;
}


function updateProgress() {

    const level = getLevel();
    const levelXP = getLevelXP();

    const levelNumber = $("level-number");
    const progressXP = $("progress-xp");
    const progressBar = $("level-progress");
    const levelText = $("level-text");

    if (levelNumber) {
        levelNumber.textContent = level;
    }

    if (progressXP) {
        progressXP.textContent = `${levelXP} / 100 XP`;
    }

    if (progressBar) {
        progressBar.style.width = `${levelXP}%`;
    }

    if (levelText) {
        levelText.textContent =
            `${100 - levelXP} XP bis Level ${level + 1}`;
    }

    const totalTraining = $("total-training");
    const totalMinutes = $("total-minutes");

    const minutes = state.trainings.reduce(
        (sum, training) =>
            sum + Number(training.duration || 0),
        0
    );

    if (totalTraining) {
        totalTraining.textContent =
            state.trainings.length;
    }

    if (totalMinutes) {
        totalMinutes.textContent =
            minutes;
    }
}


/* =========================================================
   FOOD SCANNER – DEMO
   ========================================================= */

function simulateFoodScan() {

    const result = $("food-result");

    if (!result) return;

    result.classList.remove("hidden");

    showToast(
        "🤖",
        "Demo-Analyse abgeschlossen!"
    );
}


function saveFood() {

    const food = {
        id: Date.now().toString(),
        name: "Beispiel-Mahlzeit",
        savedAt: new Date().toISOString()
    };

    state.foods.push(food);

    saveState();

    showToast(
        "🍎",
        "Mahlzeit gespeichert!"
    );
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout;


function showToast(icon, message) {

    const toast = $("toast");
    const toastIcon = $("toast-icon");
    const toastMessage = $("toast-message");

    if (!toast) return;

    if (toastIcon) {
        toastIcon.textContent = icon;
    }

    if (toastMessage) {
        toastMessage.textContent = message;
    }

    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* =========================================================
   EINSTELLUNGEN
   ========================================================= */

function showSettings() {

    showToast(
        "⚙️",
        "Einstellungen kommen in V2."
    );
}


/* =========================================================
   APP ZURÜCKSETZEN
   ========================================================= */

function resetApp() {

    const confirmed = confirm(
        "Willst du wirklich alle Sportly-AI-Daten löschen?"
    );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(STORAGE_KEY);

    state = {
        xp: 0,
        trainings: [],
        foods: []
    };

    updateDashboard();

    showPage("home");

    showToast(
        "🗑️",
        "Alle Daten wurden gelöscht."
    );
}


/* =========================================================
   SERVICE WORKER / PWA
   ========================================================= */

function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) {
        return;
    }

    navigator.serviceWorker
        .register("./sw.js")
        .catch(() => {
            // Kein Problem, falls sw.js noch nicht vorhanden ist.
        });
}


/* =========================================================
   INITIALISIERUNG
   ========================================================= */

function initSportlyAI() {

    loadState();

    updateDashboard();

    showPage("home");

    registerServiceWorker();

    console.log(
        "🚀 Sportly AI gestartet – Dein Sport. Dein Fortschritt."
    );
}


document.addEventListener(
    "DOMContentLoaded",
    initSportlyAI
);
