let humanScore = 0;
let computerScore = 0;

function getComputerChoice() {
    const randomNumber = Math.floor(Math.random() * 3);
    switch (randomNumber) {
        case 0:
            return 'rock';
        case 1:
            return 'paper';
        case 2:
            return 'scissors';
    }
}

function playRound(humanChoice, computerChoice) {
    if (humanChoice === computerChoice) {
        return 'It\'s a tie!';
    } else if (humanChoice === 'rock' && computerChoice === 'scissors') {
        humanScore++;
        return 'You win! Rock beats scissors.';
    } else if (humanChoice === 'paper' && computerChoice === 'rock') {
        humanScore++;
        return 'You win! Paper beats rock.';
    } else if (humanChoice === 'scissors' && computerChoice === 'paper') {
        humanScore++;
        return 'You win! Scissors beats paper.';
    } else {
        computerScore++;
        return 'You lose!';
    }
}

function playGame() {
    for (let i = 0; i < 5; i++) {
        let humanChoice = getHumanChoice();
        let computerChoice = getComputerChoice();
        let result = playRound(humanChoice, computerChoice);
        console.log(`You chose: ${humanChoice}`);
        console.log(`Computer chose: ${computerChoice}`);
        console.log(result);
        console.log(`Scores - Human: ${humanScore}, Computer: ${computerScore}`);
    }
    if (humanScore > computerScore) {
        console.log('Human wins the game!');
    } else if (humanScore < computerScore) {
        console.log('Computer wins the game!');
    } else {
        console.log('It\'s a tie!');
    }
}

const btns = document.querySelectorAll('button');
const player_choice_img = document.querySelector('#player-choice-img');
const computer_choice_img = document.querySelector('#computer-choice-img');
const result_text = document.querySelector('#result-text');

btns.forEach((btn) => {
    btn.addEventListener('click', () => {
        humanChoice = btn.id;
        computerChoice = getComputerChoice();
        result_text.textContent = playRound(humanChoice, computerChoice);
        player_choice_img.src = `images/${btn.id}.webp`;
        computer_choice_img.src = `images/${computerChoice}.webp`;
    });
});