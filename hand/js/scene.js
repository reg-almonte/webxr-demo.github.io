// Setting scene for 3D Object
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
var vector = new THREE.Vector3();
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Creating 3D object
var geometry = new THREE.BoxGeometry(1, 2, 1);
var material = new THREE.MeshBasicMaterial({
  color: 0x9999FF,
  wireframe: true,
  wireframeLinewidth: 1
});

var cube = new THREE.Mesh(geometry, material);

scene.add(cube);
camera.position.z = 5;

// Optional animation to rotate the element
var animate = function() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
};

animate();

// Creating cursor object
const ringGeom = new THREE.RingGeometry( 0.05, 0.08, 32 );
const material2 = new THREE.MeshBasicMaterial( { color: 0x33CC33, side: THREE.DoubleSide } );
const ring = new THREE.Mesh( ringGeom, material2 );
scene.add( ring );

// Creating Canavs for video Input
const video = document.getElementById("myvideo");
const handimg = document.getElementById("handimage");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");

let imgindex = 1;
let isVideo = false;
let model = null;

// Params to initialize Handtracking js
const modelParams = {
  flipHorizontal: true,
  maxNumBoxes: 1,
  iouThreshold: 0.5,
  scoreThreshold: 0.7
};

handTrack.load(modelParams).then(lmodel => {
  model = lmodel;
  updateNote.innerText = "Loaded Model!";
  trackButton.disabled = false;
});

// Method to start a video
function startVideo() {
  handTrack.startVideo(video).then(function(status) {
    if (status) {
      updateNote.innerText = "Video started. Now tracking";
      isVideo = true;
      runDetection();
    } else {
      updateNote.innerText = "Please enable video";
    }
  });
}

// Method to toggle a video
function toggleVideo() {
  if (!isVideo) {
    updateNote.innerText = "Starting video";
    startVideo();
  } else {
    updateNote.innerText = "Stopping video";
    handTrack.stopVideo(video);
    isVideo = false;
    updateNote.innerText = "Video stopped";
  }
}

//Method to detect movement
function runDetection() {
  model.detect(video).then(predictions => {
    model.renderPredictions(predictions, canvas, context, video);
    if (isVideo) {
      requestAnimationFrame(runDetection);
    }
    // if (predictions.length > 0) {
    //   changeData(predictions[0].bbox);
    // }
    document.querySelector(".hand-1 #pred-label span").innerHTML = "-";
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].label != "face") {
        changeData(predictions[i].bbox);
        document.querySelector(".hand-1 #pred-label span").innerHTML = "hand";
        break;
      }
    }
  });
}

//Method to Change prediction data into useful information
function changeData(value) {
  let midvalX = value[0] + value[2] / 2;
  let midvalY = value[1] + value[3] / 2;

  document.querySelector(".hand-1 #hand-x span").innerHTML = midvalX;
  document.querySelector(".hand-1 #hand-y span").innerHTML = midvalY;

  moveTheRing({ x: (midvalX - 300) / 600, y: (midvalY - 250) / 500 });
}

const mouse = new THREE.Vector2();

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
  // else {
  //   cube.object.material.color.set( 0xff0000 );
  // }
  
  // var intersects = raycaster.intersectObjects( scene.children );
  // if(intersects.length != 0)
  // {
  //   document.querySelector(".hand-1 #pred-label span").innerHTML = "intersects!";
  // }
}
