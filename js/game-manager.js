'use strict';
let scanner
import {items} from "./items.js";
//every item from items where finalQrCodeId is not null
const ingredients = items.filter(item => item.finalFormQrId !== null);
console.log(ingredients);

let alreadyScanned = [];

let burgerId = 0;

const currentOrderDiv = document.getElementById("current-order");
const ordersDiv = document.getElementById("orders");

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

    if (ingredient != undefined) {
        if (burgers[0].addIngredientIfAvailable(ingredient)) {
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
        <p>------------------------</p>
        `;
        return burgerHtml;
    }

    addCommingOrder() {
        ordersDiv.innerHTML += this.generateCommingOrderHtml();
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
    setCurrentOrder() {
        currentOrderDiv.innerHTML = this.generateBurgerHtml();
        this.addSilouhetteToEveryIngredient();
        this.addHiddenClassToEveryIngredient();
        this.showNextIngredient();
    }

    addIngredientIfAvailable(ingredientToAdd) {
        if (this.nextIngredientToAdd == ingredientToAdd) {
            console.log("ingredient added");
            this.hasIngredients[this.nextIngredientToAddId] = true;

            this.removeSilouhetteFromIngredient(this.nextIngredientToAddId);
            this.nextIngredientToAddId++;
            this.showNextIngredient();
            this.isBurgerComplete();
            return true;
        }
        return false;
    }

    isBurgerComplete() {
        return this.hasIngredients.every(hasIngredient => hasIngredient);
    }        
}

let burgers = [
    new Burger(ingredients, 3),
    new Burger(ingredients, 3),
    new Burger(ingredients, 3),
    new Burger(ingredients, 3),
]

burgers[0].setCurrentOrder();
burgers[1].addCommingOrder();
burgers[2].addCommingOrder();
burgers[3].addCommingOrder();



