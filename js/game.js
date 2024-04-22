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

      //for the id gameStats. Display the total points, field goal percentage, rebounds, assists, steals, blocks, turnovers for the game for each team. But have the name of the stat in the middle and the value on the left and right. For example, 100 Points 200
      const team1Stats = {
        Points: 0,
        FGMade: 0,
        FGA: 0,
        TReb: 0,
        Steals: 0,
        Blocks: 0,
        TO: 0,
      };
      const team2Stats = {
        Points: 0,
        FGMade: 0,
        FGA: 0,
        TReb: 0,
        Steals: 0,
        Blocks: 0,
        TO: 0,
      };

      game.teams[0].forEach((player) => {
        team1Stats.Points += player.stats.Points;
        team1Stats.FGMade += player.stats.FGMade;
        team1Stats.FGA += player.stats.FGA;
        team1Stats.TReb += player.stats.TReb;
        team1Stats.Steals += player.stats.Steals;
        team1Stats.Blocks += player.stats.Blocks;
        team1Stats.TO += player.stats.TO;
      });

      game.teams[1].forEach((player) => {
        team2Stats.Points += player.stats.Points;
        team2Stats.FGMade += player.stats.FGMade;
        team2Stats.FGA += player.stats.FGA;
        team2Stats.TReb += player.stats.TReb;
        team2Stats.Steals += player.stats.Steals;
        team2Stats.Blocks += player.stats.Blocks;
        team2Stats.TO += player.stats.TO;
      });

      const teamStatsElement = document.getElementById("gameStats");

      teamStatsElement.innerHTML = `
        <h3>${game.teams[0]
          .map((player) => player.name)
          .join(" and ")} vs ${game.teams[1]
        .map((player) => player.name)
        .join(" and ")}</h3>
        ${createStatsLine(
          "Pts",
          team1Stats.Points,
          team2Stats.Points,
          team1Stats.Points + team2Stats.Points
        )}
        ${createStatsLine(
          "FG%",
          ((team1Stats.FGMade / team1Stats.FGA) * 100).toFixed(1),
          ((team2Stats.FGMade / team2Stats.FGA) * 100).toFixed(1),
          ((team1Stats.FGMade + team2Stats.FGMade) /
            (team1Stats.FGA + team2Stats.FGA)) *
            100
        )}
        ${createStatsLine(
          "Reb",
          team1Stats.TReb,
          team2Stats.TReb,
          team1Stats.TReb + team2Stats.TReb
        )}
        ${createStatsLine(
          "Stl",
          team1Stats.Steals,
          team2Stats.Steals,
          team1Stats.Steals + team2Stats.Steals
        )}
        ${createStatsLine(
          "Blk",
          team1Stats.Blocks,
          team2Stats.Blocks,
          team1Stats.Blocks + team2Stats.Blocks
        )}
        ${createStatsLine(
          "TO",
          team1Stats.TO,
          team2Stats.TO,
          team1Stats.TO + team2Stats.TO
        )}
      `;

      function createStatsLine(statName, team1Stat, team2Stat, totalStat) {
        const maxBarWidth = 100; // maximum width for the bars
        const team1Width =
          totalStat > 0 ? (team1Stat / totalStat) * maxBarWidth : 0;
        const team2Width =
          totalStat > 0 ? (team2Stat / totalStat) * maxBarWidth : 0;

        return `
            <div id="stat-line" class="stat-line" data-team1stat="${team1Stat}" data-team2stat="${team2Stat}" data-totalstat="${totalStat}">
                <span class="stat-name left">${statName}</span>
                <span class="team-stat left">${team1Stat}</span>
                <div class="stat-bar team1" style="width: ${team1Width}%;"></div>               
                
                <div class="stat-bar team2" style="width: ${team2Width}%;"></div>
                <span class="team-stat right">${team2Stat}</span>
                <span class="stat-name right">${statName}</span>
            </div>
        `;
      }

      const tableHead = document.querySelector("#boxScore .table thead tr");
      const tableBody = document.querySelector("#boxScore .table tbody");

      // Define headers for the box score table and clear previous headers
      tableHead.innerHTML = "";
      const headers = [
        "Player",
        "FGM",
        "FGA",
        "3PM",
        "3PA",
        "FTM",
        "FTA",
        "OReb",
        "DReb",
        "TReb",
        "Assists",
        "Blocks",
        "Steals",
        "TO",
        "Fouls",
        "Dunks",
        "Points",
        "Game Score",
      ];
      headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        tableHead.appendChild(th);
      });

      // Clear previous data in the body
      tableBody.innerHTML = "";

      // Populate the table with player stats
      game.teams.forEach((team) => {
        team.forEach((player) => {
          const row = document.createElement("tr");
          row.appendChild(createPlayerLink(player.name)); // Use a function to create a link cell for player names

          // Append all other stats
          Object.values(player.stats).forEach((stat) => {
            row.appendChild(createCell(stat));
          });

          // Calculate and append the game score
          const gameScore = calculateMiniHoopGameScore(
            player.stats.Points,
            player.stats.FGMade,
            player.stats.FGA,
            player.stats.FTM,
            player.stats.FTA,
            player.stats.OReb,
            player.stats.DReb,
            player.stats.Steals,
            player.stats.Assists,
            player.stats.Blocks,
            player.stats.Fouls,
            player.stats.TO
          );
          row.appendChild(createCell(gameScore.toFixed(2))); // Append calculated score to the row

          tableBody.appendChild(row);
        });
      });
    });

  function createCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
  }

  function createPlayerLink(playerName) {
    const link = document.createElement("a");
    link.href = `player.html?name=${encodeURIComponent(playerName)}`;
    link.textContent = playerName;
    const cell = document.createElement("td");
    cell.appendChild(link);
    return cell;
  }

  function calculateMiniHoopGameScore(
    points,
    fgMade,
    fgAttempts,
    ftAttempts,
    ftMade,
    offRebounds,
    defRebounds,
    steals,
    assists,
    blocks,
    fouls,
    turnovers
  ) {
    return (
      points * 3.5 +
      0.5 * fgMade -
      fgAttempts -
      0.4 * (ftAttempts - ftMade) +
      0.3 * offRebounds +
      0.2 * defRebounds +
      steals * 0.23 +
      assists * 1.6 +
      blocks * 0.4 -
      fouls * 0.2 -
      turnovers * 0.37
    );
  }
});
