export class Item {
    constructor(itemName, description, imageUrl, qrCodeId = null, cutEquivalent = null, grilledEquivalent = null, finalFormQrId = null, oddsOfBeingInABurger = null) {
      this.itemName = itemName;
      this.description = description;
      this.imageUrl = imageUrl;
      this.qrCodeId = qrCodeId;
      this.cutEquivalent = cutEquivalent;
      this.grilledEquivalent = grilledEquivalent;
      this.finalFormQrId = finalFormQrId;
    }
  }
  
const cutLettuce = new Item(
    "Cut lettuce",
    "A piece of cut lettuce.",
    "img/lettuce-leaf.svg",
    null,
    null,
    null,
    "CL",
    0.5
);

const lettuce = new Item(
    "Lettuce",
    "A piece of lettuce.",
    "img/lettuce.svg",
    "IL",
    cutLettuce
);

const cutTomato = new Item(
    "Sliced tomato",
    "A piece of cut tomato.",
    "img/sliced-tomato.svg",
    null,
    null,
    null,
    "CT",
    0.5
);

const tomato = new Item(
    "Tomato",
    "A juicy red ball thingy.",
    "img/tomato.svg",
    "tomato",
    cutTomato,
);

const cookedGroundBeef = new Item(
    "Cooked ground beef",
    "Very tasty.",
    "img/cooked-ground-beef.jpg",
    null,
    null,
    null,
    "CGB",
    0.9
);

const groundBeef = new Item(
    "Ground beef",
    "Can be grilled.",
    "img/ground-beef.png",
    null,
    null,
    cookedGroundBeef,
);

const beef = new Item(
    "Beef",
    "Can be cut.",
    "img/beef.svg",
    "beef",
    groundBeef,
);
  
export const items = [lettuce, cutLettuce, tomato, cutTomato, beef, groundBeef, cookedGroundBeef];
  