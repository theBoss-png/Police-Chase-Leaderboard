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

        // Berechne Statistiken
        updateStats(data);

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

// Update Statistik-Sidebar
function updateStats(data) {
    // Zähle Rekorde pro Spieler
    const recordCounts = {};
    let totalRecords = 0;

    data.forEach(record => {
        if (record.player !== "-" && record.coins > 0) {
            const playerName = record.player;
            recordCounts[playerName] = (recordCounts[playerName] || 0) + 1;
            totalRecords++;
        }
    });

    const leloRecords = recordCounts["Lelo"] || 0;
    const hubaldiumRecords = recordCounts["Hubaldium"] || 0;

    // Update Balken
    const maxRecords = Math.max(leloRecords, hubaldiumRecords, 1);
    const leloWidth = (leloRecords / maxRecords) * 100;
    const hubaldiumWidth = (hubaldiumRecords / maxRecords) * 100;

    const leloBar = document.getElementById("leloBar");
    const hubaldiumBar = document.getElementById("hubaldiumBar");
    const leloCountEl = document.getElementById("leloCount");
    const hubaldiumCountEl = document.getElementById("hubaldiumCount");
    const statsSummary = document.getElementById("statsSummary");

    if (leloBar) {
        leloBar.style.width = `${Math.max(leloWidth, 15)}%`;
        leloCountEl.textContent = leloRecords;
    }

    if (hubaldiumBar) {
        hubaldiumBar.style.width = `${Math.max(hubaldiumWidth, 15)}%`;
        hubaldiumCountEl.textContent = hubaldiumRecords;
    }

    // Bestimme Gewinner
    let summaryHTML = '';

    if (leloRecords > hubaldiumRecords) {
        const diff = leloRecords - hubaldiumRecords;
        summaryHTML = `
            <p class="winner-text">🏆 Lelo führt!</p>
            <div class="stats-detail">
                <span class="stats-detail-label">Vorsprung:</span>
                <span class="stats-detail-value">${diff} Rekord${diff !== 1 ? 'e' : ''}</span>
            </div>
        `;
    } else if (hubaldiumRecords > leloRecords) {
        const diff = hubaldiumRecords - leloRecords;
        summaryHTML = `
            <p class="winner-text">🏆 Hubaldium führt!</p>
            <div class="stats-detail">
                <span class="stats-detail-label">Vorsprung:</span>
                <span class="stats-detail-value">${diff} Rekord${diff !== 1 ? 'e' : ''}</span>
            </div>
        `;
    } else if (leloRecords === hubaldiumRecords && leloRecords > 0) {
        summaryHTML = `
            <p class="winner-text">🤝 Unentschieden!</p>
        `;
    } else {
        summaryHTML = `
            <p style="color: rgba(255,255,255,0.6);">Keine Rekorde</p>
        `;
    }

    summaryHTML += `
        <div class="stats-detail">
            <span class="stats-detail-label">Gesamt Rekorde:</span>
            <span class="stats-detail-value">${totalRecords}</span>
        </div>
        <div class="stats-detail">
            <span class="stats-detail-label">Anzahl Autos:</span>
            <span class="stats-detail-value">${data.length}</span>
        </div>
    `;

    // Andere Spieler
    const otherPlayers = Object.entries(recordCounts)
        .filter(([name]) => name !== "Lelo" && name !== "Hubaldium");

    if (otherPlayers.length > 0) {
        summaryHTML += `<p style="margin-top: 1rem; color: rgba(255,255,255,0.7); font-size: 0.9rem;">Andere Spieler:</p>`;
        otherPlayers.forEach(([name, count]) => {
            summaryHTML += `
                <div class="stats-detail">
                    <span class="stats-detail-label">${escapeHtml(name)}:</span>
                    <span class="stats-detail-value">${count}</span>
                </div>
            `;
        });
    }

    if (statsSummary) {
        statsSummary.innerHTML = summaryHTML;
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