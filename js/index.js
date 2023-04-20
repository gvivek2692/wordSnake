import { commonWords } from './wordList.js';

// Game Constants & Variables
let inputDir = {x: 0, y: 0}; 
let hiscoreval = 0;
const foodSound = new Audio('music/food.mp3');
const gameOverSound = new Audio('music/gameover.mp3');
const moveSound = new Audio('music/move.mp3');
const musicSound = new Audio('music/music.mp3');

let speed = 6;
let score = 0;
let lastPaintTime = 0;
let foodMaxThresh = 15
let isPaused = false;
let hasChangedDirection = false;


const letterFrequency = {
    'a': 8.167, 'b': 1.492, 'c': 2.782, 'd': 4.253, 'e': 12.702,
    'f': 2.228, 'g': 2.015, 'h': 6.094, 'i': 6.966, 'j': 0.153,
    'k': 0.772, 'l': 4.025, 'm': 2.406, 'n': 6.749, 'o': 7.507,
    'p': 1.929, 'q': 0.095, 'r': 5.987, 's': 6.327, 't': 9.056,
    'u': 2.758, 'v': 0.978, 'w': 2.361, 'x': 0.150, 'y': 1.974, 'z': 0.074, '#': 4
};

const letterScores = {
    'a': 1, 'e': 1, 'i': 1, 'o': 1, 'u': 1, 'l': 1, 'n': 1, 'r': 1, 's': 1, 't': 1,
    'd': 2, 'g': 2,
    'b': 3, 'c': 3, 'm': 3, 'p': 3,
    'f': 4, 'h': 4, 'v': 4, 'w': 4, 'y': 4,
    'k': 5,
    'j': 8, 'x': 8,
    'q': 10, 'z': 10
};

let snakeArr = [
    {x: 13, y: 15, letter: ''}
];

let foods = [
    {x: 6, y: 7, letter: getRandomLetter()},
    {x: 10, y: 10, letter: getRandomLetter()},

  ];


// Game Functions

function shuffleSnakeLetters() {
    let snakeBodyLetters = snakeArr.slice(1).map(part => part.letter);
    for (let i = snakeBodyLetters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [snakeBodyLetters[i], snakeBodyLetters[j]] = [snakeBodyLetters[j], snakeBodyLetters[i]];
    }
    for (let i = 1; i < snakeArr.length; i++) {
        snakeArr[i].letter = snakeBodyLetters[i - 1];
    }
}



function getWordScore(word) {
    let score = 0;
    for (let i = 0; i < word.length; i++) {
        score += letterScores[word[i].toLowerCase()];
    }
    return score;
}

function getLetterScore(letter) {
    return letterScores[letter.toLowerCase()] || 0;
}


// function getRandomLetter() {
//     const alphabet = "AEIOU".repeat(5) + "#".repeat(3) + "BCDFGHJKLMNPQRSTVWXYZ";
//     return alphabet[Math.floor(Math.random() * alphabet.length)];
// }
function getRandomLetter() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz#";
    const probabilities = [];

    // Calculate the cumulative probability for each letter
    let cumulativeProbability = 0;
    for (let letter of alphabet) {
        cumulativeProbability += letterFrequency[letter];
        probabilities.push(cumulativeProbability);
    }

    // Generate a random number between 0 and the total cumulative probability (100)
    const random = Math.random() * 100;

    // Find the index of the first cumulative probability that is greater than the random number
    const index = probabilities.findIndex(probability => probability > random);

    return alphabet[index].toUpperCase();
}



function main(ctime) {
    window.requestAnimationFrame(main);

    if (isPaused) {
        return;
    }

    if ((ctime - lastPaintTime) / 1000 < 1 / speed) {
        return;
    }
    lastPaintTime = ctime;
    gameEngine();
}


function isCollide(snake) {
    // If you bump into yourself 
    for (let i = 1; i < snakeArr.length; i++) {
        // Add a condition to check if the snake's head is about to collide with its body in the next step
        if (snake[i].x === snake[0].x + inputDir.x && snake[i].y === snake[0].y + inputDir.y) {
            return true;
        }
    }
    // If you bump into the wall
    if (snake[0].x >= 18 || snake[0].x <=0 || snake[0].y >= 18 || snake[0].y <=0) {
        return true;
    }

    return false;
}



