"use strict";

let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

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
	Dlight : 8.50,
}

function define_gui(){
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
	gui.add(controls,"Dlight").min(1.75).max(10).step(0.25);
}


define_gui();

var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl");
if (!gl) alert("webgl non è stato caricato!!!");

/*================= SETUP SKYBOX =================*/
const skyboxProgramInfo = webglUtils.createProgramInfo(gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);
const skyboxData = {
		position: [
			-1, -1, 1,
			1, -1, 1,
			-1,  1, 1,
			1,  1, 1,
		],
		indices: [ 0, 1, 2,  2, 1, 3 ],
	};

const skyboxBufferInfo = webglUtils.createBufferInfoFromArrays(gl, skyboxData);

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

const faceInfos = [
	{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'resources/images/skybox/right.jpg' },
	{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'resources/images/skybox/left.jpg' },
	{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'resources/images/skybox/top.jpg' },
	{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'resources/images/skybox/bottom.jpg' },
	{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'resources/images/skybox/front.jpg' },
	{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'resources/images/skybox/back.jpg' },
];

let imagesLoaded = 0;
faceInfos.forEach((faceInfo) => {
	const {target, url} = faceInfo;
	const image = new Image();
	image.src = url;
	image.onload = function() {
		gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		imagesLoaded++;
		if (imagesLoaded === 6) {
			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		}
	};
});

/*================= SETUP FLOOR =================*/
const floorProgramInfo = webglUtils.createProgramInfo(gl, ["floor-vertex-shader", "floor-fragment-shader"]);

const S = 10;   // Floor size
const H = -1.0; // Floor height 
const floorData = {
	position: [
		-S, H, -S, 
		S, H, -S, 
		-S, H,  S, 
		S, H,  S
	],
	color: [
		0, 0.4, 0.7, 1,  
		0, 0.4, 0.7, 1,  
		0, 0.4, 0.7, 1,  
		0, 0.4, 0.7, 1
	],
	indices: [0, 2, 1,  2, 3, 1], 
};
const floorBufferInfo = webglUtils.createBufferInfoFromArrays(gl, floorData);

/*================= SETUP STRANGE CUBE =================*/
const l = 1.5;
const strangeCubeProgramInfo = webglUtils.createProgramInfo(gl, ["strange-cube-vertex-shader", "strange-cube-fragment-shader"]);
const strangeCubeData = {
	position: [
		-l,-l,-l,  l,-l,-l,  l,l,-l,  -l,l,-l,  -l,-l,l,  l,-l,l,  l,l,l, -l,l,l,  
		-l,-l,-l,  -l,l,-l,  -l,l,l,  -l,-l,l,  l,-l,-l,  l,l,-l,  l,l,l,  l,-l,l, 
		-l,-l,-l,  -l,-l,l,  l,-l,l,  l,-l,-l,  -l,l,-l,  -l,l,l,  l,l,l,  l,l,-l,
	],
	color: [
		1,0,0,1,  1,0,0,1,  1,0,0,1,  1,0,0,1,
		0,1,1,1,  0,1,1,1,  0,1,1,1,  0,1,1,1,
		0,0,1,1,  0,0,1,1,  0,0,1,1,  0,0,1,1,
		0,1,0,1,  0,1,0,1,  0,1,0,1,  0,1,0,1,
		1,1,0,1,  1,1,0,1,  1,1,0,1,  1,1,0,1,
		1,0,1,1,  1,0,1,1,  1,0,1,1,  1,0,1,1
	],
	indices: [ 0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11, 12,13,14, 12,14,15, 16,17,18, 16,18,19, 20,21,22, 20,22,23 ],
};

const strangeCubeBufferInfo = webglUtils.createBufferInfoFromArrays(gl, strangeCubeData);

const strangeCubeData2 = {
	position: [-l,-l,-l, l,-l,-l, l,l,-l, -l,l,-l, -l,-l,l, l,-l,l, l,l,l, -l,l,l,],
	color: [
		0,0,0,1, 0,0,0,1,  0,0,0,1,  0,0,0,1,
		0,0,0,1, 0,0,0,1,  0,0,0,1,  0,0,0,1,
	],
	indices:[0,1, 1,2, 2,3, 3,0, 4,5, 5,6, 6,7, 7,4, 1,5, 2,6, 3,7, 0,4],
};
const strangeCubeBufferInfo2 = webglUtils.createBufferInfoFromArrays(gl, strangeCubeData2);

/*================= RENDER LOOP =================*/

