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
    "img/items/lettuce-leaf.svg",
    null,
    null,
    null,
    "CL",
    0.5
);

const lettuce = new Item(
    "Lettuce",
    "A piece of lettuce.",
    "img/items/lettuce.svg",
    "IL",
    cutLettuce
);

const cutTomato = new Item(
    "Sliced tomato",
    "A piece of cut tomato.",
    "img/items/sliced-tomato.svg",
    null,
    null,
    null,
    "CT",
    0.5
);

const tomato = new Item(
    "Tomato",
    "A juicy red ball thingy.",
    "img/items/tomato.svg",
    "tomato",
    cutTomato,
);

const cookedGroundBeef = new Item(
    "Cooked ground beef",
    "Very tasty.",
    "img/items/cooked-ground-beef.jpg",
    null,
    null,
    null,
    "CG",
    0.9,
);

const groundBeef = new Item(
    "Ground beef",
    "Can be grilled.",
    "img/items/ground-beef.png",
    null,
    null,
    cookedGroundBeef,
);

const beef = new Item(
    "Beef",
    "Can be cut.",
    "img/items/beef.svg",
    "beef",
    groundBeef,
);
  
export const items = [lettuce, cutLettuce, tomato, cutTomato, beef, groundBeef, cookedGroundBeef];
//TODO add ground beef and cooked ground beef
  