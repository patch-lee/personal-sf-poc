/* eslint-disable no-console */
import { api, LightningElement } from "lwc";
import BACKGROUND_IMAGE from '@salesforce/resourceUrl/test_image';

//declaration of variables for calculations
let isDownFlag,
  isDotFlag = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0;

let canvasElement, ctx; //storing canvas context
let scale = window.devicePixelRatio || 1;

export default class SignaturePad extends LightningElement {
  @api recordId;
  @api signatureFileName = 'InvoiceSignature.png';
  @api canvasWidth = '400';
  @api canvasHeight = '400';
  @api penStrokeThickness = 2.5;
  @api penStrokeColor = "#000000";
  @api title = 'Please sign here';
  @api saveButtonLabel = 'Save';
  @api clearButtonLabel = 'Clear';
  
  history = [];

  calculateWidth(maxWidth) {
    let requestWidth = 0;
    if (this.canvasWidth?.includes("%")) {
      const percent = +this.canvasWidth.replace("%", "");
      requestWidth = (maxWidth * percent) / 100;
    } else if (this.canvasWidth?.includes("px")) {
      requestWidth = +this.canvasWidth.replace("px", "");
    } else {
      requestWidth = +this.canvasWidth;
    }

    const width = requestWidth >= maxWidth ? maxWidth : requestWidth;
    return width;
  }

  calculateHeight(maxHeight) {
    let requestHeight = 0;
    if (this.canvasHeight?.includes("%")) {
      const percent = +this.canvasHeight.replace("%", "");
      requestHeight = (maxHeight * percent) / 100;
    } else if (this.canvasHeight?.includes("px")) {
      requestHeight = +this.canvasHeight.replace("px", "");
    } else {
      requestHeight = +this.canvasHeight;
    }

    // const height = requestHeight >= maxHeight ? maxHeight : requestHeight;
    const height = requestHeight;
    return height;
  }

  get scaledThickness() {
    return Math.floor(this.penStrokeThickness / scale);
  }

  //event listeners added for drawing the signature within shadow boundary
  constructor() {
    super();
    this.template.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this)
    );
    this.template.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this)
    );
    this.template.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.template.addEventListener("mouseout", this.handleMouseOut.bind(this));
    this.template.addEventListener(
      "touchmove",
      this.handleMouseMove.bind(this),
      false
    );
    this.template.addEventListener(
      "touchstart",
      this.handleMouseDown.bind(this),
      false
    );
  }

  //retrieve canvase and context
  renderedCallback() {
    canvasElement = this.template.querySelector("canvas");

    ctx = canvasElement.getContext("2d");

    const maxWidth = canvasElement.parentElement.clientWidth;
    const maxHeight = canvasElement.parentElement.clientHeight;

    const width = this.calculateWidth(maxWidth);
    const height = this.calculateHeight(maxHeight);

    canvasElement.style.width = width + "px";
    canvasElement.style.height = height + "px";

    // Set actual size in memory (scaled to account for extra pixel density).
    canvasElement.width = Math.floor(width * scale);
    canvasElement.height = Math.floor(height * scale);
    
    const background = new Image();
    background.src = BACKGROUND_IMAGE;
    
    background.onload = () => {
        ctx.drawImage(background, 0, 0, width, height);
        this.pushDrawHistory(true)
    }

    ctx.scale(scale, scale);

  }

  //handler for mouse move operation
  handleMouseMove(event) {
    this.searchCoordinatesForEvent("move", event, this.isTouchEvent(event));
  }

  //handler for mouse down operation
  handleMouseDown(event) {
    this.searchCoordinatesForEvent("down", event, this.isTouchEvent(event));
  }

  //handler for mouse up operation
  handleMouseUp(event) {
    this.searchCoordinatesForEvent("up", event, this.isTouchEvent(event));
  }

  //handler for mouse out operation
  handleMouseOut(event) {
    this.searchCoordinatesForEvent("out", event, this.isTouchEvent(event));
  }

  //clear the signature from canvas
  handleClearClick() {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }

  // handlePreviousClick() {
  //   this.dispatchEvent(new FlowNavigationBackEvent());
  // }

  searchCoordinatesForEvent(requestedEvent, event, isTouch) {
    event.preventDefault();
    event.stopPropagation();
    if (!['CANVAS', 'canvas', 'Canvas'].includes(event.target.tagName)) return
    
    if (isTouch) {
      const touchEvent = event?.touches?.[0];
      if (touchEvent) {
        event = { ...event, ...event?.touches?.[0] };
      }
    }
    if (requestedEvent === "down") {
      this.setupCoordinate(event);
      isDownFlag = true;
      isDotFlag = true;
      if (isDotFlag) {
        isDotFlag = false;
      }
    }
    if (requestedEvent === "up" || requestedEvent === "out") {
      this.pushDrawHistory()
      isDownFlag = false;
    }
    if (requestedEvent === "move") {
      if (isDownFlag) {
        this.setupCoordinate(event);
        this.redraw();
      }
    }
  }

  //This method is primary called from mouse down & move to setup cordinates.
  setupCoordinate(eventParam) {
    //get size of an element and its position relative to the viewport
    //using getBoundingClientRect which returns left, top, right, bottom, x, y, width, height.
    const clientRect = canvasElement.getBoundingClientRect();
    prevX = currX;
    prevY = currY;
    currX = eventParam.clientX - clientRect.left;
    currY = eventParam.clientY - clientRect.top;
  }

  //For every mouse move based on the coordinates line to redrawn
  redraw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = this.penStrokeColor; //sets the color, gradient and pattern of stroke
    ctx.lineWidth = this.scaledThickness;
    ctx.closePath(); //create a path from current point to starting point
    ctx.stroke(); //draws the path
  }

  //this draws the dot
  drawDot() {
    ctx.beginPath();
    ctx.fillStyle = this.penStrokeColor; // set color
    ctx.fillRect(currX, currY, this.scaledThickness, this.scaledThickness); //fill rectrangle with coordinates
    ctx.closePath();
  }

  pushDrawHistory(force) {
    if (isDownFlag || isDotFlag || force)  this.history.push(canvasElement.toDataURL())
    console.log(this.history);
  }

  // Check event type -> mouse or touch
  isTouchEvent = (event) => {
    return event?.type?.includes("touch");
  };

  handleSaveClick = () => {
    try {
      console.log(canvasElement)
      const link = document.createElement('a')
      console.log(link)
      link.href = canvasElement.toDataURL()
      link.download = 'testDrawOnImage.png'
  
      console.log(link.href)
      link.click()
      link.remove()
    } catch (e) {
      console.log(e)
    }
  }

  handleUndoClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const history = this.history
    const stepCount = this.history.length

    if (stepCount > 1) {
      const lastIndex = stepCount - 2
      console.log(lastIndex)
      const lastStepData = history[lastIndex]

      console.log(!!lastStepData)
      const image = new Image();
      image.src = lastStepData;

      image.onload = () => {
        console.log(ctx)
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.drawImage(image, 0, 0, canvasElement.width, canvasElement.height)
      };
      this.history = this.history.slice(0, stepCount - 1);
    }
  }
}