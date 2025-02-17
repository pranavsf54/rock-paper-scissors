let playerHealth = 5;
let computerHealth = 5;

/* References for canceling ongoing animations if the user clicks again */
let cycleAnimationId = null; // For setInterval cycling
let currentRoundTimeout = null; // For setTimeout
let winnerAnimationRef = null;
let loserJumpAnimationRef = null;
let loserFlyAnimationRef = null;

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
    return `You win! ${humanChoice} beats ${computerChoice}.`;
  } else {
    return "You lose!";
  }
}

function animateHeartLoss(heartElement) {
  // Get the container for this heart (the .heart-container)
  const container = heartElement.parentElement;

  // Create the cross element.
  const cross = document.createElement("span");
  cross.classList.add("cross");
  cross.textContent = "✕";
  cross.style.color = "black";
  cross.style.position = "absolute"; // positioning relative to .heart-container

  // Center the cross using CSS.
  cross.style.left = "15%";
  cross.style.top = "25%";
  cross.style.transform = "translate(-18%, -25%)";

  // Scale the cross to 80% of the heart’s width.
  cross.style.fontSize = heartElement.clientWidth * 0.9 + "px";
  // Append the cross into the container.
  container.appendChild(cross);

  // When the cross animation ends, remove it and hide the heart.
  cross.addEventListener("animationend", () => {
    cross.remove();
    heartElement.style.visibility = "hidden";
  });
}

function cancelOngoingAnimations() {
  // Stop the cycling interval
  if (cycleAnimationId !== null) {
    clearInterval(cycleAnimationId);
    cycleAnimationId = null;
  }
  // Stop any pending timeout
  if (currentRoundTimeout !== null) {
    clearTimeout(currentRoundTimeout);
    currentRoundTimeout = null;
  }
  // Cancel winner/loser animations if they exist
  if (winnerAnimationRef) {
    winnerAnimationRef.cancel();
    // Remove its onfinish so it doesn't trigger after being canceled
    winnerAnimationRef.onfinish = null;
    winnerAnimationRef = null;
  }
  if (loserJumpAnimationRef) {
    loserJumpAnimationRef.cancel();
    loserJumpAnimationRef.onfinish = null;
    loserJumpAnimationRef = null;
  }
  if (loserFlyAnimationRef) {
    loserFlyAnimationRef.cancel();
    loserFlyAnimationRef.onfinish = null;
    loserFlyAnimationRef = null;
  }

  // Remove any leftover anime-lines
  document.querySelectorAll(".anime-lines").forEach((el) => el.remove());
}

// ~~~ SELECTORS ~~~
const imgs = document.querySelectorAll("#choices img");
const playerChoiceImg = document.querySelector("#player-choice-img");
const computerChoiceImg = document.querySelector("#computer-choice-img");
const resultText = document.querySelector("#result-text");
const resetButton = document.querySelector("#reset-button");

// ~~~ HANDLE ROUND OUTCOME ~~~
function handleRoundOutcome(result, humanChoice, computerChoice) {
  // If tie, reset images shortly and unpause.
  if (result === "It's a tie!") {
    setTimeout(() => {
      playerChoiceImg.src = "images/question-mark.svg";
      computerChoiceImg.src = "images/question-mark.svg";
      imgs.forEach((img) => img.classList.remove("paused"));
    }, 1000);
    return;
  }

  // Update health based on outcome.
  if (result.includes("win!")) {
    // Player wins: remove one heart from computer.
    const computerHearts = document.querySelectorAll("#computer-health .heart");
    const heartToLose = computerHearts[computerHealth - 1];
    animateHeartLoss(heartToLose);
    computerHealth--;
  } else if (result.includes("lose")) {
    // Player loses: remove one heart from player.
    const playerHearts = document.querySelectorAll("#player-health .heart");
    const heartToLose = playerHearts[playerHealth - 1];
    animateHeartLoss(heartToLose);
    playerHealth--;
  }

  // Check for game over.
  if (computerHealth === 0) {
    // Player wins the game.
    // Set main images, choices, and hearts to smiley.svg.
    playerChoiceImg.src = "images/smiley.svg";
    computerChoiceImg.src = "images/smiley.svg";
    document.querySelectorAll("#choices img").forEach((img) => {
      img.src = "images/smiley.svg";
    });
    document
      .querySelectorAll("#player-health .heart, #computer-health .heart")
      .forEach((img) => {
        img.src = "images/smiley.svg";
      });
    triggerConfetti();
    disableFurtherMoves();
    return;
  } else if (playerHealth === 0) {
    // Computer wins the game.
    playerChoiceImg.src = "images/robot.svg";
    computerChoiceImg.src = "images/robot.svg";
    document.querySelectorAll("#choices img").forEach((img) => {
      img.src = "images/robot.svg";
    });
    document
      .querySelectorAll("#player-health .heart, #computer-health .heart")
      .forEach((img) => {
        img.src = "images/robot.svg";
      });
    triggerShake();
    disableFurtherMoves();
    return;
  }

  // Otherwise, if the game is not over, perform the winner/loser animations.
  let winnerElem, loserElem, isHumanWinner;
  if (result.includes("win!")) {
    winnerElem = playerChoiceImg;
    loserElem = computerChoiceImg;
    isHumanWinner = true;
  } else {
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
  winnerAnimationRef = winnerElem.animate(
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
      { transform: "translate(0, 0) rotate(0deg)" },
    ],
    {
      duration: 1500,
      easing: "ease-out",
      fill: "forwards",
    }
  );

  // Animate the loser: first a small jump.
  loserJumpAnimationRef = loserElem.animate(
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

  // When the jump finishes, wait 150ms before starting the fly-off.
  loserJumpAnimationRef.onfinish = () => {
    setTimeout(() => {
      const randomAngle = Math.random() * 2 * Math.PI;
      const distance = 700;
      const exitX = Math.cos(randomAngle) * distance;
      const exitY = Math.sin(randomAngle) * distance;

      loserFlyAnimationRef = loserElem.animate(
        [
          { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
          {
            transform: `translate(${exitX * 0.9}px, ${exitY * 0.9}px) rotate(${
              (randomAngle * 180) / Math.PI + 10
            }deg)`,
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

      loserFlyAnimationRef.onfinish = () => {
        // Safely cancel the winner animation if it still exists
        if (winnerAnimationRef) {
          winnerAnimationRef.cancel();
          winnerAnimationRef = null;
        }
        // Safely cancel the loserFly animation if it still exists
        if (loserFlyAnimationRef) {
          loserFlyAnimationRef.cancel();
          loserFlyAnimationRef = null;
        }

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
    }, 150);
  };
}

// ~~~ EVENT LISTENERS ~~~
imgs.forEach((img) => {
  img.addEventListener("click", () => {
    // If the game is over (health=0), do nothing.
    if (playerHealth === 0 || computerHealth === 0) return;

    cancelOngoingAnimations();

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
    cycleAnimationId = setInterval(() => {
      computerChoiceImg.src = `./images/${
        choices[cycleIndex % choices.length]
      }.svg`;
      cycleIndex++;
    }, cycleInterval);

    // Stop cycling after 1.5 seconds.
    currentRoundTimeout = setTimeout(() => {
      clearInterval(cycleAnimationId);
      cycleAnimationId = null;

      // Reveal computer's actual choice.
      computerChoiceImg.src = `./images/${computerChoice}.svg`;

      const result = playRound(humanChoice, computerChoice);
      resultText.textContent = result;

      handleRoundOutcome(result, humanChoice, computerChoice);
    }, 1500);
  });
});

// ~~~ GAME END ANIMATIONS ~~~

// Creates an infinite falling confetti effect.
function triggerConfetti() {
  // Prevent duplicate confetti containers.
  if (document.querySelector(".confetti-container")) return;
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);

  // Create 50 confetti pieces.
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor = getRandomColor();
    confetti.style.width = Math.random() * 8 + 4 + "px";
    confetti.style.height = Math.random() * 8 + 4 + "px";
    confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
    confetti.style.animationDelay = Math.random() * 2 + "s";
    container.appendChild(confetti);
  }
}

function getRandomColor() {
  const colors = ["#FFC107", "#FF5722", "#4CAF50", "#2196F3", "#9C27B0"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function triggerShake() {
  const gameContainer = document.getElementById("game");
  gameContainer.classList.add("shake");
  setTimeout(() => {
    gameContainer.classList.remove("shake");
  }, 1000);
}

// Disables further moves after game over.
function disableFurtherMoves() {
  imgs.forEach((img) => {
    img.classList.add("paused");
  });
}

// ~~~ RESET GAME ~~~
resetButton.addEventListener("click", resetGame);

function resetGame() {
  // Restore health.
  playerHealth = 5;
  computerHealth = 5;

  // Cancel any leftover animations/timeouts.
  cancelOngoingAnimations();

  // 1) Make hearts visible again and revert them to heart.svg.
  const playerHearts = document.querySelectorAll("#player-health .heart");
  playerHearts.forEach((heart) => {
    heart.src = "images/heart.svg";
    heart.style.visibility = "visible";
  });
  const computerHearts = document.querySelectorAll("#computer-health .heart");
  computerHearts.forEach((heart) => {
    heart.src = "images/heart.svg";
    heart.style.visibility = "visible";
  });

  // 2) Reset the two main question-mark images.
  playerChoiceImg.src = "images/question-mark.svg";
  computerChoiceImg.src = "images/question-mark.svg";

  // 3) Reset the rock/paper/scissors icons in the #choices area.
  document.querySelectorAll("#choices img").forEach((choice) => {
    const id = choice.id;
    choice.src = `images/${id}.svg`;
  });

  // 4) Remove any confetti containers.
  document.querySelectorAll(".confetti-container").forEach((el) => el.remove());

  // 5) Remove shake effect if present.
  document.getElementById("game").classList.remove("shake");

  // 6) Reset the result text.
  resultText.textContent = "Make your move";

  // 7) Re-enable the pulse animation on choices.
  imgs.forEach((img) => img.classList.remove("paused"));
}
