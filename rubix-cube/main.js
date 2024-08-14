import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { dampM, dampC, damp3 } from 'maath/easing'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1400);
const renderer = new THREE.WebGLRenderer({alpha: true});
const controls = new OrbitControls(camera, renderer.domElement);

document.addEventListener("DOMContentLoaded", init);
const counter = document.getElementById("moveCounter");
const lightBtn = document.getElementById("lightMode");
const darkBtn = document.getElementById("darkMode");

let frontFace = [];
let rightFace = [];
let leftFace = [];
let upFace = [];
let downFace = [];
let backFace = [];

const moves = ['f', 'F', 'r', 'R', 'l', 'L', 'u', 'U', 'd', 'D', 'b', 'B'];
let qbArr = [];
let startMatrices = [];
const dim = 3;
let solving = false;
let userMoves = [];
let moveCount = -1;

function init(){
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("canvasCont").appendChild(renderer.domElement);
  renderer.setClearColor( 0xffffff, 0);
  camera.position.set(5, 4, 5);
  particlesJS.load('particles-js', 'particlesjs-config.json');

  listenerSetup();
  createCube();
  setFaces();
  animate();
  updateCounter();
}

function listenerSetup(){
  const reset = document.getElementById("resetBtn");
  const scramble = document.getElementById("scrambleBtn");
  lightBtn.addEventListener("click", changeMode);
  darkBtn.addEventListener("click", changeMode);
  reset.addEventListener("click", resetCube);
  scramble.addEventListener("click", scrambleCube);

  document.addEventListener("keydown", (event) =>{
    if(!solving) handlePress(event.key);
  });
}

function createCube(){
  const qbSize = 0.9;
  const geometry = new THREE.BoxGeometry(qbSize, qbSize, qbSize);

  for (let x = 0; x < dim; x++){
    for (let y = 0; y < dim; y++){
      for (let z = 0; z < dim; z++){
        const material = [
          new THREE.MeshBasicMaterial({ color: 0x75bf69}),   //green (R)
          new THREE.MeshBasicMaterial({ color: 0x4287f5}),   //blue (L)
          new THREE.MeshBasicMaterial({ color: 0xcfaa4e}),   //yellow (U)
          new THREE.MeshBasicMaterial({ color: 0xc8c9c5}),   //white (D)
          new THREE.MeshBasicMaterial({ color: 0xad3743}),   //red (F)
          new THREE.MeshBasicMaterial({ color: 0xbd7931})    //orange (B)
        ];

        const qb = new THREE.Mesh(geometry, material);
        const matrix = new THREE.Matrix4();
        matrix.makeTranslation(x - 1, y - 1, z - 1);
        qb.applyMatrix4(matrix);
        qbArr.push(qb);
        startMatrices.push(matrix.clone());
        scene.add(qb);
        qb.userData = {
          colours: [],
          type: ''
        };
        setCubieType(qb, x, y, z);
        setCubieColours(qb, x, y, z);
      }
    }
  }
}

function setCubieType(qb, x, y, z){
  if(x === 1 && (y === 1 || (z === 1 && (y === 0 || y === 2))) || (x === 0 || x === 2 ) && y === 1 && z === 1){
    qb.userData.type = "centre";
  }

  else if(x === 0 && z !== 1 && (y === 2 || y === 0) || x === 2 && z !== 1 && (y === 2 || y === 0)){
    qb.userData.type = "corner";
  }

  else {
    qb.userData.type = "edge";
  }
}

function setCubieColours(qb, x, y, z){
  if(x === 0) qb.userData.colours.push("blue");
  if(x === 2) qb.userData.colours.push("green");
  if(y === 0) qb.userData.colours.push("white");
  if(y === 2) qb.userData.colours.push("yellow");
  if(z === 0) qb.userData.colours.push("orange");
  if(z === 2) qb.userData.colours.push("red");
}

function setFaces(){
  frontFace.length = 0;
  rightFace.length = 0;
  leftFace.length = 0;
  upFace.length = 0;
  downFace.length = 0;
  backFace.length = 0;
  
  for(let i = 0; i < qbArr.length; i++){
    const epsilon = 1e-6;
    const qb = qbArr[i];
    const position = new THREE.Vector3();
    position.setFromMatrixPosition(qb.matrix);

    if(Math.abs(position.z - 1) < epsilon) frontFace.push(qb);
    if(Math.abs(position.x - 1) < epsilon) rightFace.push(qb);
    if(Math.abs(position.x + 1) < epsilon) leftFace.push(qb);
    if(Math.abs(position.y - 1) < epsilon) upFace.push(qb);
    if(Math.abs(position.y + 1) < epsilon) downFace.push(qb);
    if(Math.abs(position.z + 1) < epsilon) backFace.push(qb);
  }
}

function rotate(faceQbs, axis, angle){
  const rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeRotationAxis(axis, angle);

  for(let i = 0; i < faceQbs.length; i++){
    const qb = faceQbs[i];
    const qbMatrix = new THREE.Matrix4();
    qbMatrix.copy(qb.matrix);
    qbMatrix.premultiply(rotationMatrix);
    qb.matrix.copy(qbMatrix);

    qb.matrixAutoUpdate = false;
  }
}

