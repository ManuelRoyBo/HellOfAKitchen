'use strict';
let scanner
let game

const orderInterval = 20; //in seconds
const NEW_HIGHSCORE_HTML = `<b class="party-anim"> NEW HIGHSCORE!</b>`;

import {items} from "./items.js";
//every item from items where finalQrCodeId is not null
const ingredients = items.filter(item => item.finalFormQrId !== null);
console.log(ingredients);

let alreadyScanned = [];

let burgerId = 0;

const CLOSED_TEXT = "CLOSED";

/*day info*/
const DAY_INFO_DIV = document.getElementById("day-informations");
const DAY_DISPLAY_H1 = document.getElementById("day-display");
const ALL_INGREDIENTS_DIV = document.getElementById("all-ingredients");
const TUTORIAL_DIVS = document.getElementsByClassName("tutorial");
const TUTORIAL_LEFT_ARROW_IMG = document.getElementById("tutorial-left-arrow");
const TUTORIAL_RIGHT_ARROW_IMG = document.getElementById("tutorial-right-arrow");
const HIGHSCORE_H1 = document.getElementById("highscore-for-day");

/*After game infos*/
const AFTER_GAME_DIV = document.getElementById("after-game-information");
const AFTER_GAME_DAY_H1 = document.getElementById("after-game-day");
const AFTER_GAME_SCORE_H1 = document.getElementById("after-game-score");
const AFTER_GAME_HIGHSCORE_H1 = document.getElementById("after-game-highscore");
const AFTER_GAME_NEXT_BUTTON = document.getElementById("after-game-next-button");

const CURRENT_BURGER_DIV = document.getElementById("current-burger");
const ORDERS_DIV = document.getElementById("orders");
const CURRENT_ORDER_DIV = document.getElementById("current-order");

const RESTAURANT_NAME_INPUT_FIELD = document.getElementById("restaurant-name");
let restaurantName = "Manu's Burgers";
RESTAURANT_NAME_INPUT_FIELD.value = restaurantName;

const TIME_LEFT_H1 = document.getElementById("time-left");
const SCORE_H1 = document.getElementById("score");

const BEFORE_GAME_MENU_DIV = document.getElementById("before-game");
const GAME_SETTINGS_FORM = document.getElementById("game-settings");
const IN_GAME_DIV = document.getElementById("in-game");
const CLOSE_NOW_BUTTON = document.getElementById("stop-game");

/*audio*/
const BELL_SFX = new Audio("sound/bell.mp3");
const REGISTER_SFX = new Audio("sound/register.mp3");
const GOOD_ITEM_SFX = new Audio("sound/good-item.wav");

let qrboxFunction = function(viewfinderWidth, viewfinderHeight) {
    let minEdgePercentage = 0.90; // 70%
    let qrboxSizeWidth = viewfinderWidth * minEdgePercentage;
    let qrboxSizeHeight = viewfinderHeight * minEdgePercentage;
    return {
        width: qrboxSizeWidth,
        height: qrboxSizeHeight
    };
  }
  
  function newScanner() {
      scanner = new Html5QrcodeScanner('reader', { 
          // Scanner will be initialized in DOM inside element with id of 'reader'
          qrbox: qrboxFunction,  // Sets dimensions of scanning box (set relative to reader element width)
          fps: 20, // Frames per second to attempt a scan
      });
    scanner.render(success, error);
  }
newScanner();

function success(result) {
    console.log(result + " scanned");
    if (alreadyScanned.includes(result)) {return;}

    const id = result.slice(0, 2);
    

    //get the ingredient with the id from the ingredients list
    const ingredient = ingredients.find(ingredient => ingredient.finalFormQrId === id);

    if (ingredient != undefined ) {
        if (game.burgers[0].addIngredientIfAvailable(ingredient)) {
            alreadyScanned.push(result);
        }
    }
        

}

function error(err) {
    //quand ca ne scan pas
}

function getBurgerId() {
    burgerId++;
    return burgerId;
} 

RESTAURANT_NAME_INPUT_FIELD.addEventListener("change", () => {
    restaurantName = RESTAURANT_NAME_INPUT_FIELD.value;
});

/*Pre game menu*/
GAME_SETTINGS_FORM.addEventListener('submit', (event) => {
    event.preventDefault(); // prevent the form from submitting
  
    const formData = new FormData(GAME_SETTINGS_FORM);

    /*convert time to seconds*/
    function timeToSeconds(value) {
        const [minutes, seconds] = value.split(':');
        return (parseInt(minutes) * 60) + (parseInt(seconds));
      }

    const playerCount = formData.get('player-count');
    const day = formData.get('day');
    const duration = timeToSeconds(formData.get('day-duration'));

    game = new Game(duration, day ,playerCount);
    console.log(game);
    game.startGame();
  });

