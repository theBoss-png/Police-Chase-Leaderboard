const API_BASE = "https://police-chase-leaderboard.onrender.com";

const cars = [
    { key: "car_01", name: "Carolina Commit" },
    { key: "car_02", name: "Deacon Mayflower" },
    { key: "car_03", name: "McCall Montpellier" },
    { key: "car_04", name: "Galaxy Esquire" },
    { key: "car_05", name: "Perry Navigator" },
    { key: "car_06", name: "Perry Navigator SUV" },
    { key: "car_07", name: "Carolina Corsair" },
    { key: "car_08", name: "Gibson Step-Up" },
    { key: "car_09", name: "Carolina Pilgrimp" },
    { key: "car_10", name: "McCall Manchester" },
    { key: "car_11", name: "McCall Miami" },
    { key: "car_12", name: "Verhoeven Piranha V8" },
    { key: "car_13", name: "McCall Monaco" },
    { key: "car_14", name: "McCall Monaco Bald Eagle" },
    { key: "car_15", name: "Chevalier Bonheur" },
    { key: "car_16", name: "Nakazato Cricket" },
    { key: "car_17", name: "Chevalier XIV" },
    { key: "car_18", name: "Merkur 668" },
    { key: "car_19", name: "Acheron Redhawk" },
    { key: "car_20", name: "Automobili Mangione 4000" },
    { key: "car_21", name: "Bulldozer" }
];

// Initialisierung
function init() {
    populateCarSelects();

    const carSelect = document.getElementById("carSelect");
    const runForm = document.getElementById("runForm");

    // Leaderboard Seite
    if (carSelect && !runForm) {
        // Erstes Auto laden, wenn die Dropdown gefüllt ist
        if (carSelect.value && carSelect.value !== "") {
            loadLeaderboard(carSelect.value);
        }

        carSelect.addEventListener("change", (e) => {
            if (e.target.value) {
                loadLeaderboard(e.target.value);
            }
        });
    }

    // Submit Seite
    if (runForm) {
        runForm.addEventListener("submit", handleSubmit);
    }
}

// Befülle Car Select Dropdowns
function populateCarSelects() {
    const selects = document.querySelectorAll("#carSelect");
    selects.forEach(select => {
        select.innerHTML = "";
        cars.forEach(car => {
            const option = document.createElement("option");
            option.value = car.key;
            option.textContent = car.name;
            select.appendChild(option);
        });

        // Erstes Auto als Standard auswählen
        if (select.options.length > 0) {
            select.selectedIndex = 0;
        }
    });
}

// Leaderboard anzeigen
async function loadLeaderboard(carKey) {
    const tbody = document.getElementById("leaderboardBody");
    if (!tbody) return;

    tbody.innerHTML = '<div class="loading">Lade Daten...</div>';

    try {
        const res = await fetch(`${API_BASE}/leaderboard/${carKey}`);

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        tbody.innerHTML = "";

        if (!data.runs || data.runs.length === 0) {
            tbody.innerHTML = '<div class="empty-state">Noch keine Runs für dieses Auto</div>';
            return;
        }

        data.runs.forEach((run, index) => {
            const row = document.createElement("div");
            row.className = "leaderboard-row";
            row.style.animationDelay = `${index * 0.05}s`;

            let rankClass = "";
            if (run.rank === 1) rankClass = "gold";
            else if (run.rank === 2) rankClass = "silver";
            else if (run.rank === 3) rankClass = "bronze";

            row.innerHTML = `
                <div class="cell rank-col ${rankClass}">
                    <span class="rank-number">#${run.rank}</span>
                </div>
                <div class="cell player-col">
                    <span class="player-name">${escapeHtml(run.player)}</span>
                </div>
                <div class="cell coins-col">
                    <span class="coins-value">${run.coins.toLocaleString()}</span>
                    <span class="coins-icon">🪙</span>
                </div>
            `;

            tbody.appendChild(row);
        });
    } catch (e) {
        console.error("Error loading leaderboard:", e);
        tbody.innerHTML = `
            <div class="error-state">
                <p>Fehler beim Laden des Leaderboards</p>
                <p class="error-details">${e.message}</p>
            </div>
        `;
    }
}

// Run einreichen
async function handleSubmit(e) {
    e.preventDefault();

    const playerName = document.getElementById("playerName").value.trim();
    const coins = parseInt(document.getElementById("coins").value);
    const carKey = document.getElementById("carSelect").value;
    const password = document.getElementById("password").value;
    const resultDiv = document.getElementById("result");
    const submitBtn = e.target.querySelector(".submit-btn");

    // Validierung
    if (!playerName || !coins || !carKey || !password) {
        showResult(resultDiv, "Bitte fülle alle Felder aus", "error");
        return;
    }

    // Button deaktivieren während der Anfrage
    submitBtn.disabled = true;
    submitBtn.textContent = "Wird gesendet...";

    try {
        const res = await fetch(`${API_BASE}/runs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                player_name: playerName,
                coins: coins,
                car_key: carKey,
                password: password
            })
        });

        const data = await res.json();

        if (res.ok) {
            showResult(
                resultDiv,
                `✓ Run erfolgreich eingereicht! Du bist auf Platz ${data.rank}`,
                "success"
            );

            // Formular zurücksetzen
            e.target.reset();

            // Nach 2 Sekunden zum Leaderboard weiterleiten
            setTimeout(() => {
                window.location.href = `../index.html`;
            }, 2000);
        } else {
            showResult(
                resultDiv,
                `✗ Fehler: ${data.detail || "Unbekannter Fehler"}`,
                "error"
            );
        }
    } catch (e) {
        console.error("Error submitting run:", e);
        showResult(
            resultDiv,
            `✗ Verbindungsfehler: ${e.message}`,
            "error"
        );
    } finally {
        // Button wieder aktivieren
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-text">Run einreichen</span><span class="btn-arrow">→</span>';
    }
}

// Zeige Ergebnis-Nachricht
function showResult(element, message, type) {
    element.textContent = message;
    element.className = `result ${type}`;
    element.style.display = "block";
}

// HTML escapen für Sicherheit
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialisierung beim Laden der Seite
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}