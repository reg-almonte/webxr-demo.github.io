const cameraView = document.getElementById("webcam");
// const canvas = document.getElementById("canvas");
// const context = canvas.getContext("2d");


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
function cameraStart() {
    cameraView = document.querySelector("#webcam");
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
        cameraView.srcObject = stream;
        // runDetection();
    })
    .catch(function(error) {
        console.error("Oops. Something is broken.", error);
    });
}

// function startVideo() {
//     handTrack.startVideo(cameraView).then(function (status) {
//         console.log("video started", status);
//         if (status) {
//             //updateNote.innerText = "Video started. Now tracking"
//             isVideo = true
//             runDetection()
//         } else {
//             console.log("Video is not loaded");
//         }
//     });
// }

function runDetection() {
    model.detect(cameraView).then(predictions => {
        console.log("Predictions: ", predictions);
        // model.renderPredictions(predictions, canvas, context, cameraView);
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

// Start the video stream when the window loads
// window.addEventListener("load", cameraStart, false);
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    // updateNote.innerText = "Loaded Model!"
    // window.alert("Loaded model");
    //trackButton.disabled = false
    console.log("Starting video in 1 sec.");
    sleep(1000).then(() => {cameraStart(); });
});