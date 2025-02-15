let humanScore = 0;
let computerScore = 0;

function getComputerChoice() {
    const randomNumber = Math.floor(Math.random() * 3);
    switch (randomNumber) {
        case 0: return 'rock';
        case 1: return 'paper';
        case 2: return 'scissors';
    }
}

function playRound(humanChoice, computerChoice) {
    if (humanChoice === computerChoice) {
        return "It's a tie!";
    } else if (
        (humanChoice === 'rock' && computerChoice === 'scissors') ||
        (humanChoice === 'paper' && computerChoice === 'rock') ||
        (humanChoice === 'scissors' && computerChoice === 'paper')
    ) {
        humanScore++;
        return `You win! ${humanChoice} beats ${computerChoice}.`;
    } else {
        computerScore++;
        return 'You lose!';
    }
}

const btns = document.querySelectorAll('button');
const playerChoiceImg = document.querySelector('#player-choice-img');
const computerChoiceImg = document.querySelector('#computer-choice-img');
const resultText = document.querySelector('#result-text');
const scoreCount = document.querySelector('#score-count');

btns.forEach((btn) => {
    btn.addEventListener('click', () => {
        // Reset transforms from previous rounds.
        playerChoiceImg.style.transform = '';
        computerChoiceImg.style.transform = '';

        const humanChoice = btn.id;
        const computerChoice = getComputerChoice();
        const result = playRound(humanChoice, computerChoice);
        resultText.textContent = result;
        scoreCount.textContent = humanScore - computerScore;

        // Update images.
        playerChoiceImg.src = `images/${humanChoice}.svg`;
        computerChoiceImg.src = `images/${computerChoice}.svg`;

        let winnerElem, loserElem, isHumanWinner;
        if (result.includes("win!")) {
            winnerElem = playerChoiceImg;
            loserElem = computerChoiceImg;
            isHumanWinner = true;
        } else if (result.includes("lose")) {
            winnerElem = computerChoiceImg;
            loserElem = playerChoiceImg;
            isHumanWinner = false;
        } else {
            return;
        }

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

        const winnerAnimation = winnerElem.animate(
            [
                { transform: 'translate(0, 0) rotate(0deg)' },
                { transform: `translate(${phase1X}px, ${phase1Y}px) rotate(${phase1Rotate}deg)`, offset: 0.5 },
                { transform: `translate(${deltaX}px, ${deltaY}px) rotate(${finalRotate}deg)`, offset: 0.7 },
                { transform: `translate(0, 0) rotate(-${finalRotate}deg)` }
            ],
            {
                duration: 1000,
                easing: 'ease-out',
                fill: 'forwards'
            }
        );

        const randomAngle = Math.random() * 2 * Math.PI;
        const distance = 1500;
        const exitX = Math.cos(randomAngle) * distance;
        const exitY = Math.sin(randomAngle) * distance;

        const loserAnimation = loserElem.animate(
            [
                { transform: 'translate(0, 0) rotate(0deg)', opacity: 1, offset: 0.7 },
                // Remains fully opaque until 90% of the animation.
                { transform: `translate(${exitX * 0.9}px, ${exitY * 0.9}px) rotate(${(randomAngle * 180) / Math.PI + 10}deg)`, opacity: 1, offset: 0.9 },
                { transform: `translate(${exitX}px, ${exitY}px) rotate(${(randomAngle * 180) / Math.PI}deg)`, opacity: 0, offset: 1 }
            ],
            {
                duration: 1100, // Faster animation.
                easing: 'ease-in-out',
                fill: 'forwards'
            }
        );

        loserAnimation.onfinish = () => {
            winnerAnimation.cancel();
            loserAnimation.cancel();

            playerChoiceImg.src = "images/question-mark.svg";
            computerChoiceImg.src = "images/question-mark.svg";
            playerChoiceImg.style.transform = '';
            computerChoiceImg.style.transform = '';
            playerChoiceImg.style.opacity = 1;
            computerChoiceImg.style.opacity = 1;
        };
    });
});
