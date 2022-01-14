let carrier;
let modulator;
let fft;
let modFreq = 0;
let modAmp = 0;
let waveformStroke;
let waveform;
let canvas;

let ramptime = 500;
let sound = false;
let carrierFreqSlider;
let carrierFreqSliderPosX = 140;
let carrierFreqSliderPosY = 375;

let wrapper;
//let wrapperID = "vrtx-person-main-content-wrapper";
let wrapperID = "synth-holder"; // for development
let parentID = "synth-holder";
let canvasHeight = 400;
let canvasWidth = 0;

let colorBackground = "white";
let colorWaveform = "black";
let colorWaveformText = "#555555";
let playTextSize = 50;

function setup() {
  // setup canvas
  wrapper = document.getElementById(wrapperID);
  canvasWidth = wrapper.offsetWidth;
  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(parentID);
  canvas.mouseClicked(handleClick);
  background(colorBackground);
  colorMode(RGB);

  // User frequency slider
  carrierFreqSlider = new CSlider(50, 500, 200, 1);

  // the color and opacity of the waveform
  waveformStroke = colorWaveform;

  modulator = new p5.Oscillator("triangle");
  modulator.disconnect(); // disconnect the modulator from master output
  modulator.freq(0);
  modulator.amp(0);

  carrier = new p5.Oscillator();
  carrier.freq(0);
  carrier.amp(0);

  // Modulate the carrier's amplitude with the modulator
  carrier.amp(modulator.scale(-1, 1, 1, -1), 0.2);

  // create an fft to analyze the audio
  fft = new p5.FFT();

  modulator.start();
  carrier.start();
}

function draw() {
  background(colorBackground);
  sound ? mouse2sound() : drawPlayText();
  waveform = fft.waveform();
  drawWaveform();
  drawText();
  drawSlider();
}

function handleClick() {
  if (carrierFreqSlider.overEvent()) return; // if the mouse is over the slider, do nothing
  let audioState = getAudioContext().state;
  audioState !== "running" ? startAudioContext() : suspendAudioContext();
}

function startAudioContext() {
  getAudioContext().resume();
  modulator.amp(0.2, ramptime / 1000);
  setTimeout(() => {
    sound = true;
  }, ramptime);
}

function suspendAudioContext() {
  sound = false;
  modulator.amp(0, ramptime / 1000);
  carrier.amp(0, ramptime / 1000);
  setTimeout(() => {
    getAudioContext().suspend();
  }, ramptime);
}

function mouse2sound() {
  // Slider controls the carrier frequency
  carrier.freq(carrierFreqSlider.value());

  modFreq = map(mouseY, 0, height, 20, 0);
  modAmp = map(mouseX, 0, width, 0, 1);
  modulator.freq(modFreq);
  modulator.amp(modAmp, 0.2);
}

function drawPlayText() {
  stroke(waveformStroke);
  strokeWeight(0.5);
  fill("blue");
  textSize(playTextSize);
  textAlign(CENTER, BASELINE);
  text("Click to Play", canvasWidth / 2, canvasHeight / 2 - 6);
}

function drawWaveform() {
  stroke(waveformStroke);
  fill("rgba(0,0,0,0)");
  strokeWeight(10);
  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, -height / 2, height / 2);
    vertex(x, y + height / 2);
  }
  endShape();
}

function drawText() {
  stroke(waveformStroke);
  strokeWeight(0.4);
  fill(colorWaveformText);
  textSize(15);
  textAlign(LEFT);
  text("Modulator Frequency: " + modFreq.toFixed(3) + " Hz", 10, 345);
  text("Modulator Amplitude: " + modAmp.toFixed(3), 10, 365);
  text("Carrier Frequency: ", 10, 385);
}

function drawSlider() {
  carrierFreqSlider.position(carrierFreqSliderPosX, carrierFreqSliderPosY);
}

// custom slider that you can position
// relative (inside) to the canvas element
class CSlider {
  constructor(min, max, value = (min + max) / 2, step = 1) {
    this.width = 130;
    this.height = 20;
    let widthtoheight = this.width - this.height;
    this.ratio = this.width / widthtoheight;
    this.x = 10;
    this.y = -1000;
    this.spos = this.x + this.width / 2 - this.height / 2;
    this.newspos = this.spos;
    this.sposMin = this.x;
    this.sposMax = this.x + this.width - this.height;
    this.vmin = min;
    this.vmax = max;
    this.svalue = constrain(value, this.vmin, this.vmax);
    this.vstep = step;
    this.loose = 1;
    this.over = false;
    this.locked = false;
    this.scale = 1;
  }

  update() {
    if (this.overEvent()) {
      this.over = true;
    } else {
      this.over = false;
    }
    if (mouseIsPressed && this.over) {
      this.locked = true;
    }
    if (!mouseIsPressed) {
      this.locked = false;
    }
    if (this.locked) {
      this.newspos = constrain(
        mouseX / this.scale - this.height / 2,
        this.sposMin,
        this.sposMax
      );
      this.svalue =
        this.vmin +
        (this.vmax - this.vmin) *
          ((this.newspos - this.sposMin) / (this.sposMax - this.sposMin));
      if (this.vstep > 0) {
        this.svalue = constrain(
          this.vmin +
            round((this.svalue - this.vmin) / this.vstep) * this.vstep,
          this.vmin,
          this.vmax
        );
      }
      this.newspos =
        this.x +
        (this.width - this.height) *
          ((this.svalue - this.vmin) / (this.vmax - this.vmin));
    }
    if (abs(this.newspos - this.spos) > 1) {
      this.spos = this.spos + (this.newspos - this.spos) / this.loose;
    }
  }

  overEvent() {
    if (
      mouseX / this.scale > this.x &&
      mouseX / this.scale < this.x + this.width &&
      mouseY / this.scale > this.y &&
      mouseY / this.scale < this.y + this.height
    ) {
      return true;
    } else {
      return false;
    }
  }

  display() {
    noStroke();
    fill(204);
    rect(this.x, this.y, this.width, this.height);
    if (this.over || this.locked) {
      fill(0, 0, 0);
    } else {
      fill(102, 102, 102);
    }
    rect(this.spos, this.y, this.height, this.height);
  }

  getPos() {
    // Convert spos to be values between
    // 0 and the total width of the scrollbar
    return this.spos * this.ratio;
  }

  value() {
    return this.svalue;
  }

  setScale(sc) {
    this.scale = sc;
  }

  position(xp, yp) {
    this.x = xp;
    this.y = yp;
    if (this.vstep > 0) {
      this.svalue = constrain(
        this.vmin + round((this.svalue - this.vmin) / this.vstep) * this.vstep,
        this.vmin,
        this.vmax
      );
    }
    this.spos =
      this.x +
      (this.width - this.height) *
        ((this.svalue - this.vmin) / (this.vmax - this.vmin));
    //console.log(this.smin);
    this.newspos = this.spos;
    this.sposMin = this.x;
    this.sposMax = this.x + this.width - this.height;
    push();
    this.update();
    this.display();
    pop();
  }
}
