# P5JS Music Visualiser Template

To start off, we create the WebAudioApi context and analyser objects. These will handle the audio processing.
```js
let context = new (window.AudioContext || window.webkitAudioContext)();
let analyser = context.createAnalyser();
let soundDataArray;
const MAX_SOUND_VALUE = 256; //The largest value that can be stored in soundDataArray.
```
When the user clicks on the audio input and selects a file, this function loads and plays the music. 
```js
audioInput.onchange = function() { 
  let sound = document.getElementById("soundElement");
  let reader = new FileReader(); //Make a file reader
  reader.onload = function(e) { 
    sound.src = this.result; //give the audio element the sound file
    sound.controls = true; //yeah we want to pause, play and also change volume. Do you?
    sound.play();
  };
  reader.readAsDataURL(this.files[0]); //read that file.
  createAudioObjects();
};
```
`createAudioObjects();` handles all the WebAudioApi connections, and creates the `soundDataArray` at a suitable size.
```js
function createAudioObjects() {
  source = context.createMediaElementSource(document.getElementById("soundElement"));
  source.connect(analyser);
  analyser.connect(context.destination); 
  analyser.fftSize = 1024; //128, 256, 512, 1024 and 2048 are valid values.
  let bufferLength = analyser.frequencyBinCount;
  soundDataArray = new Uint8Array(bufferLength);
}
```
`loadAudio()` also calls `createAudioObjects()`. It loads a default audio file to be played if the user doesn't want to search for their own music. 
```js
function loadAudio() {
  var mediaUrl = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/9473/ivan-ibarra_-_cultos-personales.ogg"; 
  let sound = document.getElementById("soundElement");
  sound.crossOrigin = 'anonymous'; 
  sound.src = mediaUrl;
  sound.controls = true;
  sound.play();
  createAudioObjects();
}
```
Please note that the music link above was stolen from another codepen pen. I have no idea how to host music files online and then access them appropriately. I spent a couple of hours trying different things to no avail.

Here is the helper function I use to for when I want to iterate through the heights of the sound bars displayed in the music visualisation. Note how the result is normalised between 0 and 1, 0 is no volume, 1 is maximum.
```js
//Returns the average of a small sample of the array, normalised between 0-1. Index declares which sample you want, ideal for iteration.
//How to use this function is best described through example - see how I use it in the p5js code below.
function getSampleOfSoundData(index, noSampleSections, soundDataArray){
  let sampleSize = Math.floor((soundDataArray.length/2) / noSampleSections); 
  
  let minBound = index * sampleSize; 
  let maxBound = (index + 1) * sampleSize;
  let sum = 0;
  
  for (let i = minBound; i < maxBound; i++){
    sum += soundDataArray[i];
  }
  let average = sum / sampleSize;
  
  return average / MAX_SOUND_VALUE;
}
```
## P5JS
Here is an example of a basic p5js visualiser, using the above functions.
```js
function setup(){
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1); 
  fill(0,100,100,1);
  noStroke();
}

function draw(){
  background(0);
  if((soundDataArray === undefined) == false){ //Be careful with trying to access an undefined array before music starts playing.
    analyser.getByteFrequencyData(soundDataArray);
  }
  displayVisualiser();
}

function displayVisualiser() {
  let numOfBars = 20;
  let soundLevel = 0;
  
  for (let i = 0; i < numOfBars; i++){
    if((soundDataArray === undefined) == false){
      soundLevel = getSampleOfSoundData(i, numOfBars, soundDataArray);
    }
    rect(300 + i*10, 200, 10,-soundLevel*200);
  }
}
```
You can view the result live [here](https://codepen.io/jhancock532/details/QxqQRN/).