function drawScene(time) {
	webglUtils.resizeCanvasToDisplaySize(gl.canvas);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const projectionMatrix = m4.perspective(degToRad(controls.fovy), aspect, controls.near, controls.far);

	const x = Math.cos(controls.theta) * Math.sin(controls.phi) * controls.D;
	const y = Math.cos(controls.phi) * controls.D;
	const z = Math.sin(controls.theta) * Math.sin(controls.phi) * controls.D;

	time *= 0.001;

	var light = [controls.Dlight*Math.sin(controls.phiLight)*Math.cos(controls.thetaLight),
		controls.Dlight*Math.sin(controls.phiLight)*Math.sin(controls.thetaLight),
		controls.Dlight*Math.cos(controls.phiLight), 1];

	var camera = [x, y, z];
	const target = [0, 0, 0];
	const up = [0, 1, 0];

	const viewMatrix = m4.inverse(m4.lookAt(camera, target, up));

	/*========DRAW STRANGE CUBE==========*/
	gl.useProgram(strangeCubeProgramInfo.program);   

	webglUtils.setUniforms(strangeCubeProgramInfo,{
		Vmatrix: viewMatrix,
		Pmatrix: projectionMatrix,
	});
	var dist = S - l -1;

	cubiStrani(time, -dist, -dist);
	cubiStrani(time, dist, -dist);
	cubiStrani(time, -dist, dist);
	cubiStrani(time, dist, dist);

	/*========DRAW FLOOR==========*/
	gl.useProgram(floorProgramInfo.program);

	webglUtils.setBuffersAndAttributes(gl, floorProgramInfo, floorBufferInfo);
	webglUtils.setUniforms(floorProgramInfo, {
		Pmatrix: projectionMatrix,
		Vmatrix: viewMatrix,
	});
	webglUtils.drawBufferInfo(gl, floorBufferInfo);

	/*========DRAW SKYBOX==========*/
	gl.depthFunc(gl.LEQUAL); 
	gl.useProgram(skyboxProgramInfo.program);

	webglUtils.setBuffersAndAttributes(gl, skyboxProgramInfo, skyboxBufferInfo);

	const viewMatrixSkybox = m4.copy(viewMatrix);
	viewMatrixSkybox[12] = 0; 
	viewMatrixSkybox[13] = 0; 
	viewMatrixSkybox[14] = 0;
	const VPMatrixSkybox = m4.multiply(projectionMatrix, viewMatrixSkybox);
	const VPInverseMatrixSkybox = m4.inverse(VPMatrixSkybox);

	webglUtils.setUniforms(skyboxProgramInfo, {
		u_viewProjectionInverse: VPInverseMatrixSkybox,
		u_skybox: texture,
	});
	webglUtils.drawBufferInfo(gl, skyboxBufferInfo);
	requestAnimationFrame(drawScene);
}

drawScene(0);

function cubiStrani(time, dx, dz){

	drawCube(time, dx, dz, 0, 0, 0);
	drawCube(time, dx, dz, degToRad(45), 0, 0); 
	drawCube(time, dx, dz, 0, 0, degToRad(45));
	drawCube(time, dx, dz, 0, degToRad(45), 0);
}

function drawCube(time,dx, dz, rdx,rdy,rdz)
{
	let m_matrix=m4.identity(); 
	m_matrix=m4.translate(m_matrix,dx,2,dz);
	m_matrix=m4.xRotate(m_matrix, time+rdx);
	m_matrix=m4.yRotate(m_matrix, time+rdy);
	m_matrix=m4.zRotate(m_matrix, time+rdz);
	webglUtils.setUniforms(strangeCubeProgramInfo, {
		Mmatrix: m_matrix,
	}); 

	webglUtils.setBuffersAndAttributes(gl, strangeCubeProgramInfo, strangeCubeBufferInfo);
	webglUtils.drawBufferInfo(gl, strangeCubeBufferInfo);

	webglUtils.setBuffersAndAttributes(gl, strangeCubeProgramInfo, strangeCubeBufferInfo2);
	webglUtils.drawBufferInfo(gl, strangeCubeBufferInfo2, gl.LINES);
}

/*================= EVENT MOUSE =================*/
canvas.addEventListener('mousedown', (e) => {
	mouseDown = true;
	lastMouseX = e.clientX;
	lastMouseY = e.clientY;
	e.preventDefault();
});

canvas.addEventListener('mouseup', () => { mouseDown = false; });

canvas.addEventListener('mousemove', (e) => {
	e.preventDefault();
	if (!mouseDown) return;
	const deltaX = e.clientX - lastMouseX;
	const deltaY = e.clientY - lastMouseY;
	lastMouseX = e.clientX;
	lastMouseY = e.clientY;

	controls.theta += deltaX * 0.01;
	controls.phi -= deltaY * 0.01;
    controls.phi = Math.max(0.1, Math.min(3.0, controls.phi));


});

canvas.addEventListener('wheel', (e) => {
	e.preventDefault();
	controls.D += e.deltaY * 0.01;
	controls.D = Math.max(15, Math.min(45, controls.D));
});

/*================= EVENT KEYBOARD =================*/
window.addEventListener('keydown', (e) => {
	if (e.key.toLowerCase() === 'w') {
		controls.phiLight += dr;
	} 
	if (e.key.toLowerCase() === 's') {
		controls.phiLight -= dr;
	}
	if (e.key.toLowerCase() === 'a') {
		controls.thetaLight -= dr;
	} 
	if (e.key.toLowerCase() === 'd') {
		controls.thetaLight += dr;
	}
	controls.phiLight = Math.max(0.1, Math.min(3.0, controls.phiLight));
});
/*================= EVENT TOUCHSCREEN =================*/
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mouseDown = true; 
    
    const touch = e.touches[0];
    lastMouseX = touch.clientX;
    lastMouseY = touch.clientY;
}, { passive: false });

canvas.addEventListener('touchend', () => { mouseDown = false; });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!mouseDown) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - lastMouseX;
    const deltaY = touch.clientY - lastMouseY;

    lastMouseX = touch.clientX;
    lastMouseY = touch.clientY;

    controls.theta += deltaX * 0.01;
    controls.phi -= deltaY * 0.01;

    controls.phi = Math.max(0.1, Math.min(3.0, controls.phi));
}, { passive: false });

const zoomSlider = document.getElementById('zoom-slider');

zoomSlider.addEventListener('input', (e) => {
    controls.D = -parseFloat(e.target.value);
});

