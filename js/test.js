/*
function onScanSuccess(decodedText, decodedResult) {
    // handle the scanned code as you like, for example:
    console.log(`Code matched = ${decodedText}`, decodedResult);
  }
  
  function onScanFailure(error) {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
    console.warn(`Code scan error = ${error}`);
  }
  
let html5QrcodeScanner = new Html5QrcodeScanner(
"reader",
{ fps: 10, qrbox: {width: 250, height: 250} },
false);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);
*/

let scanner;
let currentItem = null;
let currentProcess = null;
let cutting

let qrCodeDiv = document.getElementById("qr-code");
let qrCode = new QRCode(qrCodeDiv, "");

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

let qrboxFunction = function(viewfinderWidth, viewfinderHeight) {
  let minEdgePercentage = 0.90;
  let qrboxSizeWidth = viewfinderWidth * minEdgePercentage;
  let qrboxSizeHeight = viewfinderHeight * minEdgePercentage;
  return {
      width: qrboxSizeWidth,
      height: qrboxSizeHeight
  };
}

function newScanner() {

    let qrbox = qrboxFunction;

    scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 1, qrbox: qrbox },
    /* verbose= */ false);
    scanner.render(success, error);
}

function newScannerIfNotExists() {
  try {
    if (scanner.getState() != 2) { //2 is scanning
      newScanner();
    }
  } catch (error) {
    newScanner();
  }
}

function success(result) {
  console.log(result + " scanned");

let textP = document.getElementById("text");
textP.textContent = result;

  if (result === "cutting-board" && currentItem !== null && currentItem.cutEquivalent !== null && currentProcess !== cuttingBoard)   {
    endAllProcesses();
    cuttingBoard.start();
    currentProcess = cuttingBoard;
    return;
  }

  if (result === "grill" && currentItem !== null && currentItem.grilledEquivalent !== null && currentProcess !== grill) {
    endAllProcesses();
    grill.start();
    currentProcess = grill;
    return;
  }

  for (const item of items) {
    if (item.qrCodeId === result && (currentItem === null || currentItem.qrCodeId !== result)) {
      currentItem = item;
      displayItemInfo(item);
      Game.displayItemScreen();
      return;
    }
  }
}

function displayItemInfo(item) {

  itemNameElement.textContent = item.itemName;
  itemDescriptionElement.textContent = item.description; // Use the item's description here
  itemImageElement.src = item.imageUrl;
}

function error(err) {} //Qr scan didn't find anything

//trash

function trashItem() {
  currentItem = null;
  currentProcess = null;
  endAllProcesses();
  Game.displayStartScreen();
}

function endAllProcesses() {
  cuttingBoard.end();
  grill.end();
}

class CuttingBoard {
  constructor() {

  }

  start() {
    Game.displayCuttingBoardScreen();
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
      this.cutSuccess();
    }
  }

  cutSuccess() {
    currentItem = currentItem.cutEquivalent;
    this.end();
    displayItemInfo(currentItem);
    Game.displayItemOrGiveScreen();
  }
}

class Grill {
  constructor() {

    this.cookSpeed = 9; // i/s

    //set primarySideCookSPeed to a random number 0.9-1.2
    this.primarySideCookSpeed = 0.9 + Math.random() * 0.3;
    this.secondarySideCookSpeed = 1.5 - this.primarySideCookSpeed; // percentage of cooikSpeed
    
    this.isFliped = false;
    this.sideOneProgress = 0;
    this.sideTwoProgress = 0;

    this.isOn = false;
    this.intervalId = null;
  }

  start() {
    this.sideOneProgress = 0;
    this.sideTwoProgress = 0;
    this.isOn = true;
    this.intervalId = setInterval(() => this.cook(), 1000 / this.cookSpeed);
    Game.displayGrillScreen();
  }

  end() {
    this.isOn = false;
    clearInterval(this.intervalId);
  }

  cook() {
    //will be called every iteration
    if (!this.isOn) return;

    if (!this.isFliped) {
      this.sideOneProgress += this.primarySideCookSpeed;
      this.sideTwoProgress += this.secondarySideCookSpeed;
    }
    else {
      this.sideOneProgress += this.secondarySideCookSpeed;
      this.sideTwoProgress += this.primarySideCookSpeed;
    }

    this.updateVisuals();

    if (this.sideOneProgress >= 100 && this.sideTwoProgress >= 100) {
      this.grillSuccess();
    }

  }

  updateVisuals() {
    grillProgressbarSide1.value = this.sideOneProgress;
    grillProgressbarSide2.value = this.sideTwoProgress;

    grillProgressSide1.textContent = Math.round(this.sideOneProgress) + "%";
    grillProgressSide2.textContent = Math.round(this.sideTwoProgress) + "%";
  }

  flip() {
    this.isFliped = !this.isFliped;
  }

  grillSuccess() {
    currentItem = currentItem.grilledEquivalent;
    this.end();
    displayItemInfo(currentItem);
    Game.displayItemOrGiveScreen();
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
    this.hideProcesses();

    Game.hideProcesses();
    newScannerIfNotExists();
    
  }
  static displayItemScreen() {
    this.hideProcesses();

    newScannerIfNotExists();
  }
  static displayCuttingBoardScreen() {
    this.hideProcesses();



    scanner.clear();
  }

  static displayGrillScreen() {
    this.hideProcesses();


    try{scanner.clear();}
    catch(error){}
  }

  static displayGiveItemScreen() {
    this.hideProcesses();
    generateUniqueQrCode(currentItem.finalFormQrId);


    try{scanner.clear();}
    catch(error){}
  }

  static hideProcesses() {
  }

  static displayItemOrGiveScreen() {
    console.log(currentItem);
    if (currentItem.finalFormQrId !== null) {
      Game.displayGiveItemScreen();
    } else {
      Game.displayItemScreen();
    }
  }

}

//Code
const cuttingBoard = new CuttingBoard();
const grill = new Grill();
Game.displayStartScreen();