function updateCounter(){
  moveCount++;
  counter.innerHTML = moveCount;
} 

function resetCube(){
  moveCount = 0;
  counter.innerHTML = moveCount;

  for(let i = 0; i < qbArr.length; i++){
    let qb = qbArr[i];
    let startMatrix = startMatrices[i];
    qb.matrix.copy(startMatrix);
    setFaces();
  }
}

function handlePress(key){
  const speed = Math.PI/2;
  const axis = new THREE.Vector3();

  if(moves.includes(key) || key === 'z'){
    //lowercase = clockwise, uppercase = anticlockwise
    switch(key){
      case 'f':
        axis.set(0, 0, -1);
        rotate(frontFace, axis, speed);
        updateCounter();
        userMoves.push(key);
        break;
      case 'F':
        axis.set(0, 0, 1);
        rotate(frontFace, axis, speed);
        updateCounter();
        userMoves.push(key);
        break;
      case 'r':
        axis.set(-1, 0, 0);
        rotate(rightFace, axis, speed);
        updateCounter();
        userMoves.push(key);
        break;
      case 'R':
        axis.set(1, 0, 0);
        rotate(rightFace, axis, speed);
        updateCounter();
        userMoves.push(key);
        break;
      case 'l': 
        axis.set(-1, 0, 0);
        rotate(leftFace, axis, speed);
        updateCounter();
        userMoves.push(key);
        break;
      case 'L': 
        axis.set(1, 0, 0);
        rotate(leftFace, axis, speed);
        updateCounter();
        userMoves.push(key);
        break;
      case 'u': 
        axis.set(0, -1, 0);
        rotate(upFace, axis, speed);
        updateCounter();
        userMoves.push(key);
        break;
      case 'U': 
        axis.set(0, 1, 0);
        rotate(upFace, axis, speed);
        updateCounter();
        userMoves.push(key);
        break;
      case 'd': 
        axis.set(0, -1, 0);
        rotate(downFace, axis, speed);
        updateCounter();
        userMoves.push(key);
        break;
      case 'D': 
        axis.set(0, 1, 0);
        rotate(downFace, axis, speed);
        updateCounter();
        userMoves.push(key);
        break;
      case 'b':
        axis.set(0, 0, -1);
        rotate(backFace, axis, speed);
        updateCounter();
        userMoves.push(key);
        break;
      case 'B':
        axis.set(0, 0, 1);
        rotate(backFace, axis, speed);
        updateCounter();
        userMoves.push(key);
        break;
      case 'z':
        cheatSolve();
        break;
    }
    setFaces();
  }
}

function scrambleCube(){
  const scrambleMoves = [];

  if(!solving){
    for(let i = 0; i < 20; i++){
      const index = Math.floor(Math.random() * 12)
      const move = moves[index];
      handlePress(move);
    }
  }
}

function cheatSolve(){
  console.log(isCubeSolved());
  if(!solving && !isCubeSolved()){
    solving = true;
    let oppMoves = [];
    let i = 0;

    for(let i = userMoves.length-1; i >= 0; i--){
      let move = userMoves[i].toString();
      if(move === move.toUpperCase()){
        oppMoves.push(move.toLowerCase());
      }
      else{
        oppMoves.push(move.toUpperCase());
      }
    }

    const solve = setInterval(function(){
      handlePress(oppMoves[i]);
      i++;

      if(i === oppMoves.length || isCubeSolved()){
        console.log(isCubeSolved());
        userMoves.length = 0;
        oppMoves.length = 0;
        i = 0;
        solving = false;
        clearInterval(solve);
      } 
    }, 300);
  }
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  controls.update();
}

let lightMode = false;
function changeMode(){
  const heading = document.getElementById("heading");
  const particles = document.getElementById("particles-js");
  const lightBgCol = "#7099b3";
  const darkBgCol = "#0c1629"

  lightMode = !lightMode;
  if(lightMode){
    document.body.style.background = lightBgCol;
    particles.style.display = "none";
    heading.style.fill = "#d6a851";
    heading.style.textShadow = "none";
    counter.style.textShadow = "none";
    lightBtn.style.display = "none";
    darkBtn.style.display = "block";
  }
  else{
    document.body.style.background = darkBgCol;
    particles.style.display = "block";
    heading.style.fill = "#ffffff";
    heading.style.textShadow = "10px 10px 10px #000000";
    counter.style.textShadow = "7px 7px 7px #000000";
    lightBtn.style.display = "block";
    darkBtn.style.display = "none";
  }
}

function isCubeSolved(){  
  const epsilon = 1e-6;

  function vectorsSimilar(v1, v2){
    return Math.abs(v1.x - v2.x) < epsilon && Math.abs(v1.y - v2.y) < epsilon && Math.abs(v1.z - v2.z) < epsilon;
  }

  for(let i = 0; i < qbArr.length; i++){
    const currentMatrix = qbArr[i].matrix;
    const startMatrix = startMatrices[i];

    const currentPosition = new THREE.Vector3();
    currentPosition.setFromMatrixPosition(currentMatrix);

    const startPosition = new THREE.Vector3();
    startPosition.setFromMatrixPosition(startMatrix);

    if(!vectorsSimilar(currentPosition, startPosition)){
      return false;
    }
  }
  return true;
}



