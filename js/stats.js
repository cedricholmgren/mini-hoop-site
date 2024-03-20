document.addEventListener("DOMContentLoaded", function () {
  fetch("../data/league-data.json")
    .then((response) => response.json())
    .then((data) => {
      const playerStats = {};
      data.games.forEach((game) => {
        game.teams.flat().forEach((player) => {
          if (!playerStats[player.name]) {
            playerStats[player.name] = { ...player.stats, gamesPlayed: 1 };
          } else {
            const stats = playerStats[player.name];
            Object.keys(player.stats).forEach((key) => {
              stats[key] += player.stats[key];
            });
            stats.gamesPlayed += 1;
          }
        });
      });

      const statsTableBody = document
        .getElementById("statsTable")
        .getElementsByTagName("tbody")[0];
      Object.entries(playerStats).forEach(([name, stats]) => {
        const row = statsTableBody.insertRow();

        // Create an anchor element for the player's name
        const nameCell = row.insertCell();
        const nameLink = document.createElement("a");
        nameLink.href = `players.html?name=${encodeURIComponent(name)}`; // Link to player's profile page
        nameLink.textContent = name;
        nameCell.appendChild(nameLink);

        // Populate the rest of the stats normally
        Object.keys(stats).forEach((key, index) => {
          if (key !== "gamesPlayed") {
            const cell = row.insertCell(index + 1); // Adjusted index since nameCell already inserted
            cell.textContent = (stats[key] / stats.gamesPlayed).toFixed(2);
          }
        });
      });
    });
});
