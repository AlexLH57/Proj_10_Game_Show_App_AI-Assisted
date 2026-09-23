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

function checkWin() {
  const letters = document.querySelectorAll(".letter");
  const shownLetters = document.querySelectorAll(".letter.show");
  const gameTitle = document.getElementById("game-title");

  if (shownLetters.length === letters.length) {
    overlay.className = "win";
    overlay.style.display = "flex";
    setupForm.style.display = "none";
    gameTitle.textContent = "You Win!";
  } else if (missed >= 5) {
    overlay.className = "lose";
    overlay.style.display = "flex";
    setupForm.style.display = "none";
    gameTitle.textContent = "You Lose!";
  }
}

async function getDefinition(word) {
  const definitionText = document.querySelector("#definition p");

  try {
    const response = await fetch(
      `https://api.datamuse.com/words?sp=${word}&md=d&max=1`
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

setupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  selectedDifficulty = difficultySelect.value;
  selectedLifeIcon = lifeIconSelect.value;

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
      if (
        button.textContent.toLowerCase() === pressedKey &&
        !button.disabled
      ) {
        handleInteraction(button);
      }
    });
  }
});