const DAYS_UNTIL_ADD_NEW_INGREDIENT = 3;
const ADD_RANDOM_INGREDIENT_PERCENTAGE = 0.25;
function generateNumberOfIngredientsPerBurger(day, playerCount) {
    let numberOfIngredients = Math.floor((day/DAYS_UNTIL_ADD_NEW_INGREDIENT) + 1.5 + (playerCount/2));

    let randomOffset = Math.round((Math.random() * 2 - 1) * ADD_RANDOM_INGREDIENT_PERCENTAGE * numberOfIngredients);

    numberOfIngredients += randomOffset;
    return numberOfIngredients;
}

function addClassToElement(classString, element) {
    if (!element.classList.contains(classString)) {
        element.classList.add(classString);
    }
}

function removeClassFromElement(classString, element) {
    if (element.classList.contains(classString)) {
        element.classList.remove(classString);
    }
}

// Read from localStorage and convert to Highscore Class list
// Read from localStorage and convert to Highscore Class
function readHighscoreFromLocalStorage(day) {
    const highscores = JSON.parse(localStorage.getItem('highscores')) || [];
    const existingHighscore = highscores.find(highscore => highscore.day === day);
    if (existingHighscore) {
      return new Highscore(existingHighscore.day, existingHighscore.score);
    } else {
      const newHighscore = new Highscore(day, 0);
      highscores.push(newHighscore);
      localStorage.setItem('highscores', JSON.stringify(highscores));
      return newHighscore;
    }
  }

// Write Highscore Class list to localStorage
// Write Highscore Class list to localStorage
function writeHighscoreToLocalStorage(score, day) {
    const highscores = JSON.parse(localStorage.getItem('highscores')) || [];
    //Get the highscore for the current day
    const existingHighscore = highscores.find(highscore => highscore.day === day);
    if (existingHighscore) {
        if (score > existingHighscore.score) {
            existingHighscore.score = score;
        }
    } 
    else {
        const newHighscore = new Highscore(day, score);
        highscores.push(newHighscore);
    }
    localStorage.setItem('highscores', JSON.stringify(highscores));
}

function updateEndOfGameScreen(day, score, highscore, isNewHighscore) {
    
    AFTER_GAME_DAY_H1.innerHTML = `Day ${day}`;
    AFTER_GAME_SCORE_H1.innerHTML = `Score: ${score}`;

    let highscoreText = `highscore: ${highscore}`;
    if (isNewHighscore == true) {
        highscoreText += NEW_HIGHSCORE_HTML;
    }

    AFTER_GAME_HIGHSCORE_H1.innerHTML = highscoreText;
}

AFTER_GAME_NEXT_BUTTON.addEventListener("click", () => {
    Display.displayPreGameMenu();
});

const MAX_INGREDIENTS_PER_BURGER = 6;
class Burger {
    constructor(ingredients, size) {
        this.ingredients = ingredients;
        this.burger = [];
        this.hasIngredients = []
        
        if (size > MAX_INGREDIENTS_PER_BURGER) {
            size = MAX_INGREDIENTS_PER_BURGER;
        }
        this.size = size;
        this.scoreYield = 0;
        this.burgerId = getBurgerId();
        this.generateRandomBurger();
        this.nextIngredientToAdd = null;
        this.nextIngredientToAddId = 0;
    }

    setSize(size) {
        this.size = size;
    }

    setIngredients(ingredients) {
        this.ingredients = ingredients;
    }

    generateRandomBurger() {
        let burger = [];
        for (let i = 0; i < this.size; i++) {
            let randomIngredient = this.ingredients[Math.floor(Math.random() * this.ingredients.length)];
            burger.push(randomIngredient);
            this.scoreYield += randomIngredient.pointsOnceCompleted;
        }
        this.burger = burger;
        this.hasIngredients = new Array(this.size).fill(false);
    }

    generateBurgerHtml() {
        let burgerHtml = "";
        for (let i = 0; i < this.burger.length; i++) {
            let ingredient = this.burger[i];
            burgerHtml += `<img class="ingredient" id="${this.burgerId}-${i}" src="${ingredient.imageUrl}" alt="${ingredient.name}">`;
        }
        return burgerHtml;
    }

