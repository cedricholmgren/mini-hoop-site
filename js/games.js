document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("game");

  fetch("../data/league-data.json")
    .then((response) => response.json())
    .then((data) => {
      const game = data.games.find((g) => g.game.toString() === gameId);
      if (!game) {
        console.error("Game not found");
        return;
      }

      const team1Score = game.scores[0];
      const team2Score = game.scores[1];
      const winningTeamIndex = team1Score > team2Score ? 0 : 1;
      const winningTeam = game.teams[winningTeamIndex];

      // Collect the names of players in the winning team
      const winningTeamNames = winningTeam
        .map((player) => player.name)
        .join(" and ");

      // Update total score to include the winning team names
      const totalScoreElement = document.getElementById("totalScore");
      totalScoreElement.textContent += `${team1Score} - ${team2Score} ${winningTeamNames} Win`;

      // Populate box score
      const tbody = document.querySelector("#boxScore table tbody");
      game.teams.flat().forEach((player) => {
        const row = tbody.insertRow();
        const nameCell = row.insertCell();
        const nameLink = document.createElement("a");
        nameLink.href = `players.html?name=${encodeURIComponent(player.name)}`;
        nameLink.textContent = player.name;
        nameCell.appendChild(nameLink);

        // Populate other stats
        row.insertCell().textContent = player.stats.Points;
        row.insertCell().textContent = player.stats.TReb; // Assuming TReb is Total Rebounds
        row.insertCell().textContent = player.stats.Assists;
        // Add more cells for other stats as needed
      });
    });
});
