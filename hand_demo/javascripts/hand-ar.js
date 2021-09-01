const cameraView = document.getElementById("cam");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
// let trackButton = document.getElementById("trackbutton");
let pointer = document.getElementById("pointer");
let updateNote = document.querySelector("#updatenote");
let plane = document.getElementById('plane')
let pivot = document.getElementById('pivot')
let ulhandle = document.getElementById('ulefthandle')
let urhandle = document.getElementById('urighthandle')
let llhandle = document.getElementById('llefthandle')
let lrhandle = document.getElementById('lrighthandle')
let uhandle = document.getElementById('upperhandle')

// var scene = document.querySelector("a-scene");
// var camCursor = document.querySelector("#camera-cursor");
// let cursor = document.createElement("a-cursor");
// cursor.setAttribute("radius-inner", "0.03");
// cursor.setAttribute("radius-outer", "0.06");
// cursor.setAttribute("position", "0 0 -1.0");
// cursor.setAttribute("color", "green");
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
                
                // document.querySelector(".hand-1 #pred-label span").innerHTML = predictions[i].label;
                if (predictions[i].label != "open" && !cursorClosed) {
                    closeTheRing();
                    cursorClosed = true;
                } else if (predictions[i].label == "open" && cursorClosed) {
                    openTheRing();
                    cursorClosed = false;
                } else {
                    changeData(predictions[i].bbox);
                }
                break;
            }
        }
    });
}

//Method to use prediction data to render cude accordingly
function moveTheRing(value) {
    newX = ((window.innerWidth * value.x) / window.innerWidth) * 2 * 20;
    newY = -((window.innerHeight * value.y) / window.innerHeight) * 2 * 20 + 0.1;
    pointer.setAttribute("position", newX + " " + newY + " -19.9");
    if (grabbing && focused != null) {
        // document.querySelector(".hand-1 #pred-label span").innerHTML = "new Y: " + newY;
        // focused.setAttribute("position", newX + " " + newY + " 0");
        translateThePlane(focusedId != "upperhandle");
    }
}

var grabbing = false;
var focused = null;
var focusedId = "";
var oldX = 0;
var oldY = 0;
var newX = 0;
var newY = 0;
var oldPlaneX = 0;
var oldPlaneY = 0;
var oldPlaneZ = 0;
var oldWidth = 0;
var oldHeight = 0;



function closeTheRing() {    
    pointer.setAttribute("geometry", "primitive: ring; radiusInner: 0.1; radiusOuter: 0.3");
    if (focused != null) {
        grabbing = true;
        let pos = focused.getAttribute("position");
        oldX = pos.x;
        oldY = pos.y;

        pos = plane.getAttribute("position");
        oldPlaneX = pos.x;
        oldPlaneY = pos.y;
        oldPlaneZ = pos.z;
        oldWidth = Number(plane.getAttribute("width"));
        oldHeight = Number(plane.getAttribute("height"));
        focused.setAttribute("scale","1.3 1.3 1.3");
    }
}

function openTheRing() {    
    pointer.setAttribute("geometry", "primitive: ring; radiusInner: 0.3; radiusOuter: 0.5");
    if (focused != null && grabbing) {
        // resizeThePlane();
        // focused.setAttribute("scale","2 2 2");
    }
    grabbing = false;
}

function translateThePlane(resizePlane = true) {
    if (grabbing) {
        diffX = newX - oldX;
        diffY = newY - oldY;        
        
        // Reposition Plane
        let pos = new THREE.Vector3(oldPlaneX, oldPlaneY, oldPlaneZ);
        pos.x += diffX/2;
        pos.y += diffY/2;
        plane.setAttribute("position", pos.x + " " + pos.y + " " + pos.z);


        // Resize Plane
        let width = oldWidth;
        let height = oldHeight;
        if (resizePlane) {
            if (newX < 0 && oldX < 0) {
                diffX = -diffX;
            }
            if (newY < 0 && oldY < 0) {
                diffY = -diffY;
            }
            width = oldWidth + diffX;
            height = oldHeight + diffY;

            plane.setAttribute("width", width);
            plane.setAttribute("height", height);
        }

        // Re-calculate handle positions
        // ulhandle
        var posx = pos.x - width/2;
        var posy = pos.y + height/2;
        ulhandle.setAttribute("position", posx + " " + posy + " " + pos.z);
        
        // urhandle
        posx = pos.x + width/2;
        posy = pos.y + height/2;
        urhandle.setAttribute("position", posx + " " + posy + " " + pos.z);

        // llhandle
        posx = pos.x - width/2;
        posy = pos.y - height/2;
        llhandle.setAttribute("position", posx + " " + posy + " " + pos.z);

        // lrhandle
        posx = pos.x + width/2;
        posy = pos.y - height/2;
        lrhandle.setAttribute("position", posx + " " + posy + " " + pos.z);

        // uhandle
        posx = pos.x;
        posy = pos.y + height/2;
        uhandle.setAttribute("position", posx + " " + posy + " " + pos.z);
    }
}

function addIntersectedItems(el, idName) {
    pointer.setAttribute("material", "color: darkblue");
    focused = el;
    focusedId = idName;
    console.log("addIntersectedItems", focusedId);
}

function removeIntersectedItems(idName) {
    pointer.setAttribute("material", "color: blue");
    if (focused != null) {
        focused = null;
        focusedId = "";
    }
}

//Method to Change prediction data into useful information
function changeData(value) {
    let midvalX = value[0] + value[2] / 2;
    let midvalY = value[1] + value[3];  
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
    sleep(500).then(() => {toggleVideo(); });
});