'use strict';
let scanner
let game

const orderInterval = 5; //in seconds

import {items} from "./items.js";
//every item from items where finalQrCodeId is not null
const ingredients = items.filter(item => item.finalFormQrId !== null);
console.log(ingredients);

let alreadyScanned = [];

let burgerId = 0;

const CLOSED_TEXT = "CLOSED";

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
    console.log("random offset" + randomOffset);

    numberOfIngredients += randomOffset;
    return numberOfIngredients;
}

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
                this.nextIngredientToAddId++;
                this.showNextIngredient();
            }

            return true;
        }
        return false;
    }
    burgerCompleted() {
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
        this.day = day;
    
        this.scoreBoardManager = new ScoreBoardManager(this.duration);

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

        Display.displayPreGameMenu();
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
    constructor(gameDuration) {
        this.score = 0;
        this.gameDuration = gameDuration;
        this.timeLeft = 0;


        CLOSE_NOW_BUTTON.addEventListener("click", () => {
            this.endGame();
        });
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

        this.addHiddenClass(CURRENT_BURGER_DIV);
        this.addHiddenClass(CURRENT_ORDER_DIV);
        this.addHiddenClass(ORDERS_DIV);
    }

    static displayInGame() {
        this.removeHiddenClass(IN_GAME_DIV);
        this.addHiddenClass(BEFORE_GAME_MENU_DIV);

        this.removeHiddenClass(CURRENT_BURGER_DIV);
        this.removeHiddenClass(CURRENT_ORDER_DIV);
        this.removeHiddenClass(ORDERS_DIV);
    }
}

Display.displayPreGameMenu();