    generateCommingOrderHtml() {
        let burgerHtml = /*html*/`
        <div class="order" id="burger${this.burgerId}">
            <h2>${restaurantName}</h2>
            <p>------------------------</p>
            <div class="comming-order"> 
        `;
        burgerHtml += this.generateBurgerHtml();

        burgerHtml += /*html*/`
        </div>
        `;
        return burgerHtml;
    }

    addCommingOrder() {
        BELL_SFX.play();
        const ordersDiv = document.getElementById("orders");
        ordersDiv.insertAdjacentHTML("beforeend", this.generateCommingOrderHtml());
    }

    removeCommingOrder() {
        const order = document.getElementById(`burger${this.burgerId}`);
        order.remove();
    }


    addSilouhetteToEveryIngredient() {
        //get all ingredients with the id of the burger
        const ingredients = document.querySelectorAll(`[id^="${this.burgerId}-"]`);
        ingredients.forEach(ingredient => {
            ingredient.classList.add("silouhette");
        });
    }

    removeSilouhetteFromIngredient(ingredientId) {
        const ingredient = document.getElementById(this.burgerId+"-"+ingredientId);
        ingredient.classList.remove("silouhette");
    }

    addHiddenClassToEveryIngredient() {
        const ingredients = document.querySelectorAll(`[id^="${this.burgerId}-"]`);
        ingredients.forEach(ingredient => {
            ingredient.classList.add("hidden");
        });
    }

    removeHiddenClassFromIngredient(ingredientId) {
        const ingredient = document.getElementById(this.burgerId+"-"+ingredientId);
        ingredient.classList.remove("hidden");
    }   

    showNextIngredient() {
        this.removeHiddenClassFromIngredient(this.nextIngredientToAddId);
        this.nextIngredientToAdd = this.burger[this.nextIngredientToAddId];
    }


    //Game stuff
    setCurrentBurger() {
        CURRENT_BURGER_DIV.innerHTML = this.generateBurgerHtml();
        this.addSilouhetteToEveryIngredient();
        this.addHiddenClassToEveryIngredient();
        this.showNextIngredient();

        this.setCurrentOrder();
    }

    setCurrentOrder() {
        CURRENT_ORDER_DIV.innerHTML = /*html*/`<h1 class="vertical-text no-margin white-text">Current order:</h1>` + this.generateCommingOrderHtml();
    }

    addIngredientIfAvailable(ingredientToAdd) {
        if (this.nextIngredientToAdd == ingredientToAdd) {
            this.hasIngredients[this.nextIngredientToAddId] = true;

            this.removeSilouhetteFromIngredient(this.nextIngredientToAddId);
            if (this.hasIngredients.every(hasIngredient => hasIngredient)){
                this.burgerCompleted();
            }
            else {
                GOOD_ITEM_SFX.play();
                this.nextIngredientToAddId++;
                this.showNextIngredient();
            }

            return true;
        }
        return false;
    }
    burgerCompleted() {
        REGISTER_SFX.play();
        const event = new CustomEvent('burgerCompleted', { detail: this });
        document.dispatchEvent(event);
    }
}

//Game variables
const MAX_ORDERS = 4;
class Game {
    constructor(duration, day, playerCount = 1) {
        this.duration = duration; //Game duration in seconds
        this.burgers = [];
        this.completedBurgers = [];
        this.playerCount = playerCount;
        this.intervalId = null;
        this.day = parseInt(day);
    
        this.scoreBoardManager = new ScoreBoardManager(this.duration, this.day);

        this.score = 0;
    }

    startGame() {
        Display.displayInGame();7

        this.scoreBoardManager.setScore(this.score);
        this.addOrderIfCan();

        this.intervalId = setInterval(() => {
            this.addOrderIfCan();
        }, this.getIntervalDuration() * 1000); 
        
        this.scoreBoardManager.startTimer(this.duration);

        document.addEventListener('gameFinished', event => {
            this.score = event.detail;
            this.endGame();
        });

        document.addEventListener('burgerCompleted', event => {
            const completedBurger = event.detail;
            this.burgerCompleted(completedBurger);
        });
    }

    getIntervalDuration() {
        const baseDuration = orderInterval;
        const randomOffset = Math.random() * 2 - 1;
        return baseDuration + randomOffset; 
    }

    addBurger(burger) {
        this.burgers.push(burger);
        burger.addCommingOrder();
    }

