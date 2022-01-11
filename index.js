"use strict";


/* -- KONSTANTS -- */
/* SCRIPT CONTROL */
const SHOW_LOG = true;
const LOG_SEPARATOR = "-------------------------------------------------------";

/* GAME USER CONTROLS */
var gameAudioSoundEffectEnabled = false;    // binded to input control checkbox
var gameAudioSoundEffectLevel = 0.1;
var gameNextMoveDelay = 1000;

/* GAME ROOTS */
const GAME_SOUND_ROOT = "sounds/";
const GAME_SOUND_EXT = ".mp3";

/* GAME SELECTORS */
const HEADER_LOGO_SVG_NAME = "page__logo";
const GAME_MSG_STATUS_NAME = "game__msg--status";
const GAME_MSG_INFO_NAME = "game__msg--info"
const GAME_CONTAINER_NAME = "game__container";
const GAME_ITEM_NAME = "game__item";
const GAME_PICK_COLOR_ANIMATION_NAME = "game__pick-color";
const GAME_USER_CHOSEN_COLOR_ANIMATION_NAME = "pressed";
const GAME_OVER_HELPER_NAME = "game--over--helper"; // assign to document body

/* Global vars */
var gameHasStarted;
var level;
var gameColors;
var gameColorsLength;
var gameMoves;
var userMoves;

var isGameOver;


function updateGameMsgInfo(clear = false) {
    var gameInfoMsgContainerElement;

    var gameOverInfoMsgTextElement;
    var lastLevelMsgElement;
    var userLastMoveMsgElement;
    var userLastMoveIndex;
    var gameLastMoveMsgElement;
    
    gameInfoMsgContainerElement = document.getElementById(GAME_MSG_INFO_NAME);

    // safe guard
    if(!gameInfoMsgContainerElement) {
        if(SHOW_LOG) console.warn("-- Missing game msg element! --");
        return;
    }

    if(SHOW_LOG) console.log("Updating game msg info (container with p children)");

    gameInfoMsgContainerElement.innerText = "";

    if(clear) {
        console.log("Clearing game msg info container");
        return;
    }
    
    // append game over info text
    gameOverInfoMsgTextElement = document.createElement("p");
    gameOverInfoMsgTextElement.innerText = "Score";
    gameOverInfoMsgTextElement.style.textAlign = "center";
    gameOverInfoMsgTextElement.style.marginBottom = "16px";
    gameInfoMsgContainerElement.appendChild(gameOverInfoMsgTextElement);
    
    // append last level
    lastLevelMsgElement = document.createElement("p");
    lastLevelMsgElement.style.marginLeft = "20px";
    lastLevelMsgElement.innerText = "Level: " + level;
    gameInfoMsgContainerElement.appendChild(lastLevelMsgElement);
    
    // show last user wrong move
    userLastMoveMsgElement = document.createElement("p");
    userLastMoveMsgElement.style.marginLeft = "20px";
    userLastMoveMsgElement.style.color = "rgb(255, 0, 0)";
    
    userLastMoveIndex = userMoves.length - 1;

    userLastMoveMsgElement.innerText = "Last wrong color: " + userMoves[userLastMoveIndex];
    gameInfoMsgContainerElement.appendChild(userLastMoveMsgElement);

    // show all correct moves
    gameLastMoveMsgElement = document.createElement("p");
    gameLastMoveMsgElement.style.marginLeft = "20px";
    gameLastMoveMsgElement.innerText = "Instead of: " + gameMoves[userLastMoveIndex];
    gameInfoMsgContainerElement.appendChild(gameLastMoveMsgElement);
}

function updateGameMsgStatus() {
    var gameMsgElement;

    gameMsgElement = document.getElementById(GAME_MSG_STATUS_NAME);

    // safe guard
    if(!gameMsgElement) {
        if(SHOW_LOG) console.warn("-- Missing game msg element! --");
        return;
    }

    if(SHOW_LOG) console.log("Updating game msg status (h2)");

    if(isGameOver) {
        gameMsgElement.innerText = "Game Over, Press Any Key to Restart";
        return;
    }

    if(!gameHasStarted) {
        gameMsgElement.innerText = "Press A Key to Start";
        return;
    }

    ++level;
    gameMsgElement.innerText = "Level " + level.toString();
}

function playSound(fName) {
    var audio;

    if(!gameAudioSoundEffectEnabled) return;

    if (SHOW_LOG) console.log("Playing sound for '" + fName + "'");

    audio = new Audio(GAME_SOUND_ROOT + fName.toString() + GAME_SOUND_EXT);

    audio.volume = gameAudioSoundEffectLevel; // to bind to an input range???
    audio.play();
}

function playAnimation(element, classAnimationName) {
    if(SHOW_LOG) console.log("Playing animation for:", element);

    // add class animation
    element.classList.add(classAnimationName);

    // remove class
    setTimeout(() => {
        element.classList.remove(classAnimationName);
    }, 200);
}

