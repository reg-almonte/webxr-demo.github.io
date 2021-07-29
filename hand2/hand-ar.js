const cameraView = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let blueBox = document.getElementById("blue-box");
let updateNote = document.querySelector("#updatenote");
var scene = document.querySelector("a-scene");
var camCursor = document.querySelector("#camera-cursor");
let cursor = document.createElement("a-cursor");
// cursor.setAttribute("radius-inner", "0.03");
// cursor.setAttribute("radius-outer", "0.06");
cursor.setAttribute("position", "0 0 -1.0");
cursor.setAttribute("color", "green");
// camCursor.appendChild(cursor);

let isVideo = false;
let model = null;

const modelParams = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

var constraints = {
    audio: false,
    video: {
        facingMode: "environment",
    }
};

// Method to toggle a video
function toggleVideo() {
    if (!isVideo) {
      updateNote.innerText = "Starting video";
      startVideo(cameraView);
      isVideo = true;
    } else {
      updateNote.innerText = "Stopping video";
      stopVideo();
      isVideo = false;
      updateNote.innerText = "Video stopped";
    }
}

function stopVideo() {
    if (window.localStream) {
        window.localStream.getTracks().forEach((track) => {
          track.stop();
          return true;
        });
      } else {
        return false;
      }
}

// Access the device camera and stream to cameraView
function startVideo(video) {
    // cameraView = document.querySelector("#webcam");

    video.width = video.width || 640;
    video.height = video.width * (video.videoHeight / video.videoWidth); //* (3 / 4);
    // video.style.height = "20px";

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
            video.height = video.width * (video.videoHeight / video.videoWidth); //* (3 / 4);
            video.style.height =
              parseInt(video.style.width) *
                (video.videoHeight / video.videoWidth).toFixed(2) +
              "px";
            video.play();            
            isVideo = true;
            runDetection();
            updateNote.innerText = "Started"
          };
    })
    .catch(function(error) {
        console.error("Oops. Something is broken.", error);
    });
}

var cursorClosed = false;
function runDetection() {
    model.detect(cameraView).then(predictions => {
        model.renderPredictions(predictions, canvas, context, cameraView);
        
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
        for (let i = 0; i < predictions.length; i++) {
            if (predictions[i].label != "face") {
                changeData(predictions[i].bbox);
                document.querySelector(".hand-1 #pred-label span").innerHTML = predictions[i].label;
                if (predictions[i].label == "closed" && !cursorClosed) {
                    closeTheRing();
                    cursorClosed = true;
                } else if (predictions[i].label == "open" && cursorClosed) {
                    openTheRing();
                    cursorClosed = false;
                }
                break;
            }
        }
    });
}

//Method to use prediction data to render cude accordingly
function moveTheRing(value) {
    let newX = ((window.innerWidth * value.x) / window.innerWidth) * 2;
    let newY = -((window.innerHeight * value.y) / window.innerHeight) * 2 + 0.1;
    blueBox.setAttribute("position", newX + " " + newY + " -1.5");

}

function closeTheRing() {
    blueBox.setAttribute("material", "color: red");
    blueBox.setAttribute("geometry", "primitive: ring; radiusInner: 0.01; radiusOuter: 0.03");
    if (fruits.length > 0) {
        fruits[0].setAttribute("color","blue");
    }
}

function openTheRing() {
    blueBox.setAttribute("material", "color: green");
    blueBox.setAttribute("geometry", "primitive: ring; radiusInner: 0.02; radiusOuter: 0.05");
}

var focused = [];

function addIntersectedItems(el) {
    focused.push(el);
}

function removeIntersectedItems(el) {
    focused.pop();
}

//Method to Change prediction data into useful information
function changeData(value) {
    let midvalX = value[0] + value[2] / 2;
    let midvalY = value[1] + value[3] / 2;
  
    document.querySelector(".hand-1 #hand-x span").innerHTML = midvalX;
    document.querySelector(".hand-1 #hand-y span").innerHTML = midvalY;
  
    moveTheRing({ x: (midvalX - 300) / 600, y: (midvalY - 250) / 500 });
  }

  

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded model!"
    trackButton.disabled = false;
});