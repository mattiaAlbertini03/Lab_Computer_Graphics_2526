"use strict";

let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Set initial camera angles and a larger distance to see the whole floor
let theta = degToRad(50);
let phi = degToRad(30);
let D = 10; // Increased from 2 to 10 so the floor fits in the view

function radToDeg(r) { return r * 180 / Math.PI; }
function degToRad(d) { return d * Math.PI / 180; }

function createXYQuadVertices() {
	return {
		position: [
			-1, -1, 1,
			1, -1, 1,
			-1,  1, 1,
			1,  1, 1,
		],
		indices: [ 0, 1, 2,  2, 1, 3 ],
	};
}

function main() {
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext("webgl");
	if (!gl) return;

	/*================= 1. SETUP SKYBOX =================*/
	const skyboxProgramInfo = webglUtils.createProgramInfo(gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);
	const skyboxBufferInfo = webglUtils.createBufferInfoFromArrays(gl, createXYQuadVertices());

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

	/*================= 2. SETUP FLOOR =================*/
	const floorProgramInfo = webglUtils.createProgramInfo(gl, ["floor-vertex-shader", "floor-fragment-shader"]);

	const S = 3;   // Floor size
	const H = -0.5; // Floor height (lowered slightly so it sits properly in the scene)
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

	/*================= RENDER LOOP =================*/

	function drawScene(time) {
		webglUtils.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		//TODO da commendare o no???
		//gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Calculate Camera & Matrices
		const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
		const projectionMatrix = m4.perspective(degToRad(40), aspect, 1, 100);

		const x = Math.sin(theta) * Math.cos(phi) * D;
		const y = Math.sin(phi) * D;
		const z = Math.cos(theta) * Math.cos(phi) * D;
		
		//time *= 0.001;
		//var camera = [Math.cos(time * .1) * 2, 0, Math.sin(time * .1) * 2];  //se fosse fattibile usare per Lvce

		const camera = [x, y, z];
		const target = [0, 0, 0];
		const up = [0, 1, 0];

		// The view matrix looks from the camera to the target
		const viewMatrix = m4.inverse(m4.lookAt(camera, target, up));
		const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

		// We only want camera rotation (not translation) for the skybox to create the illusion of infinite distance
		const viewMatrixSkybox = m4.copy(viewMatrix);
		viewMatrixSkybox[12] = 0; 
		viewMatrixSkybox[13] = 0; 
		viewMatrixSkybox[14] = 0;
		const VPMatrixSkybox = m4.multiply(projectionMatrix, viewMatrixSkybox);
		const VPInverseMatrixSkybox = m4.inverse(VPMatrixSkybox);

		/*========DRAW FLOOR==========*/
		gl.useProgram(floorProgramInfo.program);

		webglUtils.setBuffersAndAttributes(gl, floorProgramInfo, floorBufferInfo);
		webglUtils.setUniforms(floorProgramInfo, {
			PVmatrix: viewProjectionMatrix,
		});
		webglUtils.drawBufferInfo(gl, floorBufferInfo);

		/*========DRAW SKYBOX==========*/
		// LEQUAL is important: it ensures the skybox renders exactly at the far clipping plane
		gl.depthFunc(gl.LEQUAL); 
		gl.useProgram(skyboxProgramInfo.program);
		webglUtils.setBuffersAndAttributes(gl, skyboxProgramInfo, skyboxBufferInfo);
		webglUtils.setUniforms(skyboxProgramInfo, {
			u_viewProjectionInverse: VPInverseMatrixSkybox,
			u_skybox: texture,
		});
		webglUtils.drawBufferInfo(gl, skyboxBufferInfo);
		requestAnimationFrame(drawScene);
	}

	drawScene(0);

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

		theta += deltaX * 0.01;
		phi += deltaY * 0.01;

		// Clamp the up/down looking angle so the camera doesn't flip over
		phi = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, phi));
	});

	canvas.addEventListener('wheel', (e) => {
		e.preventDefault();
		D += e.deltaY * 0.01;
		// Increased maximum limit to 30 so you can zoom further out
		D = Math.max(0.5, Math.min(30, D));
	});
}

main();
