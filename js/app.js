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

async function getRandomWordAsArray() {
  const response = await fetch("./answers.json");
  const answers = await response.json();

  const words = answers[selectedDifficulty];

  const randomIndex = Math.floor(Math.random() * words.length);
  const randomWord = words[randomIndex];

  return randomWord.split("");
}

setupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  selectedDifficulty = difficultySelect.value;
  selectedLifeIcon = lifeIconSelect.value;

  const lifeImages = document.querySelectorAll(".tries img");

lifeImages.forEach((img) => {
  img.src = `./images/live${selectedLifeIcon}.png`;
});

  overlay.style.display = "none";

  console.log("Difficulty:", selectedDifficulty);
  console.log("Life icon:", selectedLifeIcon);
});