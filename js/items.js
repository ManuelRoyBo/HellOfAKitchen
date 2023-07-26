export class Item {
    constructor(itemName, description, imageUrl, qrCodeId = null, cutEquivalent = null, grilledEquivalent = null, finalFormQrId = null) {
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
    "CL"
);

const lettuce = new Item(
    "Lettuce",
    "A piece of lettuce.",
    "img/lettuce.svg",
    "IL",
    cutLettuce,
    null,
    null
);

const cutTomato = new Item(
    "Sliced",
    "A piece of cut tomato.",
    "img/sliced-tomato.svg",
    null,
    null,
    null,
    "CT"
);

const tomato = new Item(
    "Tomato",
    "A juicy red ball thingy.",
    "img/tomato.svg",
    "tomato",
    cutTomato,
    null,
    null
);




  
export const items = [lettuce, cutLettuce, tomato, cutTomato];

  