'use strict';
let scanner
import {items} from "./items.js";
//every item from items where finalQrCodeId is not null
const ingredients = items.filter(item => item.finalFormQrId !== null);
console.log(ingredients);

let alreadyScanned = [];


const currentOrderDiv = document.getElementById("current-order");
const commingOrderDiv = document.getElementById("comming-order"); //For testing only. remove later

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
        if (burger.addIngredientIfAvailable(ingredient)) {
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

//QR CODE

class Burger {
    constructor(ingredients, size) {
        this.ingredients = ingredients;
        this.burger = [];
        this.hasIngredients = []
        this.size = size;

        this.generateRandomBurger();
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
        for (const ingredient of this.burger) {
            burgerHtml += `<img class="ingredient" src="${ingredient.imageUrl}" alt="${ingredient.name}">`;
        }
        return burgerHtml;
    }

    addIngredientIfAvailable(ingredientToAdd) {
        for (let i = 0; i < this.burger.length; i++) {
            if (this.burger[i] == ingredientToAdd && !this.hasIngredients[i]) {
                console.log("ingredient added");
                this.hasIngredients[i] = true;

                //REMOVE SILHOUETTE CLASS from respective ingredient
                const ingredients = document.querySelectorAll(".ingredient");
                ingredients[i].classList.remove("silouhette");

                return true;
            }
        }
        return false;
    }
}

let burger = new Burger(ingredients, 8);
currentOrderDiv.innerHTML = burger.generateBurgerHtml();


//For testing only. remove later
let commingBurger = new Burger(ingredients, 5);
commingOrderDiv.innerHTML = commingBurger.generateBurgerHtml();



