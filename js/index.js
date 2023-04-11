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

let snakeArr = [
    {x: 13, y: 15, letter: getRandomLetter()}
];

let foods = [
    {x: 6, y: 7, letter: getRandomLetter()},
    {x: 10, y: 10, letter: getRandomLetter()},

  ];

// Game Functions

function getRandomLetter() {
    const alphabet = "AEIOU".repeat(5) + "BCDFGHJKLMNPQRSTVWXYZ";
    return alphabet[Math.floor(Math.random() * alphabet.length)];
}


function main(ctime) {

    window.requestAnimationFrame(main);

    if((ctime - lastPaintTime)/1000 < 1/speed){
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
            increaseScore(validWord.length);
            let validWordsBox = document.getElementById("validWordsBox");
            validWordsBox.innerHTML +=  "<br>" + validWord;
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

function increaseScore(increaseBy){
    score += increaseBy;
        if(score>hiscoreval){
            hiscoreval = score;
            localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
            hiscoreBox.innerHTML = "HiScore: "
            hiscoreval;
        }
        scoreBox.innerHTML = "Score: " + score;
}
  

function foodChars(){
    let a = 2;
    let b = 16;
    return {x: Math.round(a + (b - a) * Math.random()), y: Math.round(a + (b - a) * Math.random()), letter: getRandomLetter()}
}
function gameEngine(){
    // Part 1: Updating the snake array & Food
    if(isCollide(snakeArr)){
        gameOverSound.play();
        // musicSound.pause();
        inputDir =  {x: 0, y: 0}; 
        alert("Game Over. Press any key to play again!");
        snakeArr = [{x: 13, y: 15, letter: getRandomLetter()}];
        foods = [
            foodChars(),
            foodChars(),
        
          ];
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
            snakeArr.push({x: snakeArr[0].x + inputDir.x, y: snakeArr[0].y + inputDir.y, letter: food.letter});

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
      });
      
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
    // Check if the pressed key is an arrow key
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
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




