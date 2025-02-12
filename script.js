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

function getHumanChoice() {
    let humanChoice = prompt('Please enter your choice: rock, paper, or scissors.');
    let lower = humanChoice.toLowerCase();
    while (lower !== 'rock' && lower !== 'paper' && lower !== 'scissors') {
        console.log('Invalid choice. Please enter rock, paper, or scissors.');
        humanChoice = prompt('Please enter your choice: rock, paper, or scissors.');
        lower = humanChoice.toLowerCase();
    }
    return lower;
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

playGame();