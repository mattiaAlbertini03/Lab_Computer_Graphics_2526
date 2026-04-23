"use strict";

let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;
let theta = 0;
let phi = 0;
let cameraRadius = 2;
function createXYQuadVertices() {
	var xOffset = 0;
	var yOffset = 0;
	var size = 1;
	return {
		position: {
			numComponents: 2,
			data: [
				xOffset + -1 * size, yOffset + -1 * size,
				xOffset +  1 * size, yOffset + -1 * size,
				xOffset + -1 * size, yOffset +  1 * size,
				xOffset +  1 * size, yOffset +  1 * size,
			],
		},
		normal: [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
		],
		texcoord: [
			0, 0,
			1, 0,
			0, 1,
			1, 1,
		],
		indices: [ 0, 1, 2, 2, 1, 3 ],
	};
}


function main() {
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext("webgl");
	if (!gl) {
		return;
	}

	const skyboxProgramInfo = webglUtils.createProgramInfo( gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);

	const arrays2 = createXYQuadVertices.apply(null,  Array.prototype.slice.call(arguments, 1));
	const quadBufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays2);

	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

	// ADD THESE LINES:
	// Set temporary filters so the texture is "complete" immediately
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	const faceInfos = [
		{
			target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
			url: 'resources/images/skybox/right.jpg',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
			url: 'resources/images/skybox/left.jpg',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
			url: 'resources/images/skybox/top.jpg',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
			url: 'resources/images/skybox/bottom.jpg',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
			url: 'resources/images/skybox/front.jpg',
		},
		{
			target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
			url: 'resources/images/skybox/back.jpg',
		},
	];

	let imagesLoaded = 0;

	faceInfos.forEach((faceInfo) => {
		const {target, url} = faceInfo;


		const image = new Image();
		image.src = url;
		image.onload = function() {
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
			gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

			imagesLoaded++;

			if (imagesLoaded === 6) {
				gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			}
		};

	});

	function radToDeg(r) {
		return r * 180 / Math.PI;
	}

	function degToRad(d) {
		return d * Math.PI / 180;
	}

	// Get the starting time.
	var then = 0;

	drawScene(0);


	function drawScene(time) {
		// convert to seconds
		time *= 0.001;

		// Subtract the previous time from the current time
		var deltaTime = time - then;
		// Remember the current time for the next frame.
		then = time;

		webglUtils.resizeCanvasToDisplaySize(gl.canvas);
		
		// Tell WebGL how to convert from clip space to pixels
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		//GC non c'è geometria 3D in questo codice
		// gl.enable(gl.CULL_FACE);
		// gl.enable(gl.DEPTH_TEST);

		// Clear the canvas AND the depth buffer.
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Leggi i valori aggiornati ogni frame
		const fieldOfViewRadians = degToRad(60);

		const radius = cameraRadius;

		// Compute the projection matrix
		var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
		var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

		//camera going in circle 2 units from origin looking at origin
		//var cameraPosition = [Math.cos(time * .1) * 2, 0, Math.sin(time * .1) * 2];
		var x = Math.sin(theta) * Math.cos(phi) * cameraRadius;
		var y = Math.sin(phi) * cameraRadius;
		var z = Math.cos(theta) * Math.cos(phi) * cameraRadius;

		var cameraPosition = [x, y, z];

		var target = [0, 0, 0];
		var up = [0, 1, 0];
		// Compute the camera's matrix using look at.
		var cameraMatrix = m4.lookAt(cameraPosition, target, up);

		// Make a view matrix from the camera matrix.
		var viewMatrix = m4.inverse(cameraMatrix);

		// Rotate the cube around the x axis
		//var worldMatrix = m4.xRotation(time * 0.11);

		// We only care about direction so remove the translation
		var viewDirectionMatrix = m4.copy(viewMatrix);
		viewDirectionMatrix[12] = 0;
		viewDirectionMatrix[13] = 0;
		viewDirectionMatrix[14] = 0;

		var viewDirectionProjectionMatrix = m4.multiply(projectionMatrix, viewDirectionMatrix);
		var viewDirectionProjectionInverseMatrix = m4.inverse(viewDirectionProjectionMatrix);

		// draw the skybox
		// let our quad pass the depth test at 1.0
		gl.depthFunc(gl.LEQUAL);

		gl.useProgram(skyboxProgramInfo.program);
		webglUtils.setBuffersAndAttributes(gl, skyboxProgramInfo, quadBufferInfo);
		webglUtils.setUniforms(skyboxProgramInfo, {
			u_viewDirectionProjectionInverse: viewDirectionProjectionInverseMatrix,
			u_skybox: texture,
		});
		webglUtils.drawBufferInfo(gl, quadBufferInfo);

		requestAnimationFrame(drawScene);
	}
}

main();

canvas.addEventListener('mousedown', (e) => {
	mouseDown = true;
	lastMouseX = e.clientX;
	lastMouseY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
	mouseDown = false;
});

canvas.addEventListener('mousemove', (e) => {
	if (!mouseDown) return;

	const deltaX = e.clientX - lastMouseX;
	const deltaY = e.clientY - lastMouseY;

	lastMouseX = e.clientX;
	lastMouseY = e.clientY;

	const sensitivity = 0.01;
	theta += deltaX * sensitivity;
	phi += deltaY * sensitivity;
	//e.preventDefault();
});

canvas.addEventListener('wheel', (e) => {
	e.preventDefault(); // evita lo scroll della pagina

	const zoomSpeed = 0.1;
	cameraRadius += e.deltaY * zoomSpeed * 0.01;

	// Limiti min/max per evitare problemi
	cameraRadius = Math.max(0.5, Math.min(10, cameraRadius));
});

/*
rivedi le cose un po meglio


old_x = lastMouseX
old_y = lastMouseY
drag = mouseDown
D = cameraRadius

???
gl.texImage2D(target, 0, gl.RGBA, 2048, 2048, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);


	const arrays2 = createXYQuadVertices.apply(null,  Array.prototype.slice.call(arguments, 1));
	const quadBufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays2);

function createXYQuadVertices() {
	var xOffset = 0;
	var yOffset = 0;
	var size = 1;
	return {
		position: {
			numComponents: 2,
			data: [
				xOffset + -1 * size, yOffset + -1 * size,
				xOffset +  1 * size, yOffset + -1 * size,
				xOffset + -1 * size, yOffset +  1 * size,
				xOffset +  1 * size, yOffset +  1 * size,
			],
		},
		normal: [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
		],
		texcoord: [
			0, 0,
			1, 0,
			0, 1,
			1, 1,
		],
		indices: [ 0, 1, 2, 2, 1, 3 ],
	};
}
*/
