console.log("Game loaded");

const qwerty = document.getElementById("qwerty");
const word = document.getElementById("word");

let missed = 0;

const setupForm = document.getElementById("setup-form");
const difficultySelect = document.getElementById("difficulty");
const lifeIconSelect = document.getElementById("lifeicon");
const overlay = document.getElementById("overlay");

let selectedDifficulty = "";
let selectedLifeIcon = "";
let currentWord = "";
let currentStreak = 0;

async function getRandomWordAsArray() {
  const response = await fetch("./answers.json");
  const answers = await response.json();

  const words = answers[selectedDifficulty];

  const randomIndex = Math.floor(Math.random() * words.length);
  const randomWord = words[randomIndex];

  return randomWord.split("");
}

function addWordToDisplay(arr) {
  const wordList = word.querySelector("ul");

  arr.forEach((letter) => {
    const li = document.createElement("li");
    li.className = "letter";
    li.textContent = letter;

    wordList.appendChild(li);
  });
}

function checkLetter(letter) {
  const letters = document.querySelectorAll(".letter");
  let matchFound = false;

  letters.forEach((li) => {
    if (li.textContent === letter) {
      li.classList.add("show");
      matchFound = true;
    }
  });

  return matchFound ? letter : null;
}

function removeLife() {
  const lifeImages = document.querySelectorAll(".tries img");

  lifeImages[missed].src = `./images/lost${selectedLifeIcon}.png`;

  missed++;
}

function handleInteraction(button) {
  button.disabled = true;
  button.classList.add("chosen");

  const guessedLetter = button.textContent.toLowerCase();
  const match = checkLetter(guessedLetter);

  if (match === null) {
    removeLife();
  }

  checkWin();
}

function getBestStreakKey() {
  return `bestStreak_${selectedDifficulty}`;
}

function getCurrentStreakKey() {
  return `currentStreak_${selectedDifficulty}`;
}

function getBestStreak() {
  const savedBestStreak = localStorage.getItem(getBestStreakKey());

  return savedBestStreak ? Number(savedBestStreak) : 0;
}

function getCurrentStreak() {
  const savedCurrentStreak = localStorage.getItem(getCurrentStreakKey());

  return savedCurrentStreak ? Number(savedCurrentStreak) : 0;
}

function updateBestStreak() {
  const bestStreak = getBestStreak();

  if (currentStreak > bestStreak) {
    localStorage.setItem(getBestStreakKey(), currentStreak);
  }
}

function saveCurrentStreak() {
  localStorage.setItem(getCurrentStreakKey(), currentStreak);
}

function showStreaks() {
  const bestStreak = getBestStreak();

  const streakText = document.createElement("p");
  streakText.className = "streak-text";
  streakText.textContent = `Current Streak: ${currentStreak}`;

  const bestText = document.createElement("p");
  bestText.className = "streak-text";
  bestText.textContent = `Best Streak: ${bestStreak}`;

  overlay.appendChild(streakText);
  overlay.appendChild(bestText);
}

function checkWin() {
  const letters = document.querySelectorAll(".letter");
  const shownLetters = document.querySelectorAll(".letter.show");
  const gameTitle = document.getElementById("game-title");

  if (shownLetters.length === letters.length) {
    currentStreak++;
    saveCurrentStreak();
    updateBestStreak();

    overlay.className = "win";
    overlay.style.display = "flex";
    setupForm.style.display = "none";
    gameTitle.textContent = "You Win!";

    showStreaks();
    showEndGameButtons();
  } else if (missed >= 5) {
    currentStreak = 0;
    saveCurrentStreak();

    overlay.className = "lose";
    overlay.style.display = "flex";
    setupForm.style.display = "none";
    gameTitle.textContent = "You Lose!";

    showStreaks();
    showEndGameButtons();
  }
}

async function getDefinition(word) {
  const definitionText = document.querySelector("#definition p");

  try {
    const response = await fetch(
      `https://api.datamuse.com/words?sp=${word}&md=d&max=1`,
    );

    const data = await response.json();

    if (data.length > 0 && data[0].defs) {
      definitionText.textContent = `Hint: ${data[0].defs[0]}`;
    } else {
      definitionText.textContent = "No definition available.";
    }
  } catch (error) {
    definitionText.textContent = "Could not load definition.";
  }
}

function resetGameBoard() {
  missed = 0;

  const wordList = word.querySelector("ul");
  wordList.innerHTML = "";

  const buttons = qwerty.querySelectorAll("button");

  buttons.forEach((button) => {
    button.disabled = false;
    button.classList.remove("chosen");
  });

  const lifeImages = document.querySelectorAll(".tries img");

  lifeImages.forEach((img) => {
    img.src = `./images/live${selectedLifeIcon}.png`;
  });

  const definitionText = document.querySelector("#definition p");
  definitionText.textContent = "";
}

function showEndGameButtons() {
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  const playAgainButton = document.createElement("button");
  playAgainButton.className = "btn_reset";
  playAgainButton.textContent = "Play Again";

  const homeButton = document.createElement("button");
  homeButton.className = "btn_home";
  homeButton.textContent = "Home";

  buttonContainer.appendChild(playAgainButton);
  buttonContainer.appendChild(homeButton);

  overlay.appendChild(buttonContainer);

  playAgainButton.addEventListener("click", async () => {
    document.querySelectorAll(".streak-text").forEach((text) => {
      text.remove();
    });

    buttonContainer.remove();

    resetGameBoard();

    const wordArray = await getRandomWordAsArray();

    currentWord = wordArray.join("");

    addWordToDisplay(wordArray);
    getDefinition(currentWord);

    overlay.style.display = "none";
  });

  homeButton.addEventListener("click", () => {
    document.querySelectorAll(".streak-text").forEach((text) => {
      text.remove();
    });

    buttonContainer.remove();

    resetGameBoard();

    overlay.className = "start";
    overlay.style.display = "flex";

    setupForm.style.display = "block";

    const gameTitle = document.getElementById("game-title");
    gameTitle.textContent = "Wheel of Success 2.0";
  });
}

setupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  selectedDifficulty = difficultySelect.value;
  selectedLifeIcon = lifeIconSelect.value;
  currentStreak = getCurrentStreak();

  const lifeImages = document.querySelectorAll(".tries img");

  lifeImages.forEach((img) => {
    img.src = `./images/live${selectedLifeIcon}.png`;
  });

  const wordArray = await getRandomWordAsArray();

  currentWord = wordArray.join("");

  addWordToDisplay(wordArray);
  getDefinition(currentWord);

  console.log(wordArray);

  overlay.style.display = "none";
});

qwerty.addEventListener("click", (event) => {
  if (event.target.tagName === "BUTTON") {
    handleInteraction(event.target);
  }
});

document.addEventListener("keydown", (event) => {
  const pressedKey = event.key.toLowerCase();

  if (/^[a-z]$/.test(pressedKey)) {
    const buttons = qwerty.querySelectorAll("button");

    buttons.forEach((button) => {
      if (button.textContent.toLowerCase() === pressedKey && !button.disabled) {
        handleInteraction(button);
      }
    });
  }
});