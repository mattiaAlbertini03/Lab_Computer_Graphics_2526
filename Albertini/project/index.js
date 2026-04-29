"use strict";

let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

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

var  controls = {
	D : 20.0,
	theta: 1.1 ,
	phi: 1.4,
	near : 1,
	far : 100,
	fovy : 50.0,  
}

var dr = 5.0 * Math.PI/180.0;

function define_gui(){
	var gui = new dat.GUI();
	gui.add(controls,"D").min(0.5).max(40).step(0.5);
	gui.add(controls,"theta").min(0).max(6.28).step(dr);
	gui.add(controls,"phi").min(0.1).max(3.0).step(dr);
	gui.add(controls,"near").min(1).max(10).step(1);
	gui.add(controls,"far").min(1).max(200).step(1);
	gui.add(controls,"fovy").min(10).max(120).step(5);
}

function main() {

	define_gui();

	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext("webgl");
	if (!gl) return;

	/*================= SETUP SKYBOX =================*/
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

	/*================= SETUP FLOOR =================*/
	const floorProgramInfo = webglUtils.createProgramInfo(gl, ["floor-vertex-shader", "floor-fragment-shader"]);

	const S = 6;   // Floor size
	const H = -1.0; // Floor height (lowered slightly so it sits properly in the scene)
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
	const l = 1.0;
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
		position: [
			-l,-l,-l, l,-l,-l, l,l,-l, -l,l,-l, -l,-l,l, l,-l,l, l,l,l, -l,l,l,],
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

		//TODO da commendare o no???
		//gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Calculate Camera & Matrices
		const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
		const projectionMatrix = m4.perspective(degToRad(controls.fovy), aspect, controls.near, controls.far);

		const x = Math.cos(controls.theta) * Math.sin(controls.phi) * controls.D;
		const y = Math.cos(controls.phi) * controls.D;
		const z = Math.sin(controls.theta) * Math.sin(controls.phi) * controls.D;

		time *= 0.001;
		//var camera = [Math.cos(time * .1) * 2, 0, Math.sin(time * .1) * 2];  //se fosse fattibile usare per Lvce

		const camera = [x, y, z];
		const target = [0, 0, 0];
		const up = [0, 1, 0];

		// The view matrix looks from the camera to the target
		const viewMatrix = m4.inverse(m4.lookAt(camera, target, up));

		/*========DRAW STRANGE CUBE==========*/
		gl.useProgram(strangeCubeProgramInfo.program);   

		webglUtils.setUniforms(strangeCubeProgramInfo,{
			Vmatrix: viewMatrix,
			Pmatrix: projectionMatrix,
		});

		let mo_matrix=m4.identity(); 
		webglUtils.setUniforms(strangeCubeProgramInfo, {
			Mmatrix: mo_matrix,
		});
		var dist = S - l -1;

		cubiStrani(mo_matrix, time, -dist, -dist);
		cubiStrani(mo_matrix, time, dist, -dist);
		cubiStrani(mo_matrix, time, -dist, dist);
		cubiStrani(mo_matrix, time, dist, dist);

		/*========DRAW FLOOR==========*/
		gl.useProgram(floorProgramInfo.program);

		webglUtils.setBuffersAndAttributes(gl, floorProgramInfo, floorBufferInfo);
		webglUtils.setUniforms(floorProgramInfo, {
			Pmatrix: projectionMatrix,
			Vmatrix: viewMatrix,
		});
		webglUtils.drawBufferInfo(gl, floorBufferInfo);

		/*========DRAW SKYBOX==========*/
		// LEQUAL is important: it ensures the skybox renders exactly at the far clipping plane
		gl.depthFunc(gl.LEQUAL); 
		gl.useProgram(skyboxProgramInfo.program);

		webglUtils.setBuffersAndAttributes(gl, skyboxProgramInfo, skyboxBufferInfo);

		// We only want camera rotation (not translation) for the skybox to create the illusion of infinite distance
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

	// disegna cubi
	function cubiStrani(mo_matrix, time, dx, dz){

		drawCube(m4.copy(mo_matrix), time, dx, dz, 0, 0, 0);
		drawCube(m4.copy(mo_matrix), time, dx, dz, degToRad(45), 0, 0); 
		drawCube(m4.copy(mo_matrix), time, dx, dz, 0, 0, degToRad(45));
		drawCube(m4.copy(mo_matrix), time, dx, dz, 0, degToRad(45), 0);
	}

	function drawCube(m_matrix,time,dx, dz, rdx,rdy,rdz)
	{
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
		controls.phi += deltaY * 0.01;
	});

	canvas.addEventListener('wheel', (e) => {
		e.preventDefault();
		controls.D += e.deltaY * 0.01;
		// Increased maximum limit to 30 so you can zoom further out
		controls.D = Math.max(0.5, Math.min(40, controls.D));
	});
}

main();
