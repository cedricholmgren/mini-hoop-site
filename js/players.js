document.addEventListener("DOMContentLoaded", function () {
  fetch("../data/league-data.json")
    .then((response) => response.json())
    .then((data) => {
      const playersContainer = document.getElementById("playersList");
      data.players.forEach((player) => {
        const playerLink = document.createElement("a");
        playerLink.href = `player.html?name=${encodeURIComponent(player.name)}`;
        playerLink.textContent = player.name;
        playersContainer.appendChild(playerLink);
        playersContainer.appendChild(document.createElement("br")); // Line break for readability
      });
    });
});
