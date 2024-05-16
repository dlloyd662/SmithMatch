"use strict";

const d = new Date();
let time = d.getTime();

// const { bitNot } = require("mathjs");

// const math = require("mathjs");

let initialized = false;
//#region =========================================Drag and Drop==============================================

//See https://www.youtube.com/watch?v=jfYWwQrtzzY
let draggables = document.querySelectorAll(".draggable");
let container = document.querySelectorAll(".container")[1];
// Adds an event listener for each element with a draggable class
//when the event listener is triggered then execute an arrow function which assigns or removes the element's 'dragging' class
function draggableEventListener() {
  draggables = document.querySelectorAll(".draggable");
  container = document.querySelectorAll(".container")[1];
  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", () => {
      draggable.classList.add("dragging");
    });

    draggable.addEventListener("dragend", () => {
      draggable.classList.remove("dragging");
    });
    if (
      //Delete button only runs if the following is true:
      initialized == true && //1: code is initialized
      draggable.draggable == true && //2: The element in question is draggable
      draggable.tagName !== "CANVAS" //3: The element is not of type canvas (Necessary because this code loops through canvases aswell as divs)
    ) {
      const button = draggable.getElementsByTagName("button")[0];
      if (button.classList.contains("hasEventListener") !== true) {
        //Checks if the button already has an event listener
        button.addEventListener("click", () => {
          //Adds click event listener
          draggable.parentNode.removeChild(draggable); //Deletes div and all contents
          updateComponentArraysLoop();
        });
      }
      button.classList.add("hasEventListener"); //Adds class that will be used to check if an event listener has already been assigned
    }
  });
}

draggableEventListener();
//When an item is dragged over, then return the element after the current mouse position using getDragAfterElement in which the yposition of the cursor and the current container are passed into

