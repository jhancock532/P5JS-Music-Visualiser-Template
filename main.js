let context = new (window.AudioContext || window.webkitAudioContext)();
let analyser = context.createAnalyser();
let soundDataArray;
const MAX_SOUND_VALUE = 256; //The largest value that can be stored in soundDataArray.

audioInput.onchange = function() { 
  let sound = document.getElementById("soundElement");
  let reader = new FileReader();
  reader.onload = function(e) { 
    sound.src = this.result;
    sound.controls = true;
    sound.play();
  };
  reader.readAsDataURL(this.files[0]); 
  createAudioObjects();
};

function loadAudio() {
  var mediaUrl = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/9473/ivan-ibarra_-_cultos-personales.ogg"; 
  let sound = document.getElementById("soundElement");
  sound.crossOrigin = 'anonymous'; 
  sound.src = mediaUrl;
  sound.controls = true;
  sound.play();
  createAudioObjects();
}

//Connects the audio source to the analyser and creates a suitably sized array to hold the frequency data.
function createAudioObjects() {
  source = context.createMediaElementSource(document.getElementById("soundElement"));
  source.connect(analyser);
  analyser.connect(context.destination); 
  analyser.fftSize = 1024; //128, 256, 512, 1024 and 2048 are valid values.
  let bufferLength = analyser.frequencyBinCount;
  soundDataArray = new Uint8Array(bufferLength);
}

//Returns the average of a small sample of the array. Index declares which sample you want, ideal for iteration from 0 to numSampleSections.
function getSampleOfSoundData(index, numSampleSections, soundDataArray){
  let sampleSize = Math.floor((soundDataArray.length/2) / numSampleSections); 
  
  let minBound = index * sampleSize; 
  let maxBound = (index + 1) * sampleSize;
  let sum = 0;
  
  for (let i = minBound; i < maxBound; i++){
    sum += soundDataArray[i];
  }
  let average = sum / sampleSize;
  
  return average / MAX_SOUND_VALUE;
}

// -- P5JS functions --
function setup(){
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1); 
  fill(0,100,100,1);
  noStroke();
}

function draw(){
  background(0);
  //Be careful with trying to access an undefined array before music starts playing.
  if((soundDataArray === undefined) == false){ 
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
