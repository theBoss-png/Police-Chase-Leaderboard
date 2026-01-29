const API_BASE = "https://police-chase-leaderboard.onrender.com";

// Initialisierung
function init() {
    loadAllRecords();
}

// Lade alle Rekorde
async function loadAllRecords() {
    const tbody = document.getElementById("allRecordsBody");
    if (!tbody) return;

    tbody.innerHTML = '<div class="loading">Lade Daten... (kann bis zu 60 Sek. dauern)</div>';

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 Sekunden timeout

        const res = await fetch(`${API_BASE}/leaderboard/all/records`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        tbody.innerHTML = "";

        if (!data || data.length === 0) {
            tbody.innerHTML = '<div class="empty-state">Keine Rekorde gefunden</div>';
            return;
        }

        data.forEach((record, index) => {
            const row = document.createElement("div");
            row.className = "all-records-row";
            row.style.animationDelay = `${index * 0.03}s`;

            let rankClass = "";
            const rank = index + 1;
            if (rank === 1) rankClass = "gold";
            else if (rank === 2) rankClass = "silver";
            else if (rank === 3) rankClass = "bronze";

            // Zeige "-" wenn kein Run vorhanden
            const coinsDisplay = record.coins > 0
                ? record.coins.toLocaleString()
                : "-";

            const playerDisplay = record.player !== "-"
                ? escapeHtml(record.player)
                : '<span class="no-record">Kein Run</span>';

            row.innerHTML = `
                <div class="cell rank-col ${rankClass}">
                    <span class="rank-number">#${rank}</span>
                </div>
                <div class="cell car-col">
                    <span class="car-name">${escapeHtml(record.car_name)}</span>
                </div>
                <div class="cell player-col">
                    <span class="player-name">${playerDisplay}</span>
                </div>
                <div class="cell coins-col">
                    <span class="coins-value">${coinsDisplay}</span>
                    ${record.coins > 0 ? '<span class="coins-icon">🪙</span>' : ''}
                </div>
            `;

            tbody.appendChild(row);
        });
    } catch (e) {
        console.error("Error loading all records:", e);
        if (e.name === 'AbortError') {
            tbody.innerHTML = `
                <div class="error-state">
                    <p>Timeout - Backend braucht zu lange</p>
                    <p class="error-details">Render Free Tier schläft nach Inaktivität. Bitte nochmal versuchen.</p>
                </div>
            `;
        } else {
            tbody.innerHTML = `
                <div class="error-state">
                    <p>Fehler beim Laden der Rekorde</p>
                    <p class="error-details">${e.message}</p>
                </div>
            `;
        }
    }
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