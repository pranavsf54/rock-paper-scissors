let humanScore = 0;
let computerScore = 0;

function getComputerChoice() {
  const randomNumber = Math.floor(Math.random() * 3);
  switch (randomNumber) {
    case 0:
      return "rock";
    case 1:
      return "paper";
    case 2:
      return "scissors";
  }
}

function playRound(humanChoice, computerChoice) {
  if (humanChoice === computerChoice) {
    return "It's a tie!";
  } else if (
    (humanChoice === "rock" && computerChoice === "scissors") ||
    (humanChoice === "paper" && computerChoice === "rock") ||
    (humanChoice === "scissors" && computerChoice === "paper")
  ) {
    humanScore++;
    return `You win! ${humanChoice} beats ${computerChoice}.`;
  } else {
    computerScore++;
    return "You lose!";
  }
}

const imgs = document.querySelectorAll("#choices img");
const playerChoiceImg = document.querySelector("#player-choice-img");
const computerChoiceImg = document.querySelector("#computer-choice-img");
const resultText = document.querySelector("#result-text");
const scoreCount = document.querySelector("#score-count");

imgs.forEach((img) => {
  img.addEventListener("click", () => {
    // Pause the pulse animation on all choice images.
    imgs.forEach((img) => img.classList.add("paused"));

    // Reset previous transforms.
    playerChoiceImg.style.transform = "";
    computerChoiceImg.style.transform = "";

    const humanChoice = img.id;
    const computerChoice = getComputerChoice();

    // Immediately update the player's image.
    playerChoiceImg.src = `./images/${humanChoice}.svg`;

    // Start cycling animation for computer's choice.
    const choices = ["rock", "paper", "scissors"];
    let cycleIndex = 0;
    const cycleInterval = 100; // Change image every 100ms.
    const cycleAnimation = setInterval(() => {
      computerChoiceImg.src = `./images/${
        choices[cycleIndex % choices.length]
      }.svg`;
      cycleIndex++;
    }, cycleInterval);

    // Stop cycling after 1.5 seconds.
    setTimeout(() => {
      clearInterval(cycleAnimation);
      // Reveal computer's actual choice.
      computerChoiceImg.src = `./images/${computerChoice}.svg`;

      const result = playRound(humanChoice, computerChoice);
      resultText.textContent = result;
      scoreCount.textContent = humanScore - computerScore;

      // If it's a tie, no further animation is needed.
      if (result === "It's a tie!") {
        setTimeout(() => {
          // Reset images back to question marks.
          playerChoiceImg.src = "images/question-mark.svg";
          computerChoiceImg.src = "images/question-mark.svg";
          // Resume pulse animation.
          imgs.forEach((img) => img.classList.remove("paused"));
        }, 1000);
        return;
      }

      // Determine winner and loser elements.
      let winnerElem, loserElem, isHumanWinner;
      if (result.includes("win!")) {
        winnerElem = playerChoiceImg;
        loserElem = computerChoiceImg;
        isHumanWinner = true;
      } else if (result.includes("lose")) {
        winnerElem = computerChoiceImg;
        loserElem = playerChoiceImg;
        isHumanWinner = false;
      }

      // Calculate centers for animation paths.
      const winnerRect = winnerElem.getBoundingClientRect();
      const loserRect = loserElem.getBoundingClientRect();
      const winnerCenterX = winnerRect.left + winnerRect.width / 2;
      const winnerCenterY = winnerRect.top + winnerRect.height / 2;
      const loserCenterX = loserRect.left + loserRect.width / 2;
      const loserCenterY = loserRect.top + loserRect.height / 2;
      const deltaX = loserCenterX - winnerCenterX;
      const deltaY = loserCenterY - winnerCenterY;

      const phase1X = isHumanWinner ? -20 : 20;
      const phase1Y = 0;
      const phase1Rotate = isHumanWinner ? 30 : -30;
      const finalRotate = isHumanWinner ? -30 : 30;

      // Animate the winner.
      const winnerAnimation = winnerElem.animate(
        [
          { transform: "translate(0, 0) rotate(0deg)" },
          {
            transform: `translate(${phase1X}px, ${phase1Y}px) rotate(${phase1Rotate}deg)`,
            offset: 0.5,
          },
          {
            transform: `translate(${deltaX}px, ${deltaY}px) rotate(${finalRotate}deg)`,
            offset: 0.7,
          },
          { transform: `translate(0, 0) rotate(0deg)` },
        ],
        {
          duration: 1500,
          easing: "ease-out",
          fill: "forwards",
        }
      );

      // Animate the loser: First, a small jump.
      const loserJump = loserElem.animate(
        [
          { transform: "translate(0, 0) scale(1)" },
          { transform: "translateY(-20px) scale(1.05)" },
          { transform: "translate(0, 0) scale(1)" },
        ],
        {
          duration: 500,
          easing: "ease-out",
          fill: "forwards",
        }
      );

      // Create the anime-lines element with three child lines.
      const animeLines = document.createElement("div");
      animeLines.classList.add("anime-lines");
      for (let i = 0; i < 3; i++) {
        const line = document.createElement("div");
        line.classList.add("line");
        animeLines.appendChild(line);
      }
      document.body.appendChild(animeLines);

      // Position the anime-lines element above the loser's head.
      animeLines.style.left = loserRect.left + loserRect.width / 2 - 20 + "px";
      animeLines.style.top = loserRect.top - 50 + "px";

      // When the jump finishes, wait 550ms before starting the fly-off.
      loserJump.onfinish = () => {
        setTimeout(() => {
          const randomAngle = Math.random() * 2 * Math.PI;
          const distance = 700;
          const exitX = Math.cos(randomAngle) * distance;
          const exitY = Math.sin(randomAngle) * distance;

          const loserFlyAnimation = loserElem.animate(
            [
              { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
              {
                transform: `translate(${exitX * 0.9}px, ${
                  exitY * 0.9
                }px) rotate(${(randomAngle * 180) / Math.PI + 10}deg)`,
                opacity: 1,
              },
              {
                transform: `translate(${exitX}px, ${exitY}px) rotate(${
                  (randomAngle * 180) / Math.PI
                }deg)`,
                opacity: 0,
              },
            ],
            {
              duration: 1000,
              easing: "ease",
              fill: "forwards",
            }
          );

          loserFlyAnimation.onfinish = () => {
            winnerAnimation.cancel();
            loserFlyAnimation.cancel();

            // Reset images back to question marks.
            playerChoiceImg.src = "images/question-mark.svg";
            computerChoiceImg.src = "images/question-mark.svg";
            playerChoiceImg.style.transform = "";
            computerChoiceImg.style.transform = "";
            playerChoiceImg.style.opacity = 1;
            computerChoiceImg.style.opacity = 1;
            // Resume pulse animation on choice images.
            imgs.forEach((img) => img.classList.remove("paused"));
            // Remove the anime-lines element.
            animeLines.remove();
          };
        }, 150); // Delay of 550ms to sync with the winner's hit
      };
    }, 1500);
  });
});
