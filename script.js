// === ΡΥΘΜΙΣΕΙΣ EMAILJS ===
const SERVICE_ID = "service_ec2hkvl";
const TEMPLATE_ID = "template_yi3ycht";
const PUBLIC_KEY = "_4yDX6OWKN7FhmgLS";

emailjs.init(PUBLIC_KEY);

// === Στοιχεία από το HTML ===
const questionStep = document.getElementById("question-step");
const dateStep = document.getElementById("date-step");
const noMessage = document.getElementById("no-message");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const dateForm = document.getElementById("date-form");
const noBtnWrapper = document.querySelector(".buttons-wrapper");
const countdownEl = document.getElementById("countdown");

// 👇 ΑΛΛΑΞΕ ΕΔΩ ΤΟ ΤΗΛΕΦΩΝΟ ΣΟΥ
const PHONE_NUMBER = "697 724 3990";

// ============================================================
// === ΑΝΤΙΣΤΡΟΦΗ ΜΕΤΡΗΣΗ ΜΕ 3 ΦΑΣΕΙΣ ==========================
// ============================================================

const PHASES = [
    { duration: 60, label: "⏰ Η προσφορά λήγει σε:", cssClass: "" },
    { duration: 10, label: "🤔 Έχεις 10 δευτερόλεπτα να το σκεφτείς!", cssClass: "warning" },
    { duration: 15, label: "⏰ ΤΕΛΕΥΤΑΙΑ ΕΥΚΑΙΡΙΑ:", cssClass: "final" }
];

let phaseIndex = 0;
let timeLeft = PHASES[0].duration;
let countdownInterval = null;

function renderCountdown() {
    const phase = PHASES[phaseIndex];
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    const timeStr = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

    countdownEl.className = "countdown";
    if (phase.cssClass) countdownEl.classList.add(phase.cssClass);

    countdownEl.innerHTML =
        `<span class="countdown-label">${phase.label}</span>` +
        `<span class="countdown-timer">${timeStr}</span>`;
}

function tick() {
    timeLeft--;

    if (timeLeft <= 0) {
        phaseIndex++;

        if (phaseIndex >= PHASES.length) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            expireAll();
            return;
        }

        timeLeft = PHASES[phaseIndex].duration;
    }

    renderCountdown();
}

function startCountdown() {
    renderCountdown();
    countdownInterval = setInterval(tick, 1000);
}

function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// === Όταν τελειώσουν ΟΛΕΣ οι φάσεις ===
function expireAll() {
    yesBtn.disabled = true;
    noBtn.style.display = "none";

    countdownEl.className = "countdown expired-contact";
    countdownEl.innerHTML = `
        <div class="contact-block">
            <div class="contact-emoji">⏰</div>
            <div class="contact-title">Ο χρόνος τελείωσε!</div>
            <div class="contact-sub">Επικοινώνησε με την εξυπηρέτηση πελατών:</div>
            <div class="contact-phone">📞 ${PHONE_NUMBER}</div>
        </div>
    `;
}

startCountdown();

// === Όταν πατάει "Ναι" ===
yesBtn.addEventListener("click", function () {
    if (yesBtn.disabled) return;
    stopCountdown();
    questionStep.classList.add("hidden");
    dateStep.classList.remove("hidden");
});

// === Όταν υποβάλει τη φόρμα με ημερομηνία ===
dateForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const meetingTime = document.getElementById("meeting-time").value;

    if (!meetingTime) {
        alert("Παρακαλώ διάλεξε ημερομηνία και ώρα!");
        return;
    }

    const formatted = new Date(meetingTime).toLocaleString("el-GR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    sendEmail("Ναι", `Η κοπέλα απάντησε ΝΑΙ! 🎉\nΠροτιμώμενη ημερομηνία/ώρα: ${formatted}`);

    dateStep.innerHTML = "<h2>Ευχαριστώ! Το ραντεβού κανονίστηκε! 🎉</h2>";
});

// === Συνάρτηση αποστολής email μέσω EmailJS ===
function sendEmail(answer, message) {
    const templateParams = {
        answer: answer,
        message: message,
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
        .then(function (response) {
            console.log("Email στάλθηκε με επιτυχία!", response.status, response.text);
        }, function (error) {
            console.error("Αποτυχία αποστολής email:", error);
        });
}

// ============================================================
// === Λογική "Όχι" που τρέχει μακριά ΚΑΙ μικραίνει ===========
// ============================================================

const SAFE_DISTANCE = 150;

let noBtnScale = 1;
const MIN_SCALE = 0.35;
const SHRINK_STEP = 0.12;

function moveNoButton() {
    noBtn.classList.add("running");

    const wrapperRect = noBtnWrapper.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();

    const maxX = Math.max(0, wrapperRect.width - btnRect.width);
    const maxY = Math.max(0, wrapperRect.height - btnRect.height);

    const yesLocalX = yesRect.left - wrapperRect.left;
    const yesLocalY = yesRect.top - wrapperRect.top;
    const MIN_DIST = 20;

    let randomX, randomY;
    let tries = 0;

    do {
        randomX = Math.random() * maxX;
        randomY = Math.random() * maxY;
        tries++;
    } while (
        tries < 30 &&
        randomX + btnRect.width + MIN_DIST > yesLocalX &&
        randomX < yesLocalX + yesRect.width + MIN_DIST &&
        randomY + btnRect.height + MIN_DIST > yesLocalY &&
        randomY < yesLocalY + yesRect.height + MIN_DIST
    );

    noBtn.style.left = randomX + "px";
    noBtn.style.top = randomY + "px";

    if (noBtnScale > MIN_SCALE) {
        noBtnScale = Math.max(MIN_SCALE, noBtnScale - SHRINK_STEP);
        noBtn.style.transform = `scale(${noBtnScale})`;
        noBtn.style.opacity = Math.max(0.45, noBtnScale);
    }
}

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("mouseover", moveNoButton);

noBtn.addEventListener("touchstart", function (e) {
    e.preventDefault();
    moveNoButton();
});

noBtn.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    moveNoButton();
});

noBtn.addEventListener("click", function (e) {
    e.preventDefault();
    moveNoButton();
});

document.addEventListener("mousemove", function (e) {
    if (noBtn.classList.contains("running")) return;

    const rect = noBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

    if (distance < SAFE_DISTANCE) {
        moveNoButton();
    }
});