function randomGameItemAnimation(randomColor) {
    var gameItemElement;
    
    gameItemElement = document.querySelector("." + GAME_CONTAINER_NAME + " ." + GAME_ITEM_NAME + "." + randomColor);

    // safe guard
    if(!gameItemElement) {
        console.warn("-- Missing game item! --");
        return;
    };

    playAnimation(gameItemElement, GAME_PICK_COLOR_ANIMATION_NAME);
}

function nextLevel() {
    var randomNumber;
    var randomColor;

    if(SHOW_LOG) {
        console.log(LOG_SEPARATOR);
        console.log("Calculating next move for level:", (level + 1));
    }

    userMoves = []; // reset user total moves

    randomNumber = Math.floor(Math.random() * gameColorsLength);
    randomColor = gameColors[randomNumber].toString();  // just in case...

    updateGameMsgStatus();

    setTimeout(() => {
        gameMoves.push(randomColor);
        
        if(SHOW_LOG) console.log("Game current moves:", gameMoves);

        playSound(randomColor);
        randomGameItemAnimation(randomColor);
    }, gameNextMoveDelay);
}

function gameOver() {
    isGameOver = true;

    if(SHOW_LOG) {
        console.log("GAME ENDEND AT:");
        console.log("|--> level:", level);
        console.log("|--> game moves:", gameMoves);
        console.log("|--> user moves:", userMoves);
        console.log(LOG_SEPARATOR);
    }
    updateGameMsgInfo();

    gameHasStarted = false;
    level = 0;
    gameMoves = [];
    userMoves = [];

    removeGameItemsHandlers();

    updateGameMsgStatus();

    playSound("wrong");
    document.body.classList.add(GAME_OVER_HELPER_NAME);

    setTimeout(() => {
        document.body.classList.remove(GAME_OVER_HELPER_NAME);

        handleRestartGame();

        isGameOver = false;

    }, 200);
}

function checkUserAnswer() {
    var currMoveIndex;
    var gameMovesLength;

    currMoveIndex = userMoves.length - 1;

    // safe guard
    if(currMoveIndex < 0) {
        console.error("-- User moves minor than 0 impossible to check answer! --");
        return;
    }

    // wrong user answer
    if(userMoves[currMoveIndex] !== gameMoves[currMoveIndex]) {
        if(SHOW_LOG) console.log("DETECTED GAME OVER!");

        gameOver();
        return;
    }

    // right user answer
    if(SHOW_LOG) console.log("RIGHT ANSWER!");

    gameMovesLength = gameMoves.length - 1;

    if(currMoveIndex === gameMovesLength) {
        console.log("To next level");
        nextLevel();
    }
}

function gameItemsClickHandler(event) {
    var userClickedItemElement;
    var userChosenColor;

    userClickedItemElement = event.target;

    userChosenColor = userClickedItemElement.dataset.gameColor.toString();

    // temp safe guard
    if(!userChosenColor) {
        console.warn("-- Failed to retrieve user chosen color! --");
        console.warn("-- Missing data-game-color attribute to game item! --");
        return;
    }

    userMoves.push(userChosenColor);

    if(SHOW_LOG) console.log("User current moves:", userMoves);

    playSound(userChosenColor);
    playAnimation(userClickedItemElement, GAME_USER_CHOSEN_COLOR_ANIMATION_NAME);

    checkUserAnswer();
}

function bindGameItemsToHandlers() {
    var gameItemsElements;
    var gameItemsElementsLength;

    gameItemsElements = document.querySelectorAll("." + GAME_CONTAINER_NAME + " ." + GAME_ITEM_NAME);

    // safe guard
    if(!gameItemsElements) {
        console.warn("-- Missing all game items! (buttons) --");
        return;
    }

    gameItemsElementsLength = gameItemsElements.length;

    // check if some buttons are missing in action!
    if(gameItemsElementsLength < gameColorsLength) {
        console.warn("-- Missing some game items! (buttons) --");
        console.warn("Keeping the game running tho!");
    }

    if(SHOW_LOG) console.log("Binding event listeners to game items");

    // bind click action
    for(let i=0; i < gameItemsElementsLength; i++)
        gameItemsElements[i].addEventListener("click", gameItemsClickHandler);
}

function removeGameItemsHandlers() {    // just a work around, but still effective
    var gameItemsElements;
    var gameItemsElementsLength;

    gameItemsElements = document.querySelectorAll("." + GAME_CONTAINER_NAME + " ." + GAME_ITEM_NAME);

    // safe guard
    if(!gameItemsElements) {
        console.warn("-- Missing all game items! (buttons) --");
        return;
    }

    gameItemsElementsLength = gameItemsElements.length;

    // check if some buttons are missing in action!
    if(gameItemsElementsLength < gameColorsLength) {
        console.warn("-- Missing some game items! (buttons) --");
        console.warn("Keeping the game running tho!");
    }

    if(SHOW_LOG) console.log("Removing event listeners from game items");

    // remove click action
    for(let i=0; i < gameItemsElementsLength; i++)
        gameItemsElements[i].removeEventListener("click", gameItemsClickHandler);
}

