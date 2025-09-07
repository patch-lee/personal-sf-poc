import { api, LightningElement } from 'lwc';
import BACKGROUND_IMAGE from '@salesforce/resourceUrl/test_image';
import SIGNATURE_PAD_LIB from '@salesforce/resourceUrl/signature_pad'
import { loadScript } from 'lightning/platformResourceLoader';

//declaration of variables for calculations
let isDownFlag,
  isDotFlag = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0;

let canvasElement, ctx; //storing canvas context
let dataURL, convertedDataURI; //holds image data
let scale = window.devicePixelRatio || 1;

export default class TestSignaturePad extends LightningElement {
    sigPadInitialized = false;
    canvasWidth = 400;
    canvasHeight = 200;
    signaturePad = null;

  @api signatureFileName = 'InvoiceSignature.png';
  @api canvasWidth = '400';
  @api canvasHeight = '400';
  @api penStrokeThickness = 2.5;
  @api penStrokeColor = "#000000";
  @api title = 'Please sign here';
  // @api hasPreviousButton = false;
  // @api previousButtonLabel = 'Back';

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

    renderedCallback() {
        if (this.sigPadInitialized) {
            return;
        }
        this.sigPadInitialized = true;

        Promise.all([
            loadScript(this, SIGNATURE_PAD_LIB)
        ])
            .then(() => {
                this.initialize();
            })
            .catch(error => {
                console.log(error);
            });
    }

    initialize() {
        const canvas = this.template.querySelector('canvas.signature-pad');
        const ctx = canvas.getContext("2d");
          
        canvas.width = 400;
        canvas.height = 200;
        
        const background = new Image();
        background.src = BACKGROUND_IMAGE;
        
        background.onload = function() {
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        }

        const signaturePad = new window.SignaturePad(canvas, {
            backgroundColor: '#FFFFFF',
            penColor: 'rgb(0, 0, 0)'
        });

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

        this.signaturePad = signaturePad
        console.log(signaturePad)
    }

    handleClick() {
        console.log(this.signaturePad.toDataURL())
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
        this.drawDot();
        isDotFlag = false;
      }
    }
    if (requestedEvent === "up" || requestedEvent === "out") {
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

  // Check event type -> mouse or touch
  isTouchEvent = (event) => {
    return event?.type?.includes("touch");
  };
}