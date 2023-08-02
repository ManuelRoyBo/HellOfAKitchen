'use strict';
let scanner

const orderInterval = 5; //in seconds

import {items} from "./items.js";
//every item from items where finalQrCodeId is not null
const ingredients = items.filter(item => item.finalFormQrId !== null);
console.log(ingredients);

let alreadyScanned = [];

let burgerId = 0;

const currentBurgerDiv = document.getElementById("current-burger");
const ordersDiv = document.getElementById("orders");
const currentOrderDiv = document.getElementById("current-order");

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

function compareObjects(object1, object2) {
    return JSON.stringify(object1) === JSON.stringify(object2);
}

function getBurgerId() {
    burgerId++;
    return burgerId;
} 

//QR CODE

class Burger {
    constructor(ingredients, size) {
        this.ingredients = ingredients;
        this.burger = [];
        this.hasIngredients = []
        this.size = size;
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
        }
        this.burger = burger;
        //create array list the size of the burger. all false
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
            <h2>Manu's Burger</h2>
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
        //get all ingredients with the id of the burger
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
        console.log("setCurrentBurger");
        currentBurgerDiv.innerHTML = this.generateBurgerHtml();
        this.addSilouhetteToEveryIngredient();
        this.addHiddenClassToEveryIngredient();
        this.showNextIngredient();

        this.setCurrentOrder();
    }

    setCurrentOrder() {
        currentOrderDiv.innerHTML = /*html*/`<h1 class="vertical-text no-margin white-text">Current order:</h1>` + this.generateCommingOrderHtml();
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
const maxOrders = 4;
class Game {
    constructor(duration, difficulty = 1, playerCount = 1) {
        this.duration = duration; //Game duration in seconds
        this.burgers = [];
        this.completedBurgers = [];
        this.difficulty = difficulty;
        this.playerCount = playerCount;
        this.intervalId = null; // Store the interval ID for later use
    }

    startGame() {
        console.log("game started");

        this.addOrderIfCan();

        this.intervalId = setInterval(() => {
            this.addOrderIfCan();
        }, this.getIntervalDuration() * 1000); // Call the getIntervalDuration() method to get the interval duration
        setTimeout(() => {
            this.endGame();
        }, this.duration * 1000);

        document.addEventListener('burgerCompleted', event => {
            const completedBurger = event.detail;
            this.burgerCompleted(completedBurger);
        });
    }

    getIntervalDuration() {
        const baseDuration = orderInterval / /*this.difficulty / */  this.playerCount;
        const randomOffset = Math.random() * 2 - 1;
        return baseDuration + randomOffset; 
    }

    addBurger(burger) {
        this.burgers.push(burger);
        burger.addCommingOrder();
    }

    burgerCompleted(burger) {
        this.removeBurger(burger);
        this.completedBurgers.push(burger);
    }

    removeBurger(burger) {
        const index = this.burgers.indexOf(burger);
        if (index !== -1) {
            this.burgers.splice(index, 1);
            this.completedBurgers.push(burger);
        }
        this.updateOrderVisuals();
    }
    
    generateRandomBurger() {
        let burger = new Burger(ingredients, this.difficulty);
        return burger;
    }

    addOrderIfCan() {
        console.log("addOrderIfCan");
        if (this.burgers.length < maxOrders) {
            this.addBurger(this.generateRandomBurger());
            this.updateOrderVisuals();
        }
        else {
            console.log("couldn't add order");
        }
    }

    endGame() {
        clearInterval(this.intervalId);
    }

    updateOrderVisuals() {
        if (this.burgers.length > 0) {
            //select first instance of .ingredient class
            let firstIngredient = currentBurgerDiv.querySelector(".ingredient");
            if (firstIngredient == undefined || firstIngredient.id.split("-")[0] != this.burgers[0].burgerId) {
                this.burgers[0].setCurrentBurger();
            }
        }
        
        //get all orders
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

let game = new Game(600, 2, 1);
game.startGame();


