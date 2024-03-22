document.addEventListener("DOMContentLoaded", function () {
  fetch("../data/league-data.json")
    .then((response) => response.json())
    .then((data) => {
      const gamesContainer = document.getElementById("gamesList");
      data.games.forEach((game) => {
        const gameLink = document.createElement("a");
        gameLink.href = `game.html?game=${game.game}`; // Assuming each game has a unique identifier
        gameLink.textContent = `Game ${game.game}`; // Display text
        gamesContainer.appendChild(gameLink);
        gamesContainer.appendChild(document.createElement("br")); // Line break for readability
      });
    });
});
