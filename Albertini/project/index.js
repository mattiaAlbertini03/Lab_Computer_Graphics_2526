"use strict";

var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl", { stencil: true });
if (!gl) alert("webgl non è stato caricato!!!");

function degToRad(d) { return d * Math.PI / 180; }

let dr = degToRad(5.0);

var  controls = {
	D : 30.0,
	theta : 1.1,
	phi : 1.4,
	near : 1,
	far : 100,
	fovy : 50.0,  
	thetaLight : degToRad(20),
	phiLight  : degToRad(80),
	DLight : 8.50,
	mirror : false,
}

var gui = new dat.GUI();
gui.closed = true;
gui.add(controls,"D").min(15).max(45).step(0.5);
gui.add(controls,"theta").min(0).max(6.28).step(dr);
gui.add(controls,"phi").min(0.1).max(3.0).step(dr);
gui.add(controls,"near").min(1).max(10).step(1);
gui.add(controls,"far").min(1).max(200).step(1);
gui.add(controls,"fovy").min(10).max(120).step(5);
gui.add(controls,"thetaLight").min(0).max(6.28).step(dr);
gui.add(controls,"phiLight").min(0.1).max(3.0).step(dr);
gui.add(controls,"DLight").min(1.75).max(10).step(0.25);
gui.add(controls,"mirror");

/*================= SETUP ENV =================*/


var projectionMatrix;
var camera;
var light;
var viewMatrix;
var ambientLight = [0.2, 0.2, 0.2]; 
var colorLight = [1.0, 1.0, 1.0];

function find_xyz(t, p, d){
	const x = Math.cos(t) * Math.sin(p) * d;
	const y = Math.cos(p) * d;
	const z = Math.sin(t) * Math.sin(p) * d;
	return [x,y,z];
}

function drawScene(time) {
	time *= 0.0005;

	webglUtils.resizeCanvasToDisplaySize(gl.canvas);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
	projectionMatrix = m4.perspective(degToRad(controls.fovy), aspect, controls.near, controls.far);

	light = find_xyz(controls.thetaLight, controls.phiLight, controls.DLight);

	camera = find_xyz(controls.theta, controls.phi, controls.D);

	const target = [0, 0, 0];
	const up = [0, 1, 0];

	viewMatrix = m4.inverse(m4.lookAt(camera, target, up));

	/*========DRAW OBJ MODEL ==========*/
	drawObj(viewMatrix);

	/*========DRAW STRANGE CUBE ==========*/
	drawCubes(time, viewMatrix);

	/*========DRAW FLOOR ==========*/
	if(controls.mirror){
		drawMirror(viewMatrix, time);
	}

	/*========DRAW SKYBOX ==========*/
	gl.depthFunc(gl.LEQUAL); 
	drawSkybox(viewMatrix);

	requestAnimationFrame(drawScene);
}


(async () => {
	/*================= SETUP OBJ =================*/
	var mesh = new Array();
	mesh.sourceMesh = 'resources/data/lovecraft.obj';

	await LoadMesh(gl, mesh);

	objBufferInfo = webglUtils.createBufferInfoFromArrays(gl, dataObj);

	drawScene(0);
})();