container.addEventListener("dragover", (e) => {
  e.preventDefault(); //This removes error marker on cursor when dropping
  const afterElement = getDragAfterElement(container, e.clientX); //Element directly after cursor
  const loadElement = document.querySelector("#load");
  const draggable = document.querySelector(".dragging"); //sets dragable to the dragging element (only one element can be assigned the .dragging class at a time)
  //If no objects are afer our element then append to end. else insert after current element
  updateComponentArraysLoop();
  if (
    afterElement == null || // true when hovering over load block
    afterElement.nextSibling == null || // true when hovering over first buffer
    afterElement.nextSibling.nextSibling == null // true when hovering over component next to  first buffer
  ) {
    //Prevents insertion of the block after the buffer
    // container.appendChild(draggable);                      //Use this to append at the end of design space
    container.insertBefore(
      draggable,
      container.lastChild.previousElementSibling
    ); //Use this to append before last element
  } else if (afterElement.draggable === true) {
    container.insertBefore(draggable, afterElement);
  }
});
//returns the element after the current mouse position
function getDragAfterElement(container, x) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ]; //returns an array of all draggable elements not currently being dragged usng the spread(...) operator
  //reduce iterates through an array and on each iterations runs a passed in function and eliminates the current item
  //Format: <array>.reduce((<acucmulator>, <arrayitem>) => {return total + item.price}, <startingvalue>)
  //The above code sums all items in a list returning the total. Recall arrow functions do not need to have a name
  //Code below loops through all draggable elements and returns the one with closest y coordinates
  //'closest' is the closest element to the cursor that is returned and 'child' is the array of draggable elements
  //On the draggableElements array execute the reduce method, which iterates through the array and on each iteration checks the offset between the mouse cursor and the current array item. If the current iteration is closer than the previous one, then the variable closest is updated. At the end ofthe array the closest item is returned.

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect(); //returns a rectangle object of the child object with top/height attributes
      const offset = x - box.left - box.width / 2; //Difference in y between center of box and mouse position

      //negative offsets indicate hovering below an object.
      //The offset with the smallest negative value is what we want to append after
      //If the passed in element has a smaller offset than the previous closest value of -inf then return the passed in element. Else, return the previous closest element
      if (offset < 0 && offset > closest.offset) {
        //If closer than previous elements

        return { offset: offset, element: child }; //offset = offset, element = child
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
//#endregion ===================================================================================================

//#region =======================================Frequency/Impedance Handling=================================
const vLight = 2.998e9;

let zs = 50; //Sets default zs
let zl = 50; //Sets default zl
let frequencies = [1 * 10 ** 9]; //Sets default array of frequencies
let omegaArray = [frequencies[0] * 2 * math.pi]; //Sets default angular frequency
let frequencyIndex = 0; //Index used to loop through array of frequencies and to set the index of the corresponding cktS11/S11

let wavelengths = [frequencies[0] / vLight]; //longest wavelength of all frequencies

let firstFrequency = true;

const inputsArray = document
  .getElementById("frequencyBank")
  .getElementsByTagName("input");
for (let i = 0; i < inputsArray.length; i++) {
  frequencies[i] = inputsArray[i].value * 1e6;
  omegaArray[i] = frequencies[i] * 2 * math.pi;
}
function createDeleteBtnEventListeners() {
  let deleteBtnArray = document.getElementsByClassName("delete");
  for (let i = 0; i < deleteBtnArray.length; i++) {
    let button = document.getElementsByClassName("delete")[i];
    let correspondingInput = document.getElementsByClassName("frequency")[i];
    let correspondingBreak =
      document.getElementsByClassName("frequencyBreak")[i];
    let correspondingUnits = document.getElementsByClassName("units")[i];
    let correspondingS11 = document.getElementsByClassName("s11Text")[i];
    let correspondingZ = document.getElementsByClassName("zText")[i];
    let correspondingGamma = document.getElementsByClassName("gammaText")[i];
    // Check if button already has event listener

    function getButtonIndex(button) {
      const buttons = document.getElementsByClassName("delete");
      for (let i = 0; i < deleteBtnArray.length; i++) {
        if (button == buttons[i]) return i;
      }
    }
    if (button.classList.contains("hasEventListener") !== true) {
      button.classList.add("hasEventListener");

      button.addEventListener("click", function () {
        if (
          document
            .getElementById("frequencyBank")
            .getElementsByClassName("frequency").length > 1
        ) {
          const indexOfButton = getButtonIndex(button);
          componentArray.forEach(function (component) {
            component.cktS11.splice(indexOfButton, 1);
          });

          button.remove();
          correspondingInput.remove();
          correspondingBreak.remove();
          correspondingUnits.remove();
          correspondingS11.remove();
          correspondingZ.remove();
          correspondingGamma.remove();
        }
      });
    }
  }
}

//This function adds the input field, button, units dropdown and break when the add button is pressed
function addFrequency() {
  const input = document.createElement("input");
  const units = document.getElementById("frequencyDropDown").cloneNode(true);
  const del = document.createElement("button");
  const brk = document.createElement("br");
  const s11Par = document.createElement("p");
  const ZPar = document.createElement("p");
  const gammaPar = document.createElement("p");

  if (initialized == false) {
    input.value = "1";
  } else {
    input.value = "";
  }
  input.classList.add("frequency"); //adds frequency tag to pull input field array when delete btn is pressed
  units.style.display = "auto";
  units.classList.add("units");
  del.textContent = "Delete";
  del.classList.add("delete");
  brk.classList.add("frequencyBreak");
  s11Par.classList.add("s11Text");
  ZPar.classList.add("zText");
  gammaPar.classList.add("gammaText");

  document.getElementById("frequencyBank").appendChild(del);
  document.getElementById("frequencyBank").appendChild(input);
  document.getElementById("frequencyBank").appendChild(units);
  document.getElementById("frequencyBank").appendChild(s11Par); //This is where s11 for each freq will be displayed
  document.getElementById("frequencyBank").appendChild(ZPar); //This is where s11 for each freq will be displayed
  document.getElementById("frequencyBank").appendChild(gammaPar); //This is where s11 for each freq will be displayed
  document.getElementById("frequencyBank").appendChild(brk);
  createDeleteBtnEventListeners();
}
addFrequency();

function padNum(num, leading, trailing) {
  let numString = String(num);
  if (numString.indexOf(".") < leading) {
    numString = "0".repeat(leading - numString.indexOf(".")) + numString;
  }

  if (numString.length - (1 + leading) < trailing) {
    numString =
      numString + "0".repeat(trailing + 1 + leading - numString.length);
  }
  return numString;
}
const space = "&#x2005".repeat(2);

function displayS11(frequencyIndex) {
  const re = String(
    math.round(
      componentArray[componentArray.length - 2].cktS11[frequencyIndex].re,
      3
    )
  );
  const im = String(
    math.round(
      componentArray[componentArray.length - 2].cktS11[frequencyIndex].im,
      3
    )
  );
  const x = componentArray[componentArray.length - 2].cktX[frequencyIndex];
  const y = componentArray[componentArray.length - 2].cktY[frequencyIndex];
  const gammaMag = math.round((2 * Math.hypot(x, y)) / (2 * boundaryRadius), 2);
  const gammaRad = math.round(Math.atan2(y, x), 2);
  const z = math.multiply(
    zs,
    math.divide(
      math.add(1, math.complex({ r: gammaMag, phi: gammaRad })),
      math.add(1, math.unaryMinus(math.complex({ r: gammaMag, phi: gammaRad })))
    )
  );
  let zRe = math.round(z.re, 2);
  let zIm = math.round(z.im, 2);
  let zImAbs = math.abs(zIm);

  //Convert to scientific notation if number length gets too long (Prevents errors with space.repeat)
  if (zRe.toString().length >= 7) {
    zRe = parseFloat(zRe.toExponential());
    zRe = zRe.toPrecision(2);
  }
  if (zIm.toString().length >= 8) {
    if (zIm < 0) {
      zImAbs = zIm * -1;
    }
    zImAbs = parseFloat(zImAbs.toExponential());
    zImAbs = zImAbs.toPrecision(2);
  }

  const s11Text =
    "   S11: " + re + (im < 0 ? " -" : " +") + " j" + String(math.abs(im));
  const zText = "Z: " + zRe + (zIm < 0 ? " -" : " +") + " j" + zImAbs;
  const gammaText = " Gamma: " + gammaMag + ", " + gammaRad + " rad";

  if (isNaN(re) == false) {
    document.getElementsByClassName("s11Text")[frequencyIndex].innerHTML =
      "<pre>" + s11Text + space.repeat(26 - s11Text.length) + "</pre>";
    document.getElementsByClassName("zText")[frequencyIndex].innerHTML =
      "<pre>" + zText + space.repeat(23 - zText.length) + "</pre>";
    document.getElementsByClassName("gammaText")[frequencyIndex].innerHTML =
      "<pre>" + gammaText + space.repeat(23 - gammaText.length) + "</pre>";
  }
}
//Create event listener on the "add" button that runs the addFrequency() function when clicked
document.getElementById("add").addEventListener("click", function () {
  addFrequency();
  createDeleteBtnEventListeners();
});

//Function iterates through each delete button and assigns an event listener if it doesn't already have one

function updateFrequenciesArray() {
  const inputsArray = document
    .getElementById("frequencyBank")
    .getElementsByClassName("frequency");
  const unitsArray = document
    .getElementById("frequencyBank")
    .getElementsByClassName("units");
  frequencies = [];
  omegaArray = [];
  wavelengths = [];
  for (let i = 0; i < inputsArray.length; i++) {
    if (inputsArray[i].value) {
      frequencies.push(inputsArray[i].value * unitsArray[i].value);
      omegaArray.push(frequencies[i] * 2 * math.pi);
      wavelengths.push(vLight / frequencies[i]);
    }
  }
}

//#endregion =================================================================================================

//#region =========================================Component Objects/Array=======================================
let componentArray = [];

function updateComponentArraysLoop() {
  firstFrequency = true;
  frequencyIndex = 0;
  updateComponentArray();

  for (let i = 1; i < omegaArray.length; i++) {
    if (!iterating || i == lowestFrequencyIndex) {
      firstFrequency = false;
      frequencyIndex = i;
      updateComponentArray();
    }
  }
  // firstFrequency = true;
}

function updateComponentArray() {
  let components = document.querySelector("#designSpace").children;
  //for loop references each component div object in order
  componentArray = []; //Component array must be cleared or else components at later indexes will be duplicated when components are deleted. EX: load is at index 7, then when a component is deleted it moves to index 6 now existing at both indeces
  for (let i = 0; i < components.length; i++) {
    componentArray[i] = components[i];
  }
  componentArray.reverse();
  rfLogic();
}
const componentUnitsArray = [
  ["G", 1e9],
  ["M", 1e6],
  ["k", 1e3],
  [" ", 1],
  ["m", 1e-3],
  ["u", 1e-6],
  ["n", 1e-9],
  ["p", 1e-12],
];
const lineUnitsArray = [
  [" ", 1],
  ["c", 1e-2],
  ["m", 1e-3],
  ["u", 1e-6],
];

const getUnitsArray = function (array, prefix, startIndex, stopIndex) {
  let units = [];
  for (let i = startIndex; i < Math.min(array.length, stopIndex); i++) {
    units.push([array[i][0] + prefix, array[i][1]]);
  }
  return units;
};
class resistor {
  constructor() {
    this.value = 50;
    this.unitsArray = getUnitsArray(componentUnitsArray, "Ω", 3, 5);
  }
  inputFieldsArray() {
    return [[this.value, this.unitsArray]];
  }
}
class inductor {
  constructor() {
    this.value = 1;
    this.unitsArray = getUnitsArray(componentUnitsArray, "H", 3, 10);
  }
  inputFieldsArray() {
    return [[this.value, this.unitsArray]];
  }
}
class capacitor {
  constructor() {
    this.value = 1;
    this.unitsArray = getUnitsArray(componentUnitsArray, "F", 3, 10);
  }
  inputFieldsArray() {
    return [[this.value, this.unitsArray]];
  }
}
class transmissionLine {
  constructor(length, characteristicImpedance) {
    this.lineLength = 10;
    this.characteristicImpedance = 50;
    this.unitsArray = getUnitsArray(componentUnitsArray, "Ω", 3, 4);
    this.lengthsArray = getUnitsArray(lineUnitsArray, "m", 0, 4);
  }
  inputFieldsArray() {
    return [
      [this.characteristicImpedance, this.unitsArray],
      [this.lineLength, this.lengthsArray],
    ];
  }
}
class stub {
  constructor() {
    this.lineLength = 10;
    this.characteristicImpedance = 50;
    this.unitsArray = getUnitsArray(componentUnitsArray, "Ω", 3, 4);
    this.lengthsArray = getUnitsArray(lineUnitsArray, "m", 0, 4);
  }
  inputFieldsArray() {
    return [
      [this.characteristicImpedance, this.unitsArray],
      [this.lineLength, this.lengthsArray],
    ];
  }
}
class load {
  constructor() {
    this.value = 50;
    this.unitsArray = getUnitsArray(componentUnitsArray, "Ω", 3, 4);
  }
  inputFieldsArray() {
    return [
      [this.value, this.unitsArray],
      [0, getUnitsArray(componentUnitsArray, "jX", 3, 4)],
    ];
  }
}
class defaultLoad extends load {
  constructor() {
    super();
  }
}

class source {
  constructor() {
    this.value = 50;
    this.unitsArray = getUnitsArray(componentUnitsArray, "Ω", 3, 4);
  }
  inputFieldsArray() {
    return [[this.value, this.unitsArray]];
  }
}
class defaultSource extends source {
  constructor() {
    super();
  }
}

class defaultSeriesCapacitor extends capacitor {
  constructor() {
    super();
  }
  capacitance() {
    this.value * this.scale;
  }
  impedance() {
    return this.capacitance;
  }
}
class defaultShuntCapacitor extends capacitor {
  constructor() {
    super();
  }
}
class defaultSeriesInductor extends inductor {
  constructor() {
    super();
  }
}
class defaultShuntInductor extends inductor {
  constructor() {
    super();
  }
}
class defaultSeriesResistor extends resistor {
  constructor() {
    super();
  }
}
class defaultShuntResistor extends resistor {
  constructor() {
    super();
  }
}
class defaultOpenStub extends stub {
  constructor() {
    super();
  }
}
class defaultShortStub extends stub {
  constructor() {
    super();
  }
}
class defaultTransmissionLine extends transmissionLine {
  constructor() {
    super();
  }
}

//#endregion =================================================================================================

//#region =========================================Component Creation=========================================
const componentW = 90;
const componentH = 130;
const componentCenterX = componentW / 2;
const componentCenterY = (componentH * 1) / 5.5;
function sizeComponent(componentName) {
  document.getElementById(componentName).height = componentH;
  document.getElementById(componentName).width = componentW;
}
//Draws a ground starting at the passed in xy coordinates
const groundY = componentCenterY + (componentW * 11) / 12;
function drawGround(canvas) {
  const x = componentCenterX;
  const y = groundY;
  for (let i = 1; i <= 3; i++) {
    canvas.moveTo(x - componentW / 5, y);
    canvas.lineTo(x + componentW / 5, y);
    canvas.moveTo(x - componentW / 10, y + componentW / 14);
    canvas.lineTo(x + componentW / 10, y + componentW / 14);
    canvas.moveTo(x - componentW / 20, y + (componentW * 2) / 14);
    canvas.lineTo(x + componentW / 20, y + (componentW * 2) / 14);
  }
}
//Draws a horizontal line which each shunt component connects to
function drawTee(ctx) {
  ctx.moveTo(0, componentCenterY);
  ctx.lineTo(componentW, componentCenterY);
}
function drawL(ctx) {
  ctx.moveTo(0, componentCenterY);
  ctx.lineTo(componentW / 2, componentCenterY);
}
const zigzagHeight = componentW / 16;

function drawSeriesResistor() {
  const resistorCanvas = document.getElementById("seriesResistor");

  sizeComponent("seriesResistor");
  const ctx = resistorCanvas.getContext("2d");

  ctx.beginPath();
  ctx.lineWidth = 2.5;

  ctx.moveTo(0, componentCenterY);
  ctx.lineTo((componentW * 4) / 24, componentCenterY);
  ctx.lineTo((componentW * 6) / 24, componentCenterY + zigzagHeight);
  ctx.lineTo((componentW * 8) / 24, componentCenterY - zigzagHeight);
  ctx.lineTo((componentW * 10) / 24, componentCenterY + zigzagHeight);
  ctx.lineTo((componentW * 12) / 24, componentCenterY - zigzagHeight);
  ctx.lineTo((componentW * 14) / 24, componentCenterY + zigzagHeight);
  ctx.lineTo((componentW * 16) / 24, componentCenterY - zigzagHeight);
  ctx.lineTo((componentW * 18) / 24, componentCenterY + zigzagHeight);
  ctx.lineTo((componentW * 20) / 24, componentCenterY);
  ctx.lineTo((componentW * 24) / 24, componentCenterY);
  ctx.stroke();
}
function drawShuntResistor() {
  const resistorCanvas = document.getElementById("shuntResistor");
  sizeComponent("shuntResistor");
  const ctx = resistorCanvas.getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  drawTee(ctx);
  ctx.moveTo(componentCenterX, componentCenterY);
  ctx.lineTo(componentCenterX, componentCenterY + (componentW * 3) / 24);
  for (let i = 4; i <= 14; i = i + 4) {
    ctx.lineTo(
      componentCenterX + zigzagHeight,
      componentCenterY + (componentW * i) / 24
    );
    ctx.lineTo(
      componentCenterX - zigzagHeight,
      componentCenterY + (componentW * (i + 2)) / 24
    );
  }
  ctx.lineTo(
    componentCenterX + zigzagHeight,
    componentCenterY + (componentW * 15) / 24
  );
  ctx.lineTo(componentCenterX, componentCenterY + (componentW * 16) / 24);
  ctx.lineTo(componentCenterX, componentCenterY + (componentW * 11) / 12);
  drawGround(ctx);
  ctx.stroke();
}
const plateHeight = (componentW * 1) / 6;
const plateSeperation = (componentW * 1) / 12;
function drawSeriesCapacitor() {
  const capacitorCanvas = document.getElementById("seriesCapacitor");
  sizeComponent("seriesCapacitor");
  const ctx = capacitorCanvas.getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.moveTo(0, componentCenterY);
  ctx.lineTo((componentW * 4) / 9, componentCenterY);
  ctx.moveTo(
    componentCenterX - 0.5 * plateSeperation,
    componentCenterY + plateHeight
  );
  ctx.lineTo(
    componentCenterX - 0.5 * plateSeperation,
    componentCenterY - plateHeight
  );
  ctx.moveTo(
    componentCenterX + 0.5 * plateSeperation,
    componentCenterY + plateHeight
  );
  ctx.lineTo(
    componentCenterX + 0.5 * plateSeperation,
    componentCenterY - plateHeight
  );
  ctx.moveTo((componentW * 5) / 9, componentCenterY);
  ctx.lineTo(componentW, componentCenterY);
  ctx.stroke();
}

function drawShuntCapacitor() {
  const capacitorCanvas = document.getElementById("shuntCapacitor");
  sizeComponent("shuntCapacitor");
  const ctx = capacitorCanvas.getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  drawTee(ctx);
  ctx.moveTo(componentCenterX, componentCenterY);
  ctx.lineTo(
    componentCenterX,
    componentCenterY + (groundY - componentCenterY) / 2 - 0.5 * plateSeperation
  );
  ctx.moveTo(
    componentCenterX - plateHeight,
    componentCenterY + (groundY - componentCenterY) / 2 - 0.5 * plateSeperation
  );
  ctx.lineTo(
    componentCenterX + plateHeight,
    componentCenterY + (groundY - componentCenterY) / 2 - 0.5 * plateSeperation
  );
  ctx.moveTo(
    componentCenterX - plateHeight,
    componentCenterY + (groundY - componentCenterY) / 2 + 0.5 * plateSeperation
  );
  ctx.lineTo(
    componentCenterX + plateHeight,
    componentCenterY + (groundY - componentCenterY) / 2 + 0.5 * plateSeperation
  );

  ctx.moveTo(
    componentCenterX,
    componentCenterY + (groundY - componentCenterY) / 2 + 0.5 * plateSeperation
  );
  ctx.lineTo(componentCenterX, groundY);
  drawGround(ctx);

  ctx.stroke();
}

const indRad = componentW / 10;
function drawSeriesInductor() {
  const inductorCanvas = document.getElementById("seriesInductor");
  sizeComponent("seriesInductor");
  const ctx = inductorCanvas.getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.moveTo(0, componentCenterY);
  ctx.lineTo(2 * indRad, componentCenterY);
  ctx.stroke();
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(
      2 * indRad - indRad + indRad * 2 * i, //x1
      componentCenterY, //y1
      indRad, //r

      0,
      Math.PI,
      true
    );
    ctx.stroke();
  }
  ctx.moveTo(componentW - 2 * indRad, componentCenterY);
  ctx.lineTo(componentW, componentCenterY);
  ctx.stroke();
}