function updateSnakeLetters() {
    let snakeLetters = snakeArr.slice(1).map(part => part.letter).join(" ");
    document.getElementById("snakeLettersBox").innerHTML = "Snake Letters: " + snakeLetters;
}

function checkForValidWord() {
    let word = snakeArr.slice(1).map(part => part.letter).join("").toLowerCase();

    for (let i = 0; i < commonWords.length; i++) {
        let validWord = commonWords[i];
        let index = word.indexOf(validWord);

        if (index !== -1) {
            snakeArr.splice(index + 1, validWord.length);
            const wordScore = getWordScore(validWord);
            increaseScore(0, validWord); // Pass validWord as the second argument
            let validWordsBox = document.getElementById("validWordsBox");
            validWordsBox.innerHTML += "<br>" + validWord + " - " + wordScore;
            break;
        }
    }
}





function checkForConsecutiveLetters() {
    for (let i = 1; i < snakeArr.length - 2; i++) {
        if (snakeArr[i].letter === snakeArr[i + 1].letter && snakeArr[i].letter === snakeArr[i + 2].letter) {
            snakeArr.splice(i, 3);
            increaseScore(3);
            break;
        }
    }
}

function increaseScore(increaseBy, word = null){
    if (word) {
        increaseBy = getWordScore(word);
    }
    score += increaseBy;
    if(score>hiscoreval){
        hiscoreval = score;
        localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
        hiscoreBox.innerHTML = "HiScore: " + hiscoreval;
    }
    scoreBox.innerHTML = "Score: " + score;
}

function isAvailableLocation(x, y, snake, foods) {
    // Check if the location is in the snake body
    for (let part of snake) {
        if (part.x === x && part.y === y) {
            return false;
        }
    }

    // Check if the location is in the foods array
    for (let food of foods) {
        if (food.x === x && food.y === y) {
            return false;
        }
    }

    return true;
}

 
function foodChars() {
    let a = 2;
    let b = 16;
    let x, y;

    do {
        x = Math.round(a + (b - a) * Math.random());
        y = Math.round(a + (b - a) * Math.random());
    } while (!isAvailableLocation(x, y, snakeArr, foods));

    return {x: x, y: y, letter: getRandomLetter()};
}

function gameEngine(){
    // Part 1: Updating the snake array & Food
    if(isCollide(snakeArr)){
        gameOverSound.play();
        // musicSound.pause();
        inputDir =  {x: 0, y: 0}; 
        alert("Game Over. Press any key to play again!");
        snakeArr = [{x: 13, y: 15, letter: ''}];
        foods = [
            foodChars(),
            foodChars(),
        
          ];
        let validWordsBox = document.getElementById("validWordsBox");
        validWordsBox.innerHTML = "Valid Words : ";
        // musicSound.play();
        score = 0; 
        showDifficultyModal();
    }

    // If you have eaten the food, increment the score and regenerate the food
    for (let i = 0; i < foods.length; i++) {
        let food = foods[i];
        if (snakeArr[0].y === food.y && snakeArr[0].x === food.x) {
            foodSound.play();
            increaseScore(1);
            // Add food to the snake body if it's not a '#'
            if (food.letter !== '#') {
                snakeArr.push({x: snakeArr[0].x + inputDir.x, y: snakeArr[0].y + inputDir.y, letter: food.letter});
            }
            // Shuffle snake body letters if '#' food is consumed
            if (food.letter === '#') {
                shuffleSnakeLetters();
                updateSnakeLetters();
            }
            let a = 2;
            let b = 16;
            foods[i] = foodChars();
            
            checkForValidWord();
            checkForConsecutiveLetters();
            // Generate 2 new foods
            foods.push(foodChars());
            // If the length of the foods array is greater than 10, remove 8 random elements
            if (foods.length > foodMaxThresh) {
                for (let j = 0; j < foodMaxThresh-2; j++) {
                    const randomIndex = Math.floor(Math.random() * foods.length);
                    foods.splice(randomIndex, 1);
                }
            }
        }
    }



    // Moving the snake
    for (let i = snakeArr.length - 2; i >= 0; i--) {
        snakeArr[i + 1].x = snakeArr[i].x;
        snakeArr[i + 1].y = snakeArr[i].y;
    }

    snakeArr[0].x += inputDir.x;
    snakeArr[0].y += inputDir.y;


    updateSnakeLetters();
    


    // Part 2: Display the snake and Food
    // Display the snake
    board.innerHTML = "";
    snakeArr.forEach((e, index)=>{
        let snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = e.y;
        snakeElement.style.gridColumnStart = e.x;

        if(index === 0){
            snakeElement.classList.add('head');
        }
        else{
            snakeElement.classList.add('snake');
        }
        snakeElement.textContent = e.letter;
        board.appendChild(snakeElement);
    });

    foods.forEach(food => {
        let foodElement = document.createElement('div');
        foodElement.style.gridRowStart = food.y;
        foodElement.style.gridColumnStart = food.x;
        foodElement.classList.add('food');
        foodElement.textContent = food.letter;
        board.appendChild(foodElement);

        // Display the letter score
        let scoreElement = document.createElement('div');
        scoreElement.classList.add('food-score');
        scoreElement.textContent = getLetterScore(food.letter);
        foodElement.appendChild(scoreElement);

      });
      
    hasChangedDirection = false;
      
}

// Main logic starts here
// musicSound.play();
let hiscore = localStorage.getItem("hiscore");
if(hiscore === null){
    hiscoreval = 0;
    localStorage.setItem("hiscore", JSON.stringify(hiscoreval))
}
else{
    hiscoreval = JSON.parse(hiscore);
    hiscoreBox.innerHTML = "HiScore: " + hiscore;
}

window.requestAnimationFrame(main);
window.addEventListener('keydown', e => {
    if (hasChangedDirection) {
        return;
    }
    // Check if the pressed key is an arrow key
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        hasChangedDirection = true;
        // moveSound.play();
        switch (e.key) {
            case 'ArrowUp':
                if (inputDir.y !== 1) { // Prevents moving up if currently moving down
                    console.log('ArrowUp');
                    inputDir.x = 0;
                    inputDir.y = -1;
                }
                break;

            case 'ArrowDown':
                if (inputDir.y !== -1) { // Prevents moving down if currently moving up
                    console.log('ArrowDown');
                    inputDir.x = 0;
                    inputDir.y = 1;
                }
                break;

            case 'ArrowLeft':
                if (inputDir.x !== 1) { // Prevents moving left if currently moving right
                    console.log('ArrowLeft');
                    inputDir.x = -1;
                    inputDir.y = 0;
                }
                break;

            case 'ArrowRight':
                if (inputDir.x !== -1) { // Prevents moving right if currently moving left
                    console.log('ArrowRight');
                    inputDir.x = 1;
                    inputDir.y = 0;
                }
                break;
            default:
                break;
        }
    }
    // Check if the pressed key is the spacebar
    else if (e.key === ' ') {
        e.preventDefault(); // Prevent the default action of the spacebar (scrolling)
        isPaused = !isPaused;
        if (isPaused) {
            document.getElementById('pauseBtn').innerText = 'Resume';
        } else {
            document.getElementById('pauseBtn').innerText = 'Pause';
        }
    }
});

// Add this function at the end of your JavaScript file
function selectDifficulty() {
    const easyBtn = document.getElementById('easy');
    const mediumBtn = document.getElementById('medium');
    const hardBtn = document.getElementById('hard');

    easyBtn.addEventListener('click', () => {
        speed = 4;
        hideDifficultyModal();
    });

    mediumBtn.addEventListener('click', () => {
        speed = 6;
        hideDifficultyModal();
    });

    hardBtn.addEventListener('click', () => {
        speed = 8;
        hideDifficultyModal();
    });
}

function hideDifficultyModal() {
    const difficultyModal = document.getElementById('difficultyModal');
    difficultyModal.style.display = 'none';
}

function showDifficultyModal() {
    const difficultyModal = document.getElementById('difficultyModal');
    difficultyModal.style.display = 'flex';
}


// Call the selectDifficulty function after the event listeners at the end of your JavaScript file
selectDifficulty();

document.getElementById('pauseBtn').addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
        document.getElementById('pauseBtn').innerText = 'Resume';
    } else {
        document.getElementById('pauseBtn').innerText = 'Pause';
    }
});



