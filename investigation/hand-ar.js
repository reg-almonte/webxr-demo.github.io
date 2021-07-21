const cameraView = document.getElementById("webcam");
// const canvas = document.getElementById("canvas");
// const context = canvas.getContext("2d");
let updateNote = document.querySelector("#updatenote"); //document.getElementById("updatenote");

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
          };
    })
    .catch(function(error) {
        console.error("Oops. Something is broken.", error);
    });
}

// function startVideo() {
//     handTrack.startVideo(cameraView).then(function (status) {
//         console.log("video started", status);
//         if (status) {
//             updateNote.innerText = "Video started. Now tracking"
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
        var str = ''
        for (var i = 0; i < predictions.length; i++) {
          var box = predictions[i].bbox;
          str += predictions[i].label + ' (' + (Math.round(box[0] + box[2]) * 100) / 200 + ',' + 
          (Math.round(box[1] + box[3]) * 100) / 200 + ') \n';
        }
        //updateNote.innerText = str;
        if (predictions.length != 0) {
            updatenote.setAttribute("visible", "true");
            updateNote.setAttribute("value", str);
        } else {
            updatenote.setAttribute("visible", "false");
        }
       
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
    //updateNote.innerText = "Starting video in 0.5 sec."
    updateNote.setAttribute("value", "Starting video in 0.5 sec.");
    // window.alert("Loaded model");
    //trackButton.disabled = false
    console.log("Starting video in 0.5 sec.");
    sleep(500).then(() => {cameraStart(cameraView); });
});