function startGameHandler() {
    if(SHOW_LOG) console.log("START GAME");

    gameHasStarted = true;
    document.removeEventListener("keydown", startGameHandler);

    nextLevel();
    bindGameItemsToHandlers();
}

function handleRestartGame() {
    if(SHOW_LOG) console.log("Binding restart function to document");

    // bind start game to a key press
    document.addEventListener("keydown", startGameHandler);
}

// spinning logo
function startHeaderTitleAnimation() {
    var svgElement;
    var animationTimerID;
    var svgRotateDegs;
    var deltaSvgRotateDegs;

    svgElement = document.querySelector("header ." + HEADER_LOGO_SVG_NAME);
    
    // safe guard
    if(!svgElement) {
        if(SHOW_LOG) console.warn("-- Missing header svg! --");
        return;
    }

    if(SHOW_LOG) console.log("Starting page logo spinning animation");

    svgRotateDegs = 0;
    deltaSvgRotateDegs = 90;

    animationTimerID = setInterval(() => {
        svgRotateDegs += deltaSvgRotateDegs;
        if(svgRotateDegs >= 360) svgRotateDegs = 0;
        
        svgElement.style.transform = "rotate(" + svgRotateDegs.toString() + "deg)";
    }, 1000);

    return animationTimerID;
}

// panel show animation (attach and remove class)
function showSideControlPanelHandler(sideControPanelActive) {
    var buttonElement;

    buttonElement = document.querySelector(".controls-panel__container .controls-panel--toggle-panel");
    buttonElement.addEventListener("click", () => {
        sideControPanelActive = !sideControPanelActive;

        if(sideControPanelActive) {
            document.querySelector(".controls-panel__container").classList.remove("show");
            return;
        }
            
        document.querySelector(".controls-panel__container").classList.add("show");
    });
}

// compare global audio enable to checkbox status check
function sideControlPanelAudioEffectToggleSetInitialState() {
    var inputCheckboxElement;

    inputCheckboxElement = document.querySelector(".controls-panel__container .controls-panel__content #sound-effects-toggle");

    if(gameAudioSoundEffectEnabled !== inputCheckboxElement.checked)
        inputCheckboxElement.checked = gameAudioSoundEffectEnabled;
    
    if(SHOW_LOG) console.log("Setting audio effects to:", inputCheckboxElement.checked);
}

function sideControlPanelBindAudioEffectToggle() {
    var inputCheckboxElement;

    inputCheckboxElement = document.querySelector(".controls-panel__container .controls-panel__content #sound-effects-toggle");

    function audioEffectHandler() {        
        if(inputCheckboxElement.checked !== gameAudioSoundEffectEnabled)
            gameAudioSoundEffectEnabled = inputCheckboxElement.checked;

        if(SHOW_LOG) console.log("Audio effect changed to:", gameAudioSoundEffectEnabled);
    }

    if(SHOW_LOG) console.log("Binding audio effect checkbox to change listener");
    
    inputCheckboxElement.addEventListener("change", audioEffectHandler);
}

// compare global audio level to slider curr value
function sideControlPanelAudioEffectSliderSetInitialState() {
    var inputRangeElement;

    inputRangeElement = document.querySelector(".controls-panel__container .controls-panel__content #sound-effects-slider-input");

    if(gameAudioSoundEffectLevel !== (inputRangeElement.value / 10))
        inputRangeElement.value = (gameAudioSoundEffectLevel * 10);

    if(SHOW_LOG) console.log("Setting audio level to:", gameAudioSoundEffectLevel);
}

function sideControlPanelBindAudioSliderToHandler() {
    var inputRangeElement;

    inputRangeElement = document.querySelector(".controls-panel__container .controls-panel__content #sound-effects-slider-input");
    
    function audioEffectLevelHandler() {
        if((inputRangeElement.value / 10) !== gameAudioSoundEffectLevel)
            gameAudioSoundEffectLevel = (inputRangeElement.value / 10);

        if(SHOW_LOG) console.log("Audio effect level changed to:", gameAudioSoundEffectLevel);
    }

    if(SHOW_LOG) console.log("Binding audio effect level to change listener");

    inputRangeElement.addEventListener("change", audioEffectLevelHandler);
}


function main() {
    var headerTimerAnimationID;
    var sideControPanelActive;
    
    // for page init
    headerTimerAnimationID = startHeaderTitleAnimation();
    sideControPanelActive = true;
    showSideControlPanelHandler(sideControPanelActive);
    // effect audio
    sideControlPanelAudioEffectToggleSetInitialState();
    sideControlPanelBindAudioEffectToggle();
    // effect audio slider
    sideControlPanelAudioEffectSliderSetInitialState();
    sideControlPanelBindAudioSliderToHandler();
    
    // init game vars
    gameHasStarted = false;
    level = 0;
    gameColors = [
        "green",
        "red",
        "yellow",
        "blue"
    ];
    gameColorsLength = gameColors.length;
    gameMoves = [];
    userMoves = [];

    isGameOver = false;
    
    // comunicate to the user that game is waiting for him
    updateGameMsgStatus();

    handleRestartGame();
}

main();
