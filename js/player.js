"use strict";
import {items} from "./items.js";
console.log(items);

let scanner;
let currentItem = null;
let currentProcess = null;
let cutting

let qrCodeDiv = document.getElementById("qr-code");
let qrCode = new QRCode(qrCodeDiv, "");

const trashDiv = document.getElementById("trash");
const cuttingBoardDiv = document.getElementById("cutting-board");
const cuttingBoardProgressbar = document.getElementById("cutting-board-progress-bar");
const itemDiv = document.getElementById("item");

function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if(d > 0){//Use timestamp until depleted
          r = (d + r)%16 | 0;
          d = Math.floor(d/16);
      } else {//Use microseconds since page-load if supported
          r = (d2 + r)%16 | 0;
          d2 = Math.floor(d2/16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function generateUniqueQrCode(content) {
  let uuid = generateUUID();
  qrCode.makeCode(content+uuid);
}

function newScanner() {
    scanner = new Html5QrcodeScanner('reader', { 
        // Scanner will be initialized in DOM inside element with id of 'reader'
        qrbox: {
            width: 400,
            height: 400,
        },  // Sets dimensions of scanning box (set relative to reader element width)
        fps: 20, // Frames per second to attempt a scan
    });

  scanner.render(success, error);
}



function success(result) {
  // Check if the result matches any item's qrCodeId
  
  
  console.log(result + " scanned");

  if (result === "cutting-board" && currentItem !== null && currentItem.cutEquivalent !== null) {
    currentProcess = cuttingBoard;
    cuttingBoard.start();
    Game.displayCuttingBoardScreen();
    return;
  }

  else {
    for (const item of items) {
      if (item.qrCodeId === result) {
        currentItem = item;
        displayItemInfo(item);
        return;
      }
    }
  }
  
}

function displayItemInfo(item) {
  const itemNameElement = itemDiv.querySelector("h1");
  const itemDescriptionElement = itemDiv.querySelector(".description");
  const itemImageElement = itemDiv.querySelector("img");

  itemNameElement.textContent = item.itemName;
  itemDescriptionElement.textContent = item.description; // Use the item's description here
  itemImageElement.src = item.imageUrl;

  Utility.showIfHidden(itemDiv);
}


function error(err) {} //Qr scan didn't find anything


//trash
const trashButton = document.getElementById("trash-button");
trashButton.addEventListener("click", trashItem);

function trashItem() {
  currentItem = null;
  currentProcess = null;
  cuttingBoard.end();
  Game.displayStartScreen();
}

class CuttingBoard {
  constructor() {
    this.itemImg = itemDiv.querySelector("img");
    this.itemImg.addEventListener("click", () => this.cutItem());

  }

  start() {
    this.isOn = true;
    this.maxProgress = 10;
    cuttingBoardProgressbar.max = this.maxProgress;
    this.progress = 0;
    this.setProgress();
  }

  end() {
    this.isOn = false;
  }

  setProgress() {
    cuttingBoardProgressbar.value = this.progress;
  }

  cutItem() {
    if(!this.isOn) return;
    this.progress += 1;
    this.setProgress();

    if (this.progress >= this.maxProgress) {
      currentItem = currentItem.cutEquivalent;
      this.end();
      this.cutSuccess();
    }
  }

  cutSuccess() {
    displayItemInfo(currentItem);

    if (this.progress >= this.maxProgress) {
      if (currentItem.finalFormQrId != null) {
        Game.displayGiveItemScreen();
      } else {
        Game.displayItemScreen();
      }
    }
  }
}


class Utility {
  static hideIfNotHidden(element) {
    if (!element.classList.contains("hidden")) {
      element.classList.add("hidden");
    }
  }

  static showIfHidden(element) {
    if (element.classList.contains("hidden")) {
      element.classList.remove("hidden");
    }
  }
}


class Game {
  static displayStartScreen() {
    Utility.hideIfNotHidden(trashDiv);
    Utility.hideIfNotHidden(cuttingBoardDiv);
    Utility.hideIfNotHidden(qrCodeDiv);
    Utility.hideIfNotHidden(itemDiv);

    newScanner();
  }
  static displayItemScreen() {
    Utility.showIfHidden(trashDiv);
    Utility.hideIfNotHidden(cuttingBoardDiv);
    Utility.hideIfNotHidden(qrCodeDiv);
  }

  static displayCuttingBoardScreen() {
    Utility.showIfHidden(trashDiv);
    Utility.showIfHidden(cuttingBoardDiv);
    Utility.hideIfNotHidden(qrCodeDiv);

    scanner.clear();
  }

  static displayGiveItemScreen() {
    generateUniqueQrCode(currentItem.finalFormQrId);

    Utility.showIfHidden(trashDiv);
    Utility.hideIfNotHidden(cuttingBoardDiv);
    Utility.showIfHidden(qrCodeDiv);

    scanner.clear();
  }
}

//Code
const cuttingBoard = new CuttingBoard();
Game.displayStartScreen();