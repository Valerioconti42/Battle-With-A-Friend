// frontend/js/ui/leaderboard-ui.js

export function showLeaderboardLoading(container) {
    container.innerHTML = `
        <div class="leaderboard-loading">
            Loading leaderboard...
        </div>
    `;
}

export function showLeaderboardError(container, message) {
    container.innerHTML = `
        <div class="leaderboard-error">
            ${message}
        </div>
    `;
}

export function renderLeaderboard(container, leaderboard, currentUserId) {
    if (!leaderboard || leaderboard.length === 0) {
        container.innerHTML = `
            <div class="leaderboard-empty">
                No players found in leaderboard.
            </div>
        `;
        return;
    }

    const table = document.createElement('table');
    table.classList.add('leaderboard-table');

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Score</th>
        </tr>
    `;

    const tbody = document.createElement('tbody');

    leaderboard.forEach((entry, index) => {
        const tr = document.createElement('tr');

        if (entry.userId === currentUserId) {
            tr.classList.add('leaderboard-row-current-user');
        }

        tr.innerHTML = `
            <td>${entry.rank}</td>
            <td>${entry.username}</td>
            <td>${entry.totalScore}</td>
        `;

        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);
}
