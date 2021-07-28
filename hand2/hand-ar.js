const cameraView = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let updateNote = document.querySelector("#updatenote");
let cursor = document.createElement("a-ring");
cursor.setAttribute("radiusInner", "0.05");
cursor.setAttribute("radiusOuter", "0.05");
cursor.setAttribute("color", "red");

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

// Access the device camera and stream to cameraView
function cameraStart(video) {
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
                break;
            }
        }
    });
}

//Method to use prediction data to render cude accordingly
function moveTheRing(value) {
    ring.position.x = ((window.innerWidth * value.x) / window.innerWidth) * 5;
    ring.position.y = -((window.innerHeight * value.y) / window.innerHeight) * 5;
    renderer.render(scene, camera);
  
    mouse.x = ((window.innerWidth * value.x) / window.innerWidth) * 5;
      mouse.y = -((window.innerHeight * value.y) / window.innerHeight) * 5;
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( mouse, camera );               
  
    const intersects = raycaster.intersectObjects( scene.children );
      for ( let i = 0; i < intersects.length; i ++ ) {
          intersects[ i ].object.material.color.set( 0xff0000 );
      }
  
    //const intersects = raycaster.intersectObjects( cube );
    if(intersects.length == 0) {
      cube.material.color.set( 0x9999FF );
    }
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
    updateNote.innerText = "Starting video in 0.5 sec."
    // window.alert("Loaded model");
    //trackButton.disabled = false
    sleep(500).then(() => {cameraStart(cameraView); });
});