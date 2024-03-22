document.addEventListener("DOMContentLoaded", function () {
  fetch("data/league-data.json")
    .then((response) => response.json())
    .then((data) => {
      const playersList = document.getElementById("players");
      data.players.forEach((player) => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        // Use encodeURIComponent to safely encode the player's name for the URL
        link.href = `player.html?name=${encodeURIComponent(player.name)}`; // Now using name instead of ID
        link.textContent = player.name;
        listItem.appendChild(link);
        playersList.appendChild(listItem);
      });
    });
});
