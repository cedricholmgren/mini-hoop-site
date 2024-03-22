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
      document.getElementById(
        "playerAge"
      ).textContent = `Age ${playerInfo.age} | Weight ${playerInfo.weight} | Height ${playerInfo.height}`;
      document.getElementById("playerBio").textContent = playerInfo.bio;

      const gamesPlayedBody = document
        .getElementById("gamesPlayed")
        .getElementsByTagName("tbody")[0];
      playerGames.forEach((game) => {
        let row = gamesPlayedBody.insertRow();
        let cellGameDetails = row.insertCell(0);

        // Link for the game number
        let linkGame = document.createElement("a");
        linkGame.href = `game.html?game=${game.gameNumber}`;
        linkGame.textContent = `Game ${game.gameNumber}`;
        cellGameDetails.appendChild(linkGame);
        cellGameDetails.appendChild(document.createTextNode(": ")); // Separator

        // Construct detailed text with links for player names
        const fullGame = data.games.find((g) => g.game === game.gameNumber);
        fullGame.teams.forEach((team, index) => {
          team.forEach((player, playerIndex) => {
            let playerNameLink = document.createElement("a");
            playerNameLink.href = `player.html?name=${encodeURIComponent(
              player.name
            )}`;
            playerNameLink.textContent = player.name;
            cellGameDetails.appendChild(playerNameLink);

            if (playerIndex < team.length - 1) {
              cellGameDetails.appendChild(document.createTextNode(" and "));
            }
          });

          if (index === 0) {
            cellGameDetails.appendChild(
              document.createTextNode(` ${fullGame.scores.join("-")} `)
            );
          }
        });

        // Dynamically add stats to the row
        const statsColumns = Object.keys(game.stats);
        statsColumns.forEach((stat) => {
          row.insertCell().textContent = game.stats[stat];
        });
      });

      //check all players stats and find the highest value for each stat across all games for everyone
      const allPlayers = data.games.flatMap((game) => game.teams.flat());
      const allStats = allPlayers.flatMap((player) =>
        Object.keys(player.stats).map((stat) => player.stats[stat])
      );
      const maxStats = allPlayers.reduce((acc, curr) => {
        Object.keys(curr.stats).forEach((stat) => {
          if (!acc[stat] || curr.stats[stat] > acc[stat]) {
            acc[stat] = curr.stats[stat];
          }
        });
        return acc;
      }, {});
      //in this table highlight any current cells that hvae any stats that are the highest across all games for all players
      const gamesPlayedTable = document.getElementById("gamesPlayed");
      const rows = gamesPlayedTable.getElementsByTagName("tr");
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        for (let j = 1; j < cells.length; j++) {
          const cellValue = parseInt(cells[j].textContent);
          if (cellValue === maxStats[Object.keys(maxStats)[j - 1]]) {
            cells[j].style.backgroundColor = "#57ad54"; //highlight the cell
          }
        }
      }

      // Add headers for stats and make them bold
      const headerRow = gamesPlayedBody.insertRow(0);
      headerRow.style.fontWeight = "bold";
      let cell = headerRow.insertCell(0);
      cell.textContent = "Game";
      Object.keys(playerGames[0].stats).forEach((stat) => {
        cell = headerRow.insertCell();
        cell.textContent = stat;
      });

      // Calculate Career Totals and Averages
      const totals = playerGames.reduce((acc, curr) => {
        Object.keys(curr.stats).forEach((stat) => {
          acc[stat] = (acc[stat] || 0) + curr.stats[stat];
        });
        return acc;
      }, {});

      const averages = Object.keys(totals).reduce((acc, key) => {
        acc[key] = totals[key] / playerGames.length;
        return acc;
      }, {});

      // Add Totals Row
      let row = gamesPlayedBody.insertRow();
      row.insertCell(0).textContent = "Totals";
      Object.keys(totals).forEach((stat) => {
        row.insertCell().textContent = totals[stat];
      });

      // Add Averages Row
      row = gamesPlayedBody.insertRow();
      row.insertCell(0).textContent = "Averages";
      Object.keys(averages).forEach((stat) => {
        row.insertCell().textContent = averages[stat].toFixed(2);
      });

      const toggleButton = document.getElementById("toggleStats");
      let showAverages = true; // Keeps track of what's currently shown

      toggleButton.addEventListener("click", () => {
        showAverages = !showAverages; // Toggle the state
        updateStatsDisplay(showAverages); // Update the stats display based on the new state
        toggleButton.textContent = showAverages ? "Totals" : "Averages"; // Update button text
      });

      function calculatePlayerStats(data, calculateAverages = false) {
        let playerStats = {};

        // Aggregate stats for each player
        data.games.forEach((game) => {
          game.teams.flat().forEach((player) => {
            if (!playerStats[player.name]) {
              playerStats[player.name] = { gamesPlayed: 0, stats: {} };
            }

            const playerRecord = playerStats[player.name];
            playerRecord.gamesPlayed += 1;

            Object.keys(player.stats).forEach((stat) => {
              if (!playerRecord.stats[stat]) {
                playerRecord.stats[stat] = 0;
              }
              playerRecord.stats[stat] += player.stats[stat];
            });
          });
        });

        // Process totals and averages
        Object.values(playerStats).forEach((player) => {
          // Directly calculate shooting percentage from totals first
          if (
            player.stats["FGMade"] !== undefined &&
            player.stats["FGA"] !== undefined
          ) {
            player.stats["ShootingPercentage"] =
              player.stats["FGMade"] / player.stats["FGA"];
          }

          if (calculateAverages) {
            // Then calculate averages for all stats including shooting percentage
            Object.keys(player.stats).forEach((stat) => {
              if (stat !== "ShootingPercentage") {
                // Avoid averaging the already calculated percentage
                player.stats[stat] /= player.gamesPlayed;
              }
            });

            // Recalculate shooting percentage based on averages if necessary
            if (
              player.stats["FGMade"] !== undefined &&
              player.stats["FGA"] !== undefined
            ) {
              player.stats["ShootingPercentage"] =
                player.stats["FGMade"] / player.stats["FGA"];
            }
          }
        });

        return playerStats;
      }

      const playerTotals = calculatePlayerStats(data);
      const playerAverages = calculatePlayerStats(data, true); // Pass true to calculate averages
      console.log(playerTotals);
      console.log(playerAverages);

      function calculateStatRanges(playerStats) {
        let statRanges = {};

        // Dynamically initialize statRanges based on encountered stats
        Object.values(playerStats).forEach((player) => {
          Object.entries(player.stats).forEach(([stat, value]) => {
            if (!statRanges[stat]) {
              statRanges[stat] = { min: Infinity, max: -Infinity };
            }
            // Ensure that value is a number
            if (typeof value === "number") {
              statRanges[stat].min = Math.min(statRanges[stat].min, value);
              statRanges[stat].max = Math.max(statRanges[stat].max, value);
            }
          });
        });

        return statRanges;
      }

      const statRangesAverages = calculateStatRanges(playerAverages);
      const statRangesTotals = calculateStatRanges(playerTotals);

      function getStatColor(stat, value, { min, max }) {
        const range = max - min;
        const third = range / 3; // Calculate a third of the range for about 33.3%

        // Handle turnovers differently
        if (stat === "TO") {
          if (value === min) return "#9B30FF"; // Purple for lowest
          if (value === max) return "#f44336"; // Red for highest
          if (value <= min + third) return "#57ad54"; // Green for bottom 33%
          if (value >= min + 2 * third) return "#FFA500"; // Orange for top 33%
          return "#A9A9A9"; // Gray for middle values
        } else {
          if (value === max) return "#9B30FF"; // Purple for highest
          if (value === min) return "#f44336"; // Red for lowest
          if (value >= min + 2 * third) return "#57ad54"; // Green for top 33%
          if (value <= min + third) return "#FFA500"; // Orange for bottom 33%
          return "#A9A9A9"; // Gray for middle values
        }
      }

      // Update the updateStatsDisplay function to pass the stat name to getStatColor
      function updateStatsDisplay(showAverages) {
        const statCategories = [
          "Points",
          "TReb",
          "Assists",
          "Steals",
          "Blocks",
          "TO",
          "ShootingPercentage",
        ];
        const currentRanges = showAverages
          ? statRangesAverages
          : statRangesTotals; // Use the correct ranges

        statCategories.forEach((stat) => {
          let playerValue;
          if (showAverages) {
            playerValue = playerAverages[playerName]?.stats[stat];
          } else {
            playerValue = playerTotals[playerName]?.stats[stat];
          }

          // Special handling for ShootingPercentage
          let displayValue;
          if (stat === "ShootingPercentage") {
            displayValue = (playerValue * 100).toFixed(2) + "%";
          } else {
            displayValue =
              playerValue !== undefined
                ? parseFloat(playerValue).toFixed(2)
                : "0";
          }

          let statColor = getStatColor(stat, playerValue, currentRanges[stat]); // Use unformatted playerValue for color determination

          const statElement = document.getElementById(`player${stat}`);
          if (statElement) {
            statElement.textContent = displayValue; // Use formatted value for display
            statElement.parentNode.style.backgroundColor = statColor;
          } else {
            console.error(`Element for ${stat} not found.`);
          }
        });
      }

      // Then call updateStatsDisplay as needed
      updateStatsDisplay(showAverages);
    });
});
