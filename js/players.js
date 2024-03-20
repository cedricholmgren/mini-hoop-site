document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const playerName = decodeURIComponent(urlParams.get("name"));

  fetch("../data/league-data.json")
    .then((response) => response.json())
    .then((data) => {
      const playerGames = data.games.flatMap((game) =>
        game.teams
          .flat()
          .filter((player) => player.name === playerName)
          .map((player) => ({ ...player, gameNumber: game.game }))
      );

      if (playerGames.length === 0) {
        console.error("Player not found in any games");
        return;
      }

      // Populate player info
      const playerInfo = data.players.find((p) => p.name === playerName);
      document.getElementById("playerName").textContent = playerInfo.name;
      document.getElementById("playerImage").src = `${playerInfo.image}`;
      document.getElementById("playerImage").alt = playerInfo.name;
      document.getElementById("playerBio").textContent = playerInfo.bio;

      // Populate Games Played Table
      const gamesPlayedBody = document
        .getElementById("gamesPlayed")
        .getElementsByTagName("tbody")[0];
      playerGames.forEach((game) => {
        let row = gamesPlayedBody.insertRow();
        let cellGame = row.insertCell(0);
        let linkGame = document.createElement("a");
        linkGame.href = `games.html?game=${game.gameNumber}`; // Link to the game page
        linkGame.textContent = `Game ${game.gameNumber}`;
        cellGame.appendChild(linkGame);
        // Add other stats as needed
        row.insertCell(1).textContent = game.stats.Points;
        row.insertCell(2).textContent = game.stats.TReb; // Example for total rebounds
        row.insertCell(3).textContent = game.stats.Assists;
      });

      // Calculate Career Totals
      const totals = playerGames.reduce((acc, curr) => {
        Object.keys(curr.stats).forEach((stat) => {
          acc[stat] = (acc[stat] || 0) + curr.stats[stat];
        });
        return acc;
      }, {});

      // Calculate Career Averages
      const averages = Object.keys(totals).reduce((acc, key) => {
        acc[key] = totals[key] / playerGames.length;
        return acc;
      }, {});

      // Display Career Averages
      const careerAveragesDiv = document.getElementById("careerAverages");
      Object.entries(averages).forEach(([stat, value]) => {
        const p = document.createElement("p");
        p.textContent = `${stat.toUpperCase()}: ${value.toFixed(2)}`;
        careerAveragesDiv.appendChild(p);
      });

      // Display Career Totals
      const careerTotalsDiv = document.getElementById("careerTotals");
      Object.entries(totals).forEach(([stat, value]) => {
        const p = document.createElement("p");
        p.textContent = `${stat.toUpperCase()}: ${value}`;
        careerTotalsDiv.appendChild(p);
      });
    });
});