    burgerCompleted(burger) {
        this.completedBurgers.push(burger);
        this.scoreBoardManager.addScore(burger.scoreYield);

        const index = this.burgers.indexOf(burger);
        if (index !== -1) {
            this.burgers.splice(index, 1);
            this.completedBurgers.push(burger);
        }
        this.updateOrderVisuals();
    }
    
    generateRandomBurger() {
        let burger = new Burger(ingredients, generateNumberOfIngredientsPerBurger(this.day, this.playerCount));
        return burger;
    }

    addOrderIfCan() {
        if (this.burgers.length < MAX_ORDERS) {
            this.addBurger(this.generateRandomBurger());
            this.updateOrderVisuals();
        }
    }

    endGame() {
        clearInterval(this.intervalId);

        //removes all burgers
        this.burgers = [];
        this.updateOrderVisuals();
        Display.displayAfterGame();
    }

    updateOrderVisuals() {
        let currentOrder = CURRENT_ORDER_DIV.querySelector(".order");
        if (this.burgers.length > 0) {
            let firstIngredient = CURRENT_BURGER_DIV.querySelector(".ingredient");
            if (firstIngredient == undefined || firstIngredient.id.split("-")[0] != this.burgers[0].burgerId) {
                this.burgers[0].setCurrentBurger();
            }
        }
        else if (currentOrder != undefined) {
            currentOrder.remove();
            CURRENT_BURGER_DIV.innerHTML = "";
        }
        
        const orders = document.querySelectorAll("#orders .order");
        orders.forEach(order => {
            const orderId = order.id.replace(/burger/g, "");
            const burger = this.burgers.find(burger => burger.burgerId == orderId);
            if (burger == undefined || burger == this.burgers[0]) {
                order.remove();
            }
        });

        this.burgers.forEach(burger => {
            const order = document.getElementById(`burger${burger.burgerId}`);
            if (order == undefined) {
                burger.addCommingOrder();
            }
        });
    }
}

class ScoreBoardManager {
    constructor(gameDuration, day) {
        this.score = 0;
        this.gameDuration = gameDuration;
        this.timeLeft = 0;
        this.day = day;


        CLOSE_NOW_BUTTON.addEventListener("click", this.endGame.bind(this), {once: true});
    }

    setScore(score) {
        SCORE_H1.textContent = score;
    }

    addScore(value) {
        this.score += value;
        this.setScore(this.score);
    }

    setTimeLeft(timeLeft) {
        this.timeLeft = timeLeft;
        this.updateTimerVisuals();
    }

