export class Item {
    constructor({ itemName, description, imageUrl, qrCodeId = null, cutEquivalent = null, grilledEquivalent = null, finalFormQrId = null, oddsOfBeingInABurger = null }) {
      this.itemName = itemName;
      this.description = description;
      this.imageUrl = imageUrl;
      this.qrCodeId = qrCodeId;
      this.cutEquivalent = cutEquivalent;
      this.grilledEquivalent = grilledEquivalent;
      this.finalFormQrId = finalFormQrId;
      this.oddsOfBeingInABurger = oddsOfBeingInABurger;
    }
}
  
const cutLettuce = new Item({
    itemName: "Cut lettuce",
    description: "A piece of cut lettuce.",
    imageUrl: "img/items/lettuce-leaf.svg",
    finalFormQrId: "CL",
    oddsOfBeingInABurger: 0.5
});

const lettuce = new Item({
    itemName: "Lettuce",
    description: "A piece of lettuce.",
    imageUrl: "img/items/lettuce.svg",
    qrCodeId: "IL",
    cutEquivalent: cutLettuce
});

const cutTomato = new Item({
    itemName: "Sliced tomato",
    description: "A piece of cut tomato.",
    imageUrl: "img/items/sliced-tomato.svg",
    finalFormQrId: "CT",
    oddsOfBeingInABurger: 0.5
});

const tomato = new Item({
    itemName: "Tomato",
    description: "A juicy red ball thingy.",
    imageUrl: "img/items/tomato.svg",
    qrCodeId: "tomato",
    cutEquivalent: cutTomato
});

const cookedGroundBeef = new Item({
    itemName: "Cooked ground beef",
    description: "Very tasty.",
    imageUrl: "img/items/cooked-ground-beef.jpg",
    finalFormQrId: "CG",
    oddsOfBeingInABurger: 0.9
});

const groundBeef = new Item({
    itemName: "Ground beef",
    description: "Can be grilled.",
    imageUrl: "img/items/ground-beef.png",
    grilledEquivalent: cookedGroundBeef
});

const beef = new Item({
    itemName: "Beef",
    description: "Can be cut.",
    imageUrl: "img/items/beef.svg",
    qrCodeId: "beef",
    cutEquivalent: groundBeef
});

export const items = [lettuce, cutLettuce, tomato, cutTomato, beef, groundBeef, cookedGroundBeef];
  