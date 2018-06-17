//Code for WebAudioAPI. This stuff handles loading and playing of the music.
//To understand more about it, check out this super friendly guide at https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
let context = new (window.AudioContext || window.webkitAudioContext)();
let analyser = context.createAnalyser();
let soundDataArray;
const MAX_SOUND_VALUE = 256; //The largest value that can be stored in soundDataArray.

audioInput.onchange = function() { //if the audioInput element is updated...
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

function loadAudio() { //when the load default music button clicked
  var mediaUrl = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/9473/ivan-ibarra_-_cultos-personales.ogg"; //stolen from another pen. I have no idea how to host music files online or access them appropriately. 
  //I spent a couple of hours trying different things to no avail. Please help, thanks.
  let sound = document.getElementById("soundElement");
  sound.crossOrigin = 'anonymous'; 
  sound.src = mediaUrl;
  sound.controls = true;
  sound.play();
  createAudioObjects();
}

//Connects the audio source to the analyser and creating a suitably sized array to hold the frequency data.
function createAudioObjects() {
  //Have you read this yet? https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
  source = context.createMediaElementSource(document.getElementById("soundElement"));
  source.connect(analyser);
  analyser.connect(context.destination); 
  analyser.fftSize = 1024; //128, 256, 512, 1024 and 2048 are valid values.
  let bufferLength = analyser.frequencyBinCount;
  soundDataArray = new Uint8Array(bufferLength);
}

//Returns the average of a small sample of the array. Index declares which sample you want, ideal for iteration.
//How to use this function is best described through example - see how I use it in the p5js code below. It's super simple.
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

//Now let's look at P5JS stuff.
function setup(){
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1); //default HSB colour  
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
      soundLevel = getSampleOfSoundData(i, numOfBars, soundDataArray); //As simple as that.
    }
    rect(300 + i*10, 200, 10,-soundLevel*200); //Yeah, rect() is a bit weird. https://p5js.org/reference/#/p5/rect
  }
}