    startTimer() {
        this.setTimeLeft(this.gameDuration);
        this.intervalId = setInterval(() => {
            this.setTimeLeft(this.timeLeft - 1);
            if(this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    convertSecondsToMinutesAndSeconds(seconds) {
        let minutes = Math.floor(seconds / 60);
        let secondsLeft = seconds - minutes * 60;
        if (secondsLeft < 10) {
            secondsLeft = "0" + secondsLeft;
        }
        return `${minutes}:${secondsLeft}`;
    }

    updateTimerVisuals() {
        if (this.timeLeft > 0) {
            TIME_LEFT_H1.textContent = this.convertSecondsToMinutesAndSeconds(this.timeLeft); 
        }
        else {
            TIME_LEFT_H1.textContent = CLOSED_TEXT;
        }
    }

    endGame() {

        clearInterval(this.intervalId);
        this.updateTimerVisuals();

        let highscore = readHighscoreFromLocalStorage(this.day);
        updateEndOfGameScreen(this.day, this.score, highscore.score, false);
        if (this.score > highscore.score) {
            highscore.score = this.score;
            writeHighscoreToLocalStorage(highscore.score, this.day);
            updateEndOfGameScreen(this.day, this.score, highscore.score, true);
        }
        

        const event = new CustomEvent('gameFinished', { detail: this.score });
        document.dispatchEvent(event);
    }



}

class Display {

    static addHiddenClass(element) {
        if (!element.classList.contains("hidden")) {
            element.classList.add("hidden");
        }
    }

    static removeHiddenClass(element) {
        if (element.classList.contains("hidden")) {
            element.classList.remove("hidden");
        }
    }

    static displayPreGameMenu() {
        this.removeHiddenClass(BEFORE_GAME_MENU_DIV);
        this.addHiddenClass(IN_GAME_DIV);
        this.addHiddenClass(AFTER_GAME_DIV);

        this.removeHiddenClass(DAY_INFO_DIV);

        this.addHiddenClass(CURRENT_BURGER_DIV);
        this.addHiddenClass(CURRENT_ORDER_DIV);
        this.addHiddenClass(ORDERS_DIV);

        dayInfo.currentDayUpdate();
    }

    static displayInGame() {
        this.removeHiddenClass(IN_GAME_DIV);
        this.addHiddenClass(BEFORE_GAME_MENU_DIV);
        this.addHiddenClass(AFTER_GAME_DIV);

        this.addHiddenClass(DAY_INFO_DIV);

        this.removeHiddenClass(CURRENT_BURGER_DIV);
        this.removeHiddenClass(CURRENT_ORDER_DIV);
        this.removeHiddenClass(ORDERS_DIV);
    }

    static displayAfterGame() {
        
        this.addHiddenClass(IN_GAME_DIV);
        this.addHiddenClass(BEFORE_GAME_MENU_DIV);

        this.addHiddenClass(DAY_INFO_DIV);

        this.addHiddenClass(CURRENT_BURGER_DIV);
        this.addHiddenClass(CURRENT_ORDER_DIV);
        this.addHiddenClass(ORDERS_DIV);

        this.removeHiddenClass(AFTER_GAME_DIV);
    }


}

class DayInfo {
    constructor() {

        this.tutorials = [];

        class Tutorial {
            constructor(div, day) {
                this.day = day;
                this.div = div;
            }

            hide() {
                Display.addHiddenClass(this.div);
            }

            show() {
                Display.removeHiddenClass(this.div);
            }
        }

        for (let tutorialDiv of TUTORIAL_DIVS) {
            const day = tutorialDiv.id.replace(/tutorial-day-/g, "");
            this.tutorials.push(new Tutorial(tutorialDiv, day));
        }

        this.day = 1;
        this.page = 1;
        this.maxPage = 1;
        const currentDayDiv = document.getElementById("day");
        currentDayDiv.addEventListener("change", () => {
            this.day = currentDayDiv.value;
            this.currentDayUpdate();
        });

        TUTORIAL_LEFT_ARROW_IMG.addEventListener("click", () => {
            this.previousPage();
        });

        TUTORIAL_RIGHT_ARROW_IMG.addEventListener("click", () => {
            this.nextPage();
        });

        ingredients.forEach(ingredient => {
            ALL_INGREDIENTS_DIV.innerHTML += `<img src="${ingredient.imageUrl}"/>`;
        });

        this.currentDayUpdate();
    }

    currentDayUpdate(){
        DAY_DISPLAY_H1.textContent = `Day ${this.day}`;
        
        for(let i = 0; i < ingredients.length; i++){
            if(ingredients[i].unlockAtDay <= this.day){
                removeClassFromElement("silouhette", ALL_INGREDIENTS_DIV.children[i]);
            }
            else{
                addClassToElement("silouhette", ALL_INGREDIENTS_DIV.children[i]);
            }
        }
        this.findMaxPage();
        this.updatePage();
        this.updateHighscore();
        
    }

    findMaxPage() {
        this.maxPage = 0;
        this.tutorials.forEach(tutorial => {
            if (tutorial.day <= this.day) {
                this.maxPage++;
            }
        });
    }

    displayButtons() {
        if (this.page <= 1) {
            Display.addHiddenClass(TUTORIAL_LEFT_ARROW_IMG);
        }
        else {
            Display.removeHiddenClass(TUTORIAL_LEFT_ARROW_IMG);
        }

        if (this.page >= this.maxPage) {
            Display.addHiddenClass(TUTORIAL_RIGHT_ARROW_IMG);
        }
        else {
            Display.removeHiddenClass(TUTORIAL_RIGHT_ARROW_IMG);
        }
    }

    nextPage() {
        if (this.page < this.maxPage) {
            this.page++;
            this.updatePage();
        }
    }

    previousPage() {
        if (this.page > 1) {
            this.page--;
            this.updatePage();
        }
    }

    updatePage() {
        //hide all tutorials
        for (let i = 0; i < this.tutorials.length; i++) {
            if (i+1 == this.page){
                this.tutorials[i].show();
            }
            else{
                this.tutorials[i].hide();
            }
        }
        this.displayButtons();
    }

    updateHighscore() {
        let highscore = readHighscoreFromLocalStorage(parseInt(this.day));
        HIGHSCORE_H1.textContent = `Highscore: ${highscore.score}`;
    }

}

class Highscore {
    constructor(day, score) {
        if (typeof day !== 'number' || typeof score !== 'number') {
            throw new Error('Day and score must be numbers');
        }
        this.day = day;
        this.score = score;
    }
}

const dayInfo = new DayInfo();
Display.displayPreGameMenu();