function drawShuntInductor() {
  const inductorCanvas = document.getElementById("shuntInductor");
  sizeComponent("shuntInductor");
  const ctx = inductorCanvas.getContext("2d");
  const rad = componentW / 10;
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  drawTee(ctx);
  ctx.moveTo(componentCenterX, componentCenterY);
  ctx.lineTo(
    componentCenterX,
    componentCenterY + (groundY - componentCenterY) / 2 - indRad * 3
  );
  ctx.stroke();
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(
      componentCenterX, //x1
      componentCenterY +
        (groundY - componentCenterY) / 2 +
        indRad * 2 * (i - 2), //y1
      indRad, //r
      Math.PI / 2,
      (3 * Math.PI) / 2,
      true
    );
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(
    componentCenterX,
    componentCenterY + (groundY - componentCenterY) / 2 + indRad * 3
  );
  ctx.lineTo(componentCenterX, groundY);
  drawGround(ctx);
  ctx.stroke();
}

const tLineL = componentW / 2;
const tLineW = componentW / 7;
function drawTransmissionLine() {
  const transmissionLineCanvas = document.getElementById("transmissionLine");
  sizeComponent("transmissionLine");
  const ctxt = transmissionLineCanvas.getContext("2d");
  ctxt.beginPath();
  ctxt.lineWidth = 2.5;
  ctxt.moveTo(0, componentCenterY);
  ctxt.lineTo(componentW / 4, componentCenterY);
  ctxt.rect(componentW / 4, componentCenterY - tLineW * 0.5, tLineL, tLineW);
  ctxt.moveTo(componentW / 4 + tLineL, componentCenterY);
  ctxt.lineTo(componentW, componentCenterY);
  ctxt.stroke();
}

function drawOpenStub() {
  const openStubCanvas = document.getElementById("openStub");
  sizeComponent("openStub");
  const ctx = openStubCanvas.getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  drawTee(ctx);

  ctx.stroke();
  ctx.moveTo(componentCenterX, componentCenterY);
  ctx.lineTo(
    componentCenterX,
    componentCenterY + (groundY - componentCenterY) / 2 - tLineL / 2
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(
    componentCenterX - tLineW / 2,
    componentCenterY + (groundY - componentCenterY) / 2 - tLineL / 2,
    tLineW,
    tLineL
  );
  ctx.moveTo(
    componentCenterX,
    componentCenterY + (groundY - componentCenterY) / 2 + tLineL / 2
  );
  ctx.stroke();
}

function drawShortStub() {
  const shortStubCanvas = document.getElementById("shortStub");
  sizeComponent("shortStub");

  const ctx = shortStubCanvas.getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  drawTee(ctx);

  ctx.stroke();
  ctx.moveTo(componentCenterX, componentCenterY);
  ctx.lineTo(
    componentCenterX,
    componentCenterY + (groundY - componentCenterY) / 2 - tLineL / 2
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(
    componentCenterX - tLineW / 2,
    componentCenterY + (groundY - componentCenterY) / 2 - tLineL / 2,
    tLineW,
    tLineL
  );
  ctx.moveTo(
    componentCenterX,
    componentCenterY + (groundY - componentCenterY) / 2 + tLineL / 2
  );
  ctx.lineTo(componentCenterX, groundY);
  drawGround(ctx);
  ctx.stroke();
}

function drawLoad() {
  const shortStubCanvas = document.getElementById("load");
  sizeComponent("load");

  const ctx = shortStubCanvas.getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  drawL(ctx);

  ctx.stroke();
  ctx.moveTo(componentCenterX, componentCenterY);
  ctx.lineTo(
    componentCenterX,
    componentCenterY + (groundY - componentCenterY) / 2 - tLineL / 2
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(
    componentCenterX - tLineW / 2,
    componentCenterY + (groundY - componentCenterY) / 2 - tLineL / 2,
    tLineW,
    tLineL
  );
  ctx.moveTo(
    componentCenterX,
    componentCenterY + (groundY - componentCenterY) / 2 + tLineL / 2
  );
  ctx.lineTo(componentCenterX, groundY);
  ctx.fill();
}
const sourceRadius = componentW / 5; //Radius of circle enclosing AC source symbol
const acSymbolRadius = componentW / 15;
function drawSource() {
  const sourceCanvas = document.getElementById("source");
  sizeComponent("source");
  const ctx = sourceCanvas.getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.moveTo(componentCenterX + sourceRadius, componentCenterY);
  ctx.arc(
    componentCenterX, //x1
    componentCenterY, //y1
    sourceRadius, //r
    0,
    2 * Math.PI,
    true
  );

  ctx.moveTo(componentCenterX, componentCenterY);
  ctx.arc(
    componentCenterX + acSymbolRadius, //x1
    componentCenterY, //y1
    acSymbolRadius, //r
    -Math.PI,
    2 * Math.PI,
    true
  );
  ctx.moveTo(componentCenterX - 2 * acSymbolRadius, componentCenterY);
  ctx.arc(
    componentCenterX - acSymbolRadius, //x1
    componentCenterY, //y1
    acSymbolRadius, //r
    Math.PI,
    2 * Math.PI,
    false
  );
  ctx.moveTo(componentCenterX + sourceRadius, componentCenterY);
  ctx.lineTo(componentW, componentCenterY);
  ctx.stroke();
}
function draw() {
  drawShortStub();
  drawOpenStub();
  drawTransmissionLine();
  drawShuntInductor();
  drawSeriesInductor();
  drawShuntCapacitor();
  drawShuntResistor();
  drawSeriesResistor();
  drawSeriesCapacitor();
  drawLoad();
  drawSource();
}
draw();

//#endregion

//#region =========================================Copy to Design Space=======================================

function cloneCanvas(oldCanvas) {
  //create a new canvas
  var newCanvas = document.createElement("canvas");
  var context = newCanvas.getContext("2d");

  //set dimensions
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;

  //apply the old canvas to the new one
  context.drawImage(oldCanvas, 0, 0);

  //return the new canvas
  newCanvas.classList.add("draggable");
  newCanvas.setAttribute("draggable", true);
  return newCanvas;
}
//addInputField adds user input options for each component with to adjust units and component values
//this.inputFieldsArray = [[this.value, this.unitsArray]];
//for each returns valueUnitPair = [this.value, this.unitsArray];
//return valueUnitPair[0] for value
//return valueUnitPair[1] for array of pairs
//return valueUnitPair[1][i][0] for unit and valueUnitPair[1][i][1] for scale
function addInputField(div) {
  const inputTextFieldWidth = componentW * 0.49; //Sets the input field to slightly narrower than the canvas element width
  let i = 0;

  div.componentObject.inputFieldsArray().forEach((valueUnitPair) => {
    const value = document.createElement("input");
    value.type = "text";
    div.appendChild(value);
    div.setAttribute("style", "width:" + componentW + "px"); //WITHOUT THIS LINE, EACH CANVAS ELEMENT/INPUT PAIR ARE OFFSET HORIZONTALLY, DO NOT DELETE
    value.defaultValue = valueUnitPair[0]; //Sets the default value equal to the default setting in the component object
    let units = document.createElement("select"); //Creates drop down menu using the units array property of the passed in component
    units.label = "units";
    for (let i = 0; i < valueUnitPair[1].length; i++) {
      let opt = document.createElement("option");
      opt.value = valueUnitPair[1][i][1];
      opt.innerHTML = valueUnitPair[1][i][0];
      units.appendChild(opt);
      div.appendChild(units);
    }
    //Sets default units to pF and nH
    if (units[0].innerHTML.includes("F")) {
      units.value = units[4].value;
    } else if (units[0].innerHTML.includes("H")) {
      units.value = units[3].value;
    } else if (units[0].innerHTML.includes("m")) {
      units.value = units[2].value; //Sets default units to mm
    }
    div.getElementsByTagName("select")[i].style.width = String(4) + "ch";
    div.getElementsByTagName("input")[i].style.width =
      String(inputTextFieldWidth) + "px";
    i++;
  });

  if (initialized == true) {
    //Adds delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    div.appendChild(deleteBtn);
    div.getElementsByTagName("button")[0].style.width =
      componentW - componentW * 0.05 + "px";
    div.getElementsByTagName("button")[0].style.position = "relative";
    div.getElementsByTagName("button")[0].style.left = "0%";
  }
}
//Array of defualt components for use in getComponentObject
const defaultComponentsArray = [
  ["seriesCapacitorBlock", defaultSeriesCapacitor],
  ["shuntCapacitorBlock", defaultShuntCapacitor],
  ["seriesInductorBlock", defaultSeriesInductor],
  ["shuntInductorBlock", defaultShuntInductor],
  ["seriesResistorBlock", defaultSeriesResistor],
  ["shuntResistorBlock", defaultShuntResistor],
  ["openStubBlock", defaultOpenStub],
  ["shortStubBlock", defaultShortStub],
  ["transmissionLineBlock", defaultTransmissionLine],
  ["loadBlock", defaultLoad],
  ["sourceBlock", defaultSource],
];
//getComponentObject takes passed in component block div and checks if the id corresponds with series/shunt RLCTS, then returns the associated default object .
function getComponentObject(div) {
  for (let i = 0; i < defaultComponentsArray.length; i++) {
    if (div.id === defaultComponentsArray[i][0]) {
      return defaultComponentsArray[i][1];
    }
  }
}
//cloneElementBlock takes a block from the componentBank and copies it to the design space with the draggable class
function cloneElementBlock(oldBlock) {
  let div = document.createElement("div"); //Create div for designSpace block
  div.className += "draggable"; //Adds draggable class to designSpace element
  div.id += oldBlock.id; //Copies id from old block to the copy
  div.classList.add(oldBlock.id); //Copies blockname as class

  if (div.classList.contains("seriesInductorBlock") && initialized == false) {
    //Adds a buffer class to buffer inductors
    div.classList.add("buffer");
  }

  div.block = oldBlock.id;
  div.draggable = "true"; //Makes design space block dragable
  div.appendChild(cloneCanvas(oldBlock.querySelector("canvas"))); //Inserts block into container
  //Below code assigns a unique component object to each div object

  let componentObject = getComponentObject(div);

  div.componentObject = new componentObject();
  addInputField(div); //Adds input fields based on default class properties

  return div;
}

//add event listener to each item in the component array, that when clicked pushes that item to the design space with the draggable class
const componentBank = document.querySelector("#componentBank").children;
let componentBankDict = new Map();
for (let i = 0; i < componentBank.length; i++) {
  componentBankDict.set(componentBank[i].id, componentBank[i]);
}
const designSpaceComponents = document.getElementById("designSpace");

//Pass in div block
function copyComponentToDesignSpace(component) {
  const componentBlockClone = cloneElementBlock(component);
  //The below if statement is used to allow all components to be copied AFTER the first buffer. But the buffers and load will be copied at index 0 to avoid flagging an error
  if (initialized == false) {
    designSpace.insertBefore(
      componentBlockClone,
      designSpaceComponents.firstChild
    );
  } else {
    designSpace.insertBefore(
      componentBlockClone,
      designSpaceComponents.firstChild.nextSibling.nextSibling
    );
  }
  //Each component property below must be initialized as an array in order to index through them using frequencyIndex
  componentBlockClone.s11 = [];
  componentBlockClone.s21 = [];
  componentBlockClone.s12 = [];
  componentBlockClone.s22 = [];
  componentBlockClone.spar = [];
  componentBlockClone.t11 = [];
  componentBlockClone.t21 = [];
  componentBlockClone.t12 = [];
  componentBlockClone.t22 = [];
  componentBlockClone.tpar = [];
  componentBlockClone.cktS11 = [];
  componentBlockClone.beta = [];
  componentBlockClone.gamma = [];
  componentBlockClone.cktX = [];
  componentBlockClone.cktY = [];
  componentBlockClone.dist = [];

  draw();
  draggableEventListener();
}

function copyComponentEventListeners() {
  for (let i = 0; i < componentBank.length - 1; i++) {
    let currentComponent = componentBank[i];
    currentComponent.addEventListener("click", function () {
      copyComponentToDesignSpace(currentComponent);
      updateComponentArraysLoop();
    });
  }
}
copyComponentEventListeners();

function addLoad() {
  // designSpace.insertBefore(loadBlock, designSpaceComponents.lastChild);
  copyComponentToDesignSpace(loadBlock);
  designSpaceComponents.lastChild.draggable = false;
  document
    .querySelectorAll("#loadBlock canvas")[1]
    .setAttribute("draggable", false);
  updateComponentArraysLoop();
}

addLoad();

//Adds two 0 Henry inductors to the beggining of the circuit and makes them undraggable
function addBuffer() {
  copyComponentToDesignSpace(componentBank.seriesInductorBlock);
  designSpaceComponents.firstChild.style.display = "none"; //Comment out this line to make the buffers visible

  designSpaceComponents.firstChild.draggable = false; //Make buffer undragable
  document.querySelector(".buffer canvas").setAttribute("draggable", false); //Make buffer undragable
  updateComponentArraysLoop();
  document.querySelector(".buffer input").value = 0; //Sets buffer impedance to 0
}
addBuffer();
addBuffer();
function addSource() {
  copyComponentToDesignSpace(sourceBlock);
  designSpaceComponents.firstChild.draggable = false;
  document
    .querySelectorAll("#sourceBlock canvas")[1]
    .setAttribute("draggable", false);
  updateComponentArraysLoop();
}
addSource();
//#endregion =================================================================================================

//#region =========================================Graph Creation=============================================
document.getElementById("smithchart").height = window.innerHeight * 0.8;
document.getElementById("smithchart").width =
  document.getElementById("smithchart").height;

const canvas = document.getElementById("smithchart");
let centerX = document.getElementById("smithchart").width / 2;
let centerY = document.getElementById("smithchart").height / 2;
let canvasW = document.getElementById("smithchart").width;
let canvasH = document.getElementById("smithchart").height;
let boundaryRadius = canvasW / 2 - 50;
let smithLeftEdge = centerX - boundaryRadius;
let smithRightEdge = centerX + boundaryRadius;
const boundaryThickness = 1;

const ctx = canvas.getContext("2d");
// Outer circle is centered on the canvas

//Pass in normalized resistance and return the corresponding resistance arc radius
function getResistanceArcRad(r) {
  return (boundaryRadius * 1) / (1 + r);
}

// See page 8 for equation http://rfic.eecs.berkeley.edu/142/pdf/module4.pdf
function getReactanceArcRad(x) {
  return boundaryRadius * (1 / x);
}

//Sets arc radius for reactance arcs
const normalizedVals = [4, 2, 1, 0.5, 0.2];
let arcRad = [];
function updatearcRad() {
  arcRad = [
    getReactanceArcRad(normalizedVals[0]),
    getReactanceArcRad(normalizedVals[1]),
    getReactanceArcRad(normalizedVals[2]),
    getReactanceArcRad(normalizedVals[3]),
    getReactanceArcRad(normalizedVals[4]),
  ];
}
updatearcRad();

//Sets radius of resistance circles. Function is used so that these values can be updated when the chart is scaled
let circRad = [];
function updateCircRad() {
  circRad = [
    getResistanceArcRad(4),
    getResistanceArcRad(2),
    getResistanceArcRad(1),
    getResistanceArcRad(0.5),
    getResistanceArcRad(0.2),
  ];
}
updateCircRad();
const smithColor = "white";

//Calculates radius of circle intersecting 3 points
//See: https://math.stackexchange.com/questions/213658/get-the-equation-of-a-circle-when-given-3-points for equations

function smithOutline() {
  ctx.strokeStyle = smithColor;
  ctx.beginPath();
  ctx.lineWidth = boundaryThickness;
  ctx.arc(
    //arc(xcenter, ycenter, radius, startangle(rad), endangle(rad) )
    centerX,
    centerY,
    boundaryRadius,
    0,
    Math.PI * 2
  );
  ctx.stroke();
  //Bottom of circle should be at 1/2 height. (ycenter+radius = 1/2 height)
  ctx.beginPath();
  ctx.moveTo(smithLeftEdge, centerY);
  ctx.lineTo(smithRightEdge, centerY);
  ctx.stroke();
}

function getReactanceArcLength(rad) {
  let d = Math.sqrt(boundaryRadius ** 2 + rad ** 2);
  //Chord is the distance between the two intersecting points
  let chord =
    (1 / d) *
    Math.sqrt(
      4 * d ** 2 * boundaryRadius ** 2 -
        (d ** 2 - rad ** 2 + boundaryRadius ** 2) ** 2
    );

  return 2 * Math.asin(chord / 2 / rad);
}
//Updates the parameters to draw the reactance arcs

let reactanceLabelsX = [];
let reactanceLabelsY = [];
function updateReactanceLabels() {
  const rad = boundaryRadius;
  const scale = 1.2;
  reactanceLabelsX = [
    scale * rad * 0.66,
    scale * rad * 0.4475,
    0,
    -scale * rad * 0.45,
    -scale * rad * 0.6925,
  ];
  reactanceLabelsY = [
    scale * rad * 0.3525,
    scale * rad * 0.5975,
    (scale * rad * 3) / 4,
    scale * rad * 0.6,
    scale * rad * 0.2875,
  ];
}
updateReactanceLabels();
function reactanceArcs(rad) {
  ctx.strokeStyle = smithColor;
  for (let i = 0; i <= rad.length; i++) {
    ctx.beginPath();
    ctx.arc(
      smithRightEdge,
      document.getElementById("smithchart").height / 2 - rad[i],
      rad[i],
      Math.PI / 2,
      getReactanceArcLength(rad[i]) + Math.PI / 2
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(
      smithRightEdge,
      document.getElementById("smithchart").height / 2 + rad[i],
      rad[i],
      (3 / 2) * Math.PI,
      (3 / 2) * Math.PI - getReactanceArcLength(rad[i]),
      true
    );
    ctx.stroke();
    ctx.fillStyle = "white";

    //Adds text of zs*normalized arc value
    if (reactanceLabelsX[i] < 0) {
      ctx.textAlign = "right";
    } else {
      ctx.textAlign = "left";
    }
    ctx.fillText(
      "-" + "j" + math.round(normalizedVals[i] * zs, 1),
      canvas.width / 2 + reactanceLabelsX[i] * 1.04,
      canvas.height / 2 + reactanceLabelsY[i] * 1.04
    );
    ctx.fillText(
      "j" + math.round(normalizedVals[i] * zs, 1),
      canvas.width / 2 + reactanceLabelsX[i] * 1.04,
      canvas.height / 2 - reactanceLabelsY[i] * 1.04
    );
  }
}
function admittanceArcs(rad) {
  ctx.strokeStyle = smithColor;
  for (let i = 0; i < rad.length; i++) {
    ctx.beginPath();
    ctx.arc(
      smithLeftEdge,
      document.getElementById("smithchart").height / 2 - rad[i],
      rad[i],
      Math.PI / 2,
      -getArcLength(rad[i]) + Math.PI / 2,
      true
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(
      smithLeftEdge,
      document.getElementById("smithchart").height / 2 + rad[i],
      rad[i],
      (3 / 2) * Math.PI,
      (3 / 2) * Math.PI + getArcLength(rad[i])
    );
    ctx.stroke();
  }
}
function resistanceCircles(rad) {
  ctx.strokeStyle = smithColor;
  for (let i = 0; i <= rad.length; i++) {
    ctx.beginPath();
    ctx.arc(centerX + boundaryRadius - rad[i], centerY, rad[i], 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "white";
    //Adds text of zs*normalized arc value
    ctx.fillText(
      math.round(normalizedVals[i] * zs, 1),
      canvas.width / 2 + boundaryRadius - rad[i] * 2 + boundaryRadius / 50,
      canvas.height / 2
    );
  }
}
function conductanceCircles(rad) {
  ctx.strokeStyle = smithColor;
  for (let i = 0; i <= rad.length; i++) {
    ctx.beginPath();
    ctx.arc(centerX - boundaryRadius + rad[i], centerY, rad[i], 0, Math.PI * 2);
    ctx.stroke();
  }
}
function drawSmith() {
  smithOutline();
  reactanceArcs(arcRad);
  resistanceCircles(circRad);
}

drawSmith();
// ---------------------------------------------Coordinates (old)---------------------------------------------
let elementids = ["smithchart"]; //array of all elements with coordinate tracking
let x,
  y = 0;
let gamma_deg = 0;
let gamma_rad = 0;
let gamma_mag = 0;

//Changed from below code to reference center instead of top left corner
function getXY(element) {
  x = element.offsetLeft + element.clientWidth / 2; // set x to element’s offsetLeft
  y = element.offsetTop + element.clientHeight / 2; // set y to element’s offsetTop
  element = element.offsetParent; // set element to its offsetParent
  //use while loop to check if element is null
  // if not then add current element’s offsetLeft to x
  //offsetTop to y and set element to its offsetParent
  while (element != null) {
    x = parseInt(x) + parseInt(element.offsetLeft);
    y = parseInt(y) + parseInt(element.offsetTop);
    element = element.offsetParent;
  }
  // returns an object with "xp" (from Left), "=yp" (from Top) position

  return { xp: x, yp: y };
}

// Get X, Y coords, and displays Mouse coordinates
function getCoords(e) {
  let xy_pos = getXY(this); //this is the canvas object with name smithchart
  x = e.pageX;
  y = e.pageY;
  //X and Y coordinates measured from center
  x = x - xy_pos["xp"];
  y = -(y - xy_pos["yp"]);
  if (Math.hypot(x, y) <= boundaryRadius) {
    //
  } else {
    let len = Math.sqrt(x ** 2 + y ** 2);
    x = Math.round((boundaryRadius / len) * x, 1);
    y = Math.round((boundaryRadius / len) * y, 1);
  }
  //-------------------------------------Add modified coordinates here-----------------------------
  gamma_rad = Math.atan2(y, x);
  // .width divides magnitude of xy coordinate by image width, math.hyp obtains magnitude, 2* converts from d to r, .min limits to 1 when clicking outside the circle's edge
  gamma_mag = Math.min(
    1,
    (1.04 * (2 * Math.hypot(x, y))) / (2 * boundaryRadius)
  );

  //=========================================================================================
  // displays x and y coords in the #coords element
  // document.getElementById("coords_xy").innerHTML = "X= " + x + " ,Y= " + y;
  // document.getElementById("coords_gamma").innerHTML =
  //   "Mag= " + gamma_mag.toFixed(2) + " ,Rad= " + gamma_rad.toFixed(2);
  // document.getElementById("s11").innerHTML = s11;
}

// register onmousemove, and onclick the each element with ID stored in elementids
for (let i = 0; i < elementids.length; i++) {
  if (document.getElementById(elementids[i])) {
    // calls the getCoords() function when mousemove
    document.getElementById(elementids[i]).onmousemove = getCoords;

    // // execute a function when click
    // document.getElementById(elementids[i]).onclick = function () {
    //   document.getElementById("regcoords_xy").value = x + " , " + y;
    //   document.getElementById("regcoords_gamma").value =
    //     gamma_rad.toFixed(2) + "(rad) , " + gamma_mag.toFixed(2) + "(mag)";
  }
}
// }
// //query selector searches for the first html element in the document body matching the passed in name.
// let sampleEle = document.querySelector(".sample");
// //addEventListener causes the  run each time "mousemove" occurs
// //by using sampleEle.innerHTML=... the inner contents of the html tag referenced by sampleEle is set to whatever is added to the right hand equation
// document.body.addEventListener("mousemove", (event) => {
//   sampleEle.innerHTML = "X axis: " + event.x + " Y axis: " + event.y;
// });

//#endregion ========================================================================================

//#region =========================================Adding Points==============================================

//https://codeboxsystems.com/tutorials/en/how-to-drag-and-drop-objects-javascript-canvas/
// 1. Detect when the user presses down
// 2. If the coordinates fall within the bounds of a shape, set isDragging to true
// 3. If the user moves the mouse/touch before releasing, update the position of the shape to match the mouse/touch coordinates
// 4. If the user releases, set isDragging for all shapes to false

const circle = {
  xCent: 0,
  yCent: 0,
  x: 0,
  y: 0,
  size: 6,
  dragging: false,
  new: true,
  gamma_rad: 0,
  gamma_mag: 0,
};

function drawCircle() {
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.size, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();
}

//Takes in current s11, last s11, and the tangent point (enter -1 for left edge and 1 for right edge) to calculate the radius of the constant resistance/admittance arc
function drawArc(currentComponent, lastComponent) {
  let xInvert = 0;
  let y1Sign = 0;
  let y2Sign = 0;
  let counterClockwise = false;

  if (currentComponent.id.includes("series")) {
    //Used to correct for constant resistance arc being tangent to (-/+Boundary Radius,0)
    xInvert = 1;
  } else {
    xInvert = -1;
  }

  const p1 = [
    lastComponent.cktS11[frequencyIndex].re * boundaryRadius,
    lastComponent.cktS11[frequencyIndex].im * boundaryRadius,
  ];
  const p2 = [
    currentComponent.cktS11[frequencyIndex].re * boundaryRadius,
    currentComponent.cktS11[frequencyIndex].im * boundaryRadius,
  ];

  const p3 = [xInvert * boundaryRadius, 0];
  const x1 = p1[0]; //Last component x coord
  const y1 = p1[1]; //Last component y coord
  const x2 = p2[0]; //Current component x coord
  const y2 = p2[1]; //Current component y coord
  let x3 = p3[0]; //x coord of constant impedance/admittance xInvert point along the im=0 axis
  let y3 = p3[1]; //y coord of constant impedance/admittance xInvert point along the im=0 axis

  if (y1 < 0) {
    y1Sign = -1;
  } else {
    y1Sign = 1;
  }
  if (y2 < 0) {
    y2Sign = -1;
  } else {
    y2Sign = 1;
  }

  if (currentComponent.id.includes("transmissionLine")) {
    x3 = x2;
    y3 = -y2;
  }

  //Equation for circle given three points source:
  //https://math.stackexchange.com/questions/213658/get-the-equation-of-a-circle-when-given-3-points
  const A = x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2;
  const B =
    (x1 ** 2 + y1 ** 2) * (y3 - y2) +
    (x2 ** 2 + y2 ** 2) * (y1 - y3) +
    (x3 ** 2 + y3 ** 2) * (y2 - y1);
  const C =
    (x1 ** 2 + y1 ** 2) * (x2 - x3) +
    (x2 ** 2 + y2 ** 2) * (x3 - x1) +
    (x3 ** 2 + y3 ** 2) * (x1 - x2);
  const D =
    (x1 ** 2 + y1 ** 2) * (x3 * y2 - x2 * y3) +
    (x2 ** 2 + y2 ** 2) * (x1 * y3 - x3 * y1) +
    (x3 ** 2 + y3 ** 2) * (x2 * y1 - x1 * y2);

  const width = document.getElementById("smithchart").width;
  const height = document.getElementById("smithchart").height;
  const xc = -B / (2 * A); //X coordinate of the center of the constant resistance/admittance arc (Relative to center of smith chart)
  const yc = -C / (2 * A); //Y coordinate of the center of the constant resistance/admittance arc(Relative to center of smith chart)

  const xcTopLeft = xc + document.getElementById("smithchart").width / 2;
  const ycTopLeft = -yc + document.getElementById("smithchart").height / 2;

  const xZeroTopLeft = document.getElementById("smithchart").width / 2;
  const yZeroTopLeft = document.getElementById("smithchart").height / 2;

  let r = ((B ** 2 + C ** 2 - 4 * A * D) / (4 * A ** 2)) ** 0.5;

  ctx.strokeStyle = "green";
  ctx.lineWidth = 2;

  if (currentComponent.id.includes("Resistor")) {
    const x1TopLeft = x1 + document.getElementById("smithchart").width / 2;
    const y1TopLeft = y1 + document.getElementById("smithchart").height / 2;
    const x2TopLeft = x2 + document.getElementById("smithchart").width / 2;
    const y2TopLeft = y2 + document.getElementById("smithchart").height / 2;

    if (Math.abs(y1) < 1e-8) {
      ctx.beginPath();
      ctx.moveTo(x1TopLeft, y1TopLeft);
      ctx.lineTo(x2TopLeft, y2TopLeft);
      ctx.stroke();
    } else {
      const xOuter = x3;
      const yOuter = 0;

      const d1 = math.sqrt((xOuter - x1) ** 2 + (yOuter - y1) ** 2); //Distance between p1 and p3
      const d2 = math.sqrt((xOuter - x2) ** 2 + (yOuter - y2) ** 2); //Distance between p1 and p2

      if (currentComponent.id.includes("series")) {
        if (y1 < 0) {
          counterClockwise = false;
        } else {
          counterClockwise = true;
        }
        const lastComponentAngle =
          -y1Sign * ((3 * Math.PI) / 2 - 2 * Math.asin(d1 / (2 * r)));
        const currentComponentAngle =
          -y1Sign * ((3 * Math.PI) / 2 - 2 * Math.asin(d2 / (2 * r)));
        ctx.beginPath();
        ctx.arc(
          xcTopLeft,
          ycTopLeft,
          r,
          lastComponentAngle,
          currentComponentAngle,
          counterClockwise
        );
        ctx.stroke();
      } else if (currentComponent.id.includes("shunt")) {
        if (y1 < 0) {
          counterClockwise = true;
        } else {
          counterClockwise = false;
        }
        const lastComponentAngle =
          y1Sign * (Math.PI / 2 - 2 * Math.asin(d1 / (2 * r)));
        const currentComponentAngle =
          y1Sign * (Math.PI / 2 - 2 * Math.asin(d2 / (2 * r)));

        ctx.beginPath();
        ctx.arc(
          xcTopLeft,
          ycTopLeft,
          r,
          lastComponentAngle,
          currentComponentAngle,
          counterClockwise
        );
        ctx.stroke();
      }
    }
  } else if (currentComponent.id.includes("transmissionLine")) {
    r = math.sqrt((x1 - xc) ** 2 + (y1 - yc) ** 2); //radius from TL arc center (Calculated using ABCD)
    const d1 = math.sqrt((x1 - xc - r) ** 2 + (y1 - yc) ** 2); //Distance between p1 (center) and p3
    const d2 = math.sqrt((x2 - xc - r) ** 2 + (y2 - yc) ** 2); //Distance between p1 (center) and p3
    const d3 = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5; //Distance between p1 and p2
    let arcAngle = 0;
    let startAngle = 0;
    let endAngle = 0;

    const lastComponentAngle = y1Sign * 2 * Math.asin(d1 / (2 * r));
    const currentComponentAngle = y2Sign * 2 * Math.asin(d2 / (2 * r));

    const relativeAngle = currentComponentAngle - lastComponentAngle;

    startAngle = -lastComponentAngle;
    endAngle = startAngle - relativeAngle;

    ctx.beginPath();
    ctx.arc(xcTopLeft, ycTopLeft, r, startAngle, endAngle, counterClockwise);
    ctx.stroke();
  } else {
    const xOuter = x3;
    const yOuter = 0;
    const xInner = p3[0] - xInvert * 2 * r; //Intercept will be used to calculate startAngle (Angle from 0 radians, which occurs on the x axis)
    const yInner = 0;

    const d1 = math.sqrt((x1 - xInner) ** 2 + y1 ** 2); //Distance between p1 and p3
    const d2 = math.sqrt((x2 - xInner) ** 2 + y2 ** 2); //Distance between p1 and p3
    const d3 = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5; //Distance between p1 and p2

    let startAngle = 0;
    let endAngle = 0;

    const lastComponentAngle = y1Sign * 2 * Math.asin(d1 / (2 * r)); //Since d1 and r are both positive y1Sign is used to give the angle a sign
    const currentComponentAngle = y2Sign * 2 * Math.asin(d2 / (2 * r)); //Since d2 and r are both positive y1Sign is used to give the angle a sign
    const relativeAngle = currentComponentAngle - lastComponentAngle; //Obtaining the relative able by adding the current and last component values prevents issues that arise when the angle between two points is greater than 180 degrees (asin is only defined up to 180 deg). This is not an issue with this calculation since  currentComponentAngle and lastComponentAngle have a maximum of 180deg
    if (currentComponent.id.includes("series")) {
      if (currentComponent.id.includes("Capacitor")) {
        counterClockwise = true;
      }
      startAngle = lastComponentAngle + Math.PI;
      endAngle = startAngle + relativeAngle;
    } else if (
      currentComponent.id.includes("shunt") ||
      currentComponent.id.includes("Stub")
    ) {
      if (currentComponent.id.includes("Inductor")) {
        counterClockwise = true;
      }

      startAngle = -lastComponentAngle;
      endAngle = startAngle - relativeAngle;
    }

    ctx.beginPath();
    ctx.arc(xcTopLeft, ycTopLeft, r, startAngle, endAngle, counterClockwise);
    ctx.stroke();
  }
}
let lastDist = Infinity;

//Iterating is used to prevent repetitive calculations from being performed when they are not necessary for each iteration where points are not being plotted
let iterating = false;
function getElapsedTime(string) {
  currentTime = performance.now();
}
let currentTime = performance.now();

function update(component) {
  currentTime = performance.now();

  const lastX = x;
  const lastY = y;
  const lastcktX = component.cktX[lowestFrequencyIndex];
  const lastcktY = component.cktY[lowestFrequencyIndex];

  let originalDist = calcDistance(); //Original distance
  let incUpDist = 0;
  let incDownDist = 0;

  let deltaIncDist = 0; //How much distance was closed by one increment. Will be used as feedback to adjust scale
  const deltaIncLimit = 0.01;
  const originalIncrementScale = 1;
  let incrementScale = originalIncrementScale;
  let incrementStep = 0.1;
  //Setting the field variable determines which input field will be adjusted on drag (z for RLC and length for tline and stubs)

  let field = component.querySelectorAll("input[type=text]")[0];
  const scale = component.querySelectorAll("select")[0].value;
  let scaledValue = field.value * scale;
  let maxValue = 10000; //Minimum value for which components can be set by dragging
  let minValue = 0.0; //Maximum value for which components can be set by dragging

  if (component.id.includes("Stub")) {
    const unitScaleFactor = component.querySelectorAll("select")[1].value;
    field = component.querySelectorAll("input[type=text]")[1];
    maxValue = wavelengths[lowestFrequencyIndex] / 4 / unitScaleFactor / 10; //Sets max to 1/4 wavelength (multiplied by 10 to convert from m to cm)
    incrementStep = maxValue / 100;
  } else if (component.id.includes("transmissionLine")) {
    const unitScaleFactor = component.querySelectorAll("select")[1].value;
    field = component.querySelectorAll("input[type=text]")[1];
    maxValue = wavelengths[lowestFrequencyIndex] / 2 / unitScaleFactor / 10; //Sets max to 1/2 wavelength
    incrementStep = maxValue / 400;
  } else if (component.id.includes("Resistor")) {
    maxValue = 1000 / scale;
    minValue = 0.1 / scale;
    incrementStep = (0.02 * scaledValue) / scale;
  } else if (component.id.includes("Capacitor")) {
    //Setting max, min and increment step based on frequency and scale keeps these values proportional to the impedance of the inductor when frequency or units are changed
    maxValue = 1 / omegaArray[lowestFrequencyIndex] / scale;
    minValue = (5 * 0.0001) / omegaArray[lowestFrequencyIndex] / scale;
    incrementStep =
      10 * omegaArray[lowestFrequencyIndex] * scaledValue * minValue;
  } else if (component.id.includes("Inductor")) {
    //Setting max, min and increment step based on frequency and scale keeps these values proportional to the impedance of the inductor when frequency or units are changed
    maxValue = 1000 / omegaArray[lowestFrequencyIndex] / scale;
    minValue = 1 / omegaArray[lowestFrequencyIndex] / scale;
    incrementStep =
      0.01 * scaledValue * minValue * omegaArray[lowestFrequencyIndex];
  }
  //Storing the original increment step so that the increment step can be returned to it's original value after scaling
  const originalIncrementStep = incrementStep;
  function calcDistance() {
    return math.sqrt(
      (component.cktX[lowestFrequencyIndex] - lastX) ** 2 +
        (component.cktY[lowestFrequencyIndex] - lastY) ** 2
    );
  }
  //Manual increment up and down by 0.1 Beelow
  function checkIncUp() {
    let closer = false;
    let originalValue = parseFloat(field.value);
    field.value = originalValue + incrementStep; //Increment up

    updateComponentArraysLoop();
    incUpDist = calcDistance();
    if (incUpDist < originalDist && parseFloat(field.value) < maxValue) {
      closer = true;
    }
    field.value = originalValue;
    updateComponentArraysLoop();
    return closer;
  }
  function checkIncDown() {
    let closer = false;
    let originalValue = parseFloat(field.value);
    field.value = originalValue - incrementStep; //Increment up
    updateComponentArraysLoop();
    incDownDist = calcDistance();
    if ((incDownDist < originalDist) & (parseFloat(field.value) > minValue)) {
      closer = true;
    }
    field.value = originalValue;
    updateComponentArraysLoop();
    return closer;
  }
  //Increments component up loop
  function incrementUp() {
    let originalValue = parseFloat(field.value);
    field.value = parseFloat(field.value) + incrementStep; //Increment up
    updateComponentArray();
    incUpDist = calcDistance();
    deltaIncDist = originalDist - incUpDist;
    originalDist = calcDistance();
    return incUpDist;
    //Check new distance
  }
  //Increments component up loop
  function incrementDown() {
    let originalValue = parseFloat(field.value);
    field.value = parseFloat(field.value) - incrementStep; //Increment down
    updateComponentArray();
    incDownDist = calcDistance();
    deltaIncDist = originalDist - incDownDist;
    originalDist = calcDistance();
    //Check new distance
  }
  //Checks if component value is currently negative
  function checkPositive() {
    return parseFloat(field.value) > 0;
  }
  let down = checkIncDown();
  let up = checkIncUp();

  // let constant = !(up || down);
  // let conflict = up && down;
  let i = 0;
  getElapsedTime("Start Loop: ");

  //This function increases step size exponentially. This is used to minimize number of iterations
  function updateIncrementStep() {
    incrementScale = incrementScale * 1.3;
    incrementStep = originalIncrementStep * incrementScale;
  }
  //This function iterates a component value up until overcorrection occurs
  function upLoop() {
    iterating = true;
    for (let i = 0; i < 100; i++) {
      incrementUp();
      up = checkIncUp();
      updateIncrementStep();
      if (up == false) {
        i = 100;
      }
    }
    iterating = false;
    incrementStep = originalIncrementStep;
  }
  //This function iterates a component value down until overcorrection occurs

  function downLoop() {
    iterating = true;
    for (let i = 0; i < 100; i++) {
      incrementDown();
      down = checkIncDown();
      updateIncrementStep();
      if (down == false) {
        i = 100;
      }
    }
    iterating = false;
    incrementStep = originalIncrementScale;
  }

  if (up) {
    upLoop();
  } else if (down) {
    downLoop();
  }
  getElapsedTime("End Loop: ");
  updateComponentArraysLoop();

  //This block updates the load by directly setting the input values equal to the impedance of the mouse position over the smith chart
  //See https://leleivre.com/rf_gammatoz.html for equation source

  if (draggingComponent.classList.contains("buffer")) {
    const scaledGammaMag = gamma_mag / 1.04; //Scaled to undo scaling done in graph creation
    let z = math.multiply(
      zs,
      math.divide(
        math.add(1, math.complex({ r: scaledGammaMag, phi: gamma_rad })),
        math.add(
          1,
          math.unaryMinus(math.complex({ r: scaledGammaMag, phi: gamma_rad }))
        )
      )
    );
    componentArray[0].querySelectorAll("input[type=text]")[0].value = z.re;
    componentArray[0].querySelectorAll("input[type=text]")[1].value = z.im;
  }
  getElapsedTime("End Update Function: ");
}

//==================================================DRAGGING================================
let draggingComponent = componentArray[0];
// If coordinates fall on existing dot then set dragging=true and update coordinates on mousemove
//lowestComponentIndex and lowestFrequencyIndex are both set when the mouse is clicked. These parameters can then be used to specify which component and frequency point to drag
let lowestComponentIndex = 1;
let lowestFrequencyIndex = 0;

document.getElementById("smithchart").addEventListener("mousedown", (event) => {
  lowestComponentIndex = 1;
  lowestFrequencyIndex = 0;
  //initialize dist as an array and initialize with inifinity to ensure any distance will be the new closest when compared with default values
  let dist = [
    [Infinity, Infinity, Infinity],
    [Infinity, Infinity, Infinity],
  ];

  // if (componentArray.length > 4) {
  //Top Loop iterates throughout each component

  for (
    let componentIndex = 1;
    componentIndex <= componentArray.length - 3;
    componentIndex++
  ) {
    //Component loop
    dist[componentIndex] = [Infinity, Infinity, Infinity]; //Sets default values to infinity so that any new point on the smith chart will be the closest when checked against it

    //Bottom loop iterates through each frequency for said component and adds the corrseponding x/y coordinates of each component into an array (cktX, cktY). It also logs the frequency specific distance for each component into an array where the index corresponds to the frequency simulated
    for (
      //frequency loop
      let localFrequencyIndex = 0;
      localFrequencyIndex < omegaArray.length;
      localFrequencyIndex++
    ) {
      dist[componentIndex][localFrequencyIndex] = Math.sqrt(
        (componentArray[componentIndex].cktX[localFrequencyIndex] - x) ** 2 +
          (componentArray[componentIndex].cktY[localFrequencyIndex] - y) ** 2
      );

      if (
        dist[componentIndex][localFrequencyIndex] <
        dist[lowestComponentIndex][lowestFrequencyIndex]
      ) {
        lowestComponentIndex = componentIndex;
        lowestFrequencyIndex = localFrequencyIndex;
      }
    }
  }
  if (
    dist[lowestComponentIndex][lowestFrequencyIndex] <=
    componentArray[lowestComponentIndex].size
  ) {
    draggingComponent = componentArray[lowestComponentIndex];
    draggingComponent.s11Dragging = true;
  } else {
    draggingComponent.s11Dragging = false;
  }
});

document.addEventListener("mousemove", (event) => {
  if (draggingComponent.s11Dragging === true) {
    update(draggingComponent);
  }
});
document.body.addEventListener("mouseup", (event) => {
  draggingComponent.s11Dragging = false;
});
function plotS11(s11) {
  let x = s11.re * boundaryRadius;
  let y = s11.im * boundaryRadius;
  circle.x = x + canvasW / 2;
  circle.y = -y + canvasH / 2;
  circle.gamma_mag = gamma_mag;
  circle.gamma_rad = gamma_rad;
  drawCircle();
  drawSmith();
}

function drawPoint(component) {
  ctx.beginPath();
  ctx.arc(component.x, component.y, component.size, 0, Math.PI * 2);
  ctx.fillStyle = component.color;
  ctx.fill();
}
//plots points from element 1 to last element in array
function plotPoints(componentArray) {
  if (firstFrequency) {
    ctx.clearRect(0, 0, canvasW, canvasH); //Clears previous points
  }
  if (typeof componentArray !== "undefined") {
    //If statement prevents code from running before initialization which will cause errors
    for (let i = 1; i < componentArray.length - 1; i++) {
      let component = componentArray[i];
      if (i === 1 || componentArray.length === 4) {
        component.color = "red";
      } else if (i == componentArray.length - 2) {
        //Plots the impedance of the second buffer block as yellow
        component.color = "yellow";
      } else {
        //Sets color for all elements skipping the second buffer to avoid redundant points
        // component.color = "rgb(100, 100, 100)";
        component.color = "rgb(0," + i * 30 + ",0)";
        // component.color = "green";
      }
      component.size = 6;
      component.xCent = component.cktS11[frequencyIndex].re * boundaryRadius;
      component.yCent = component.cktS11[frequencyIndex].im * boundaryRadius;
      component.x = component.xCent + canvasW / 2;
      component.y = -component.yCent + canvasH / 2;

      component.gamma_mag;
      component.gamma_rad;
      drawPoint(component);
    }
  }
  drawSmith(); //Redraws smith chart after clearRect at top of function removes it
}
//#endregion

//#region =========================================RF Logic===================================================
//Notes:
//Work entirely off of div objects and follow python code as closely as possible
//Each component has z1 and z2 property

//calculates Z and Length of given component and adds it as a property of the component
function calcZLen(component) {
  const value = component.querySelectorAll("input[type=text]")[0].value; //returns input field. Use .value to change
  const scale = component.querySelectorAll("select")[0].value; //returns scale factor. Use .value to change

  let len = 0;
  let z = 0;
  let gamma = 0;
  let beta = 0;

  if (component.id.includes("Inductor")) {
    z = math.complex(0, omegaArray[frequencyIndex] * value * scale);
  } else if (component.id.includes("Capacitor")) {
    z = math.complex(0, -1 / (omegaArray[frequencyIndex] * value * scale));
  } else if (
    component.id.includes("Resistor") ||
    component.id.includes("source")
  ) {
    z = value * scale;
  } else if (
    component.id.includes("transmissionLine") ||
    component.id.includes("Stub")
  ) {
    const lenValue = component.querySelectorAll("input[type=text]")[1].value;
    const lenScale = component.querySelectorAll("select")[1].value;
    z = value * scale;
    len = lenValue * lenScale * 10;
    component.len = len * 10; //Length in cm
    component.beta[frequencyIndex] = omegaArray[frequencyIndex] / vLight;
    component.gamma[frequencyIndex] = math.complex(
      0,
      component.beta[frequencyIndex]
    );
  } else if (component.id.includes("load")) {
    const reactance = component.querySelectorAll("input[type=text]")[1].value;
    const reactanceScale = component.querySelectorAll("select")[1].value;

    z = math.complex(value * scale, reactance * reactanceScale);
  }
  component.z = z;
  component.len = len;
}
function tparToSpar(ntwk_tpar) {
  const ntwk_t11 = ntwk_tpar[0][0];
  const ntwk_t12 = ntwk_tpar[0][1];
  const ntwk_t21 = ntwk_tpar[1][0];
  const ntwk_t22 = ntwk_tpar[1][1];

  const s11 = math.complex(math.divide(ntwk_t12, ntwk_t22));
  const s12 = math.divide(
    math.add(ntwk_t11, math.multiply(ntwk_t12, ntwk_t21)),
    ntwk_t22
  );
  const s21 = math.divide(1, ntwk_t22);
  const s22 = math.divide(math.unaryMinus(ntwk_t21), ntwk_t22);

  const spar = [
    [s11, s12],
    [s21, s22],
  ];
  return spar;
}
function sparToTPar(twoPortNetwork) {
  const spar = twoPortNetwork.spar[frequencyIndex];
  const s11 = spar[0][0];
  const s12 = spar[0][1];
  const s21 = spar[1][0];
  const s22 = spar[1][1];

  //complex number compatible arithmetic

  twoPortNetwork.t11[frequencyIndex] = math.divide(
    math.multiply(-1, math.det(spar)),
    s21
  );
  twoPortNetwork.t12[frequencyIndex] = math.divide(s11, s21);
  twoPortNetwork.t21[frequencyIndex] = math.divide(math.multiply(-1, s22), s21);
  twoPortNetwork.t22[frequencyIndex] = math.divide(1, s21);

  twoPortNetwork.tpar[frequencyIndex] = [
    [twoPortNetwork.t11[frequencyIndex], twoPortNetwork.t12[frequencyIndex]],
    [twoPortNetwork.t21[frequencyIndex], twoPortNetwork.t22[frequencyIndex]],
  ];
}
let s11 = 0;
let ntwk_tpar = [];
let iter = 0;

function rfLogic() {
  if (initialized === true) {
    //Loops through each component div object and asigns s and t parameters to each block
    //spar and tpar for tline stub and source/load blocks still needed
    calcZLen(componentArray[componentArray.length - 1]); //gets z for source
    calcZLen(componentArray[0]); //gets z for load

    zl = componentArray[0].z; //Sets load impedance equal to value div block value
    zs = componentArray[componentArray.length - 1].z; //Sets source impedance equal to value div block value

    for (let i = 0; i < componentArray.length; i++) {
      //return z, len
      let component = componentArray[i]; //sets component equal to current div block starting from left
      // Set z1 and z2 of each block according to it's position in the stack
      if (i === componentArray.length - 2) {
        component.z1 = zs;
      } else {
        component.z1 = zs;
      }
      if (i === 1) {
        component.z2 = zl;
      } else {
        component.z2 = zs;
      }

      calcZLen(component);
      const z = component.z;
      const len = component.len;
      const gamma = component.gamma[frequencyIndex];
      const beta = component.beta[frequencyIndex];
      const z1 = component.z1;
      const z2 = component.z2;

      if (component.id.includes("transmissionLine")) {
        const A = math.cosh(
          math.multiply(component.gamma[frequencyIndex], component.len)
        );
        const B = math.multiply(
          z,
          math.sinh(
            math.multiply(component.gamma[frequencyIndex], component.len)
          )
        );
        const C = math.divide(
          math.sinh(
            math.multiply(component.gamma[frequencyIndex], component.len)
          ),
          z
        );
        const D = math.cosh(
          math.multiply(component.gamma[frequencyIndex], component.len)
        );
        //Equation for center from: https:eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/Microwave_and_RF_Design_III_-_Networks_(Steer)/03%3A_Chapter_3/3.05%3A_Section_5-

        component.s11[frequencyIndex] = math.divide(
          math.add(
            math.add(B, math.multiply(math.unaryMinus(C), z1, z2)),
            math.add(
              math.multiply(A, z2),
              math.multiply(math.unaryMinus(D), z1)
            )
          ),
          math.add(
            math.add(B, math.multiply(C, z1, z2)),
            math.add(math.multiply(A, z2), math.multiply(D, z2))
          )
        );
        component.s12[frequencyIndex] = math.divide(
          math.multiply(
            2,
            z1,
            math.add(math.multiply(A, D), math.multiply(math.unaryMinus(B), C))
          ),
          math.add(
            B,
            math.multiply(C, z1, z2),
            math.add(math.multiply(A, z2), math.multiply(D, z2))
          )
        );
        component.s21[frequencyIndex] = math.divide(
          math.multiply(2, z2),
          math.add(
            B,
            math.multiply(C, z1, z2),
            math.add(math.multiply(A, z2), math.multiply(D, z2))
          )
        );
        component.s22[frequencyIndex] = math.divide(
          math.add(
            B,
            math.multiply(math.unaryMinus(C), z1, z2),
            math.unaryMinus(
              math.add(
                math.multiply(A, z2),
                math.multiply(math.unaryMinus(D), z1)
              )
            )
          ),
          math.add(
            B,
            math.multiply(C, z1, z2),
            math.add(math.multiply(A, z2), math.multiply(D, z2))
          )
        );
        component.spar[frequencyIndex] = [
          [component.s11[frequencyIndex], component.s12[frequencyIndex]],
          [component.s21[frequencyIndex], component.s22[frequencyIndex]],
        ];
        sparToTPar(component); //Function adds tpar property to the passed in block
      } else if (component.id.includes("openStub")) {
        component.zstub = math.complex(
          0,
          math.divide(
            math.unaryMinus(z),
            math.tan(
              math.multiply(component.beta[frequencyIndex], component.len)
            )
          )
        );
        const z_open = component.zstub;
        const y = math.divide(1, z_open);
        const y1 = math.divide(1, z1);
        const y2 = math.divide(1, z2);
        const ds = math.add(y, y1, y2);
        const dt = math.multiply(2, math.pow(math.multiply(y1, y2), 0.5));
        //Initializing sparameters as an empty array so that spars can be set according to frequency index

        component.s11[frequencyIndex] = math.divide(
          math.add(y1, math.unaryMinus(y2), math.unaryMinus(y)),
          ds
        );
        component.s12[frequencyIndex] = math.divide(
          math.pow(math.multiply(2, y1, y2), 0.5),
          ds
        );
        component.s21[frequencyIndex] = math.divide(
          math.multiply(2, math.pow(math.multiply(y1, y2), 0.5)),
          ds
        );
        component.s22[frequencyIndex] = math.divide(
          math.add(y2, math.unaryMinus(y1), math.unaryMinus(y)),
          ds
        );
        component.spar[frequencyIndex] = [
          [component.s11[frequencyIndex], component.s12[frequencyIndex]],
          [component.s21[frequencyIndex], component.s22[frequencyIndex]],
        ];
        component.t11[frequencyIndex] = math.divide(
          math.add(y1, y2, math.unaryMinus(y)),
          dt
        );
        component.t12[frequencyIndex] = math.divide(
          math.add(y1, math.unaryMinus(y2), math.unaryMinus(y)),
          dt
        );
        component.t21[frequencyIndex] = math.divide(
          math.add(y1, math.unaryMinus(y2), y),
          dt
        );
        component.t22[frequencyIndex] = math.divide(math.add(y1, y2, y), dt);

        component.tpar[frequencyIndex] = [
          [component.t11[frequencyIndex], component.t12[frequencyIndex]],
          [component.t21[frequencyIndex], component.t22[frequencyIndex]],
        ];
      } else if (component.id.includes("shortStub")) {
        component.zstub = math.complex(
          0,

          z * math.tan(component.beta[frequencyIndex] * component.len)
        );
        const z_sc = component.zstub;
        const y = math.divide(1, z_sc);
        const y1 = math.divide(1, z1);
        const y2 = math.divide(1, z2);
        const ds = math.add(y, y1, y2);
        const dt = math.multiply(2, math.pow(math.multiply(y1, y2), 0.5));

        component.s11[frequencyIndex] = math.divide(
          math.add(y1, math.unaryMinus(y2), math.unaryMinus(y)),
          ds
        );
        component.s12[frequencyIndex] = math.divide(
          math.pow(math.multiply(2, y1, y2), 0.5),
          ds
        );
        component.s21[frequencyIndex] = math.divide(
          math.multiply(2, math.pow(math.multiply(y1, y2), 0.5)),
          ds
        );
        component.s22[frequencyIndex] = math.divide(
          math.add(y2, math.unaryMinus(y1), math.unaryMinus(y)),
          ds
        );
        component.spar[frequencyIndex] = [
          [component.s11[frequencyIndex], component.s12[frequencyIndex]],
          [component.s21[frequencyIndex], component.s22[frequencyIndex]],
        ];
        component.t11[frequencyIndex] = math.divide(
          math.add(y1, y2, math.unaryMinus(y)),
          dt
        );
        component.t12[frequencyIndex] = math.divide(
          math.add(y1, math.unaryMinus(y2), math.unaryMinus(y)),
          dt
        );
        component.t21[frequencyIndex] = math.divide(
          math.add(y1, math.unaryMinus(y2), y),
          dt
        );
        component.t22[frequencyIndex] = math.divide(math.add(y1, y2, y), dt);

        component.tpar[frequencyIndex] = [
          [component.t11[frequencyIndex], component.t12[frequencyIndex]],
          [component.t21[frequencyIndex], component.t22[frequencyIndex]],
        ];
      } else if (
        component.id.includes("series") ||
        component.id.includes("source") ||
        component.id.includes("load")
      ) {
        const ds = math.add(z, z1, z2);

        component.s11[frequencyIndex] = math.divide(
          math.add(z, z2, math.unaryMinus(z1)),
          ds
        );

        component.s12[frequencyIndex] = math.divide(
          math.multiply(2, math.pow(math.multiply(z1, z2), 0.5)),
          ds
        );
        component.s21[frequencyIndex] = math.divide(
          math.multiply(2, math.pow(math.multiply(z1, z2), 0.5)),
          ds
        );
        component.s22[frequencyIndex] = math.divide(
          math.add(z, z1, math.unaryMinus(z2)),
          ds
        );
        component.spar[frequencyIndex] = [
          [component.s11[frequencyIndex], component.s12[frequencyIndex]],
          [component.s21[frequencyIndex], component.s22[frequencyIndex]],
        ];

        sparToTPar(component); //Function adds tpar property to the passed in block
      } else if (component.id.includes("shunt")) {
        //Complex # compatible
        const y = math.divide(1, z);
        const y1 = math.divide(1, z1);
        const y2 = math.divide(1, z2);
        const ds = math.add(y, y1, y2);
        const dt = math.multiply(2, math.pow(math.multiply(y1, y2), 0.5));

        component.s11[frequencyIndex] = math.divide(
          math.add(y1, math.unaryMinus(y2), math.unaryMinus(y)),
          ds
        );
        component.s12[frequencyIndex] = math.divide(
          math.pow(math.multiply(2, y1, y2), 0.5),
          ds
        );
        component.s21[frequencyIndex] = math.divide(
          math.multiply(2, math.pow(math.multiply(y1, y2), 0.5)),
          ds
        );
        component.s22[frequencyIndex] = math.divide(
          math.add(y2, math.unaryMinus(y1), math.unaryMinus(y)),
          ds
        );
        component.spar[frequencyIndex] = [
          [component.s11[frequencyIndex], component.s12[frequencyIndex]],
          [component.s21[frequencyIndex], component.s22[frequencyIndex]],
        ];

        component.t11[frequencyIndex] = math.divide(
          math.add(y1, y2, math.unaryMinus(y)),
          dt
        );
        component.t12[frequencyIndex] = math.divide(
          math.add(y1, math.unaryMinus(y2), math.unaryMinus(y)),
          dt
        );
        component.t21[frequencyIndex] = math.divide(
          math.add(y1, math.unaryMinus(y2), y),
          dt
        );
        component.t22[frequencyIndex] = math.divide(math.add(y1, y2, y), dt);

        component.tpar[frequencyIndex] = [
          [component.t11[frequencyIndex], component.t12[frequencyIndex]],
          [component.t21[frequencyIndex], component.t22[frequencyIndex]],
        ];
      }
    }

    //Iterate through each component, cascade t parameters and convert back to S parameters to plot
    ntwk_tpar[frequencyIndex] = componentArray[1].tpar[frequencyIndex];

    componentArray[1].cktS11 = [];
    componentArray[1].cktS11[frequencyIndex] = tparToSpar(
      ntwk_tpar[frequencyIndex]
    )[0][0];

    for (let i = 0; i <= componentArray.length - 3; i++) {
      ntwk_tpar[frequencyIndex] = math.multiply(
        componentArray[i + 2].tpar[frequencyIndex],
        ntwk_tpar[frequencyIndex]
      );
      componentArray[i + 2].cktS11[frequencyIndex] = tparToSpar(
        ntwk_tpar[frequencyIndex]
      )[0][0];
    }
    const spar = tparToSpar(ntwk_tpar[frequencyIndex]);
    s11 = spar[0][0];

    plotPoints(componentArray);

    //cktX and cktY denote the XY coordinates (measured from the center of the smith chart) of each point on the circuit. For use in point dragging and selecting
    for (let i = 1; i <= componentArray.length - 2; i++) {
      drawArc(componentArray[i + 1], componentArray[i]);

      componentArray[i].cktX[frequencyIndex] =
        componentArray[i].cktS11[frequencyIndex].re * boundaryRadius;
      componentArray[i].cktY[frequencyIndex] =
        componentArray[i].cktS11[frequencyIndex].im * boundaryRadius;
    }
    if (!iterating) {
      displayS11(frequencyIndex);
    }
    clearReflectionChart();
    const freqArrayLength =
      componentArray[componentArray.length - 2].cktS11.length;
    for (let i = 0; i < freqArrayLength; i++) {
      const reflectedWave =
        componentArray[componentArray.length - 2].cktS11[i].toPolar();
      const reflectedMag = reflectedWave.r;
      const reflectedRad = reflectedWave.phi;
      if (showReflection) {
        drawSineWave(0.9, 0, "red");
        drawSineWave(0.9 * reflectedMag, reflectedRad, "blue", true);
      }
    }
  }
}

//Converts s11 to XY coordinates scaled to fit on the smith chart
function s11ToXY(s11) {
  let r = s11.toPolar().r;
  let phi = s11.toPolar().phi;

  let x = (r * boundaryRadius) / 2 / Math.sin(phi);
  let y = (r * boundaryRadius) / 2 / Math.cos(phi);
  return [x, y];
}

//#endregion ===========================================================================================

//#region =========================================Reflection Chart===========================================

let showReflection = false;
const reflectionChart = document.getElementById("reflectionChart");
const reflectionChartctx = reflectionChart.getContext("2d");
let reflectionChartWidth = reflectionChart.width;
let reflectionChartHeight = reflectionChart.height;
let reflectionChartCenterY = reflectionChart.height / 2;

function drawSineWave(scale, phase, color, clear) {
  const ctx = reflectionChartctx;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  let iter = 40;
  ctx.beginPath();

  for (let i = 0; i < iter; i++) {
    ctx.moveTo(
      (i / iter) * reflectionChartWidth,
      reflectionChartCenterY +
        scale *
          reflectionChartCenterY *
          math.sin((i / iter) * 4 * math.pi + phase)
    );
    ctx.lineTo(
      ((i + 1) / iter) * reflectionChartWidth,
      reflectionChartCenterY +
        scale *
          reflectionChartCenterY *
          math.sin(((i + 1) / iter) * 4 * math.pi + phase)
    );
  }
  ctx.stroke();
}
function clearReflectionChart() {
  reflectionChartctx.clearRect(
    0,
    0,
    reflectionChartWidth,
    reflectionChartHeight
  );
}

document
  .getElementById("showReflections")
  .addEventListener("click", function () {
    showReflection = !showReflection;
  });

//#endregion ===========================================================================================

//#region ========================================Load/Save Circuit===========================================

//#endregion =================================================================================================

//#region ===============================Debug/Window Event Listeners===================================

function resize() {
  document.getElementById("smithchart").width = document.getElementById(
    "smithchartContainer"
  ).clientWidth;

  document.getElementById("smithchart").height = document.getElementById(
    "smithchartContainer"
  ).clientWidth;
  boundaryRadius =
    (document.getElementById("smithchartContainer").clientWidth / 2) * 0.9;
  centerX = document.getElementById("smithchart").width / 2;
  centerY = document.getElementById("smithchart").height / 2;
  canvasW = document.getElementById("smithchart").width;
  canvasH = document.getElementById("smithchart").height;
  smithLeftEdge = centerX - boundaryRadius;
  smithRightEdge = centerX + boundaryRadius;

  updateReactanceLabels();
  updateCircRad();
  updatearcRad();
  updateFrequenciesArray();
  updateComponentArraysLoop();
}

document.addEventListener("keyup", function (event) {
  if (event.key == "k") {
    loadCktFromDataBase();
  }
  if (event.key == "j") {
    // jsonData = generateCktJson();
    saveCktData();
  }
  if (event.key == "l") {
    loadCkt(jsonData);
  }
  updateFrequenciesArray();
  updateComponentArraysLoop();
});

document.addEventListener("click", function () {
  refresh();
  resize();
});

initialized = true;
function refresh() {
  updateFrequenciesArray();
  updateComponentArraysLoop();
}
refresh();
resize();

loadCktFromDataBase();
//#endregion ===============================================================================================
