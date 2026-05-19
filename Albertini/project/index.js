"use strict";
var mesh = new Array();
var positions = [];
var normals = [];
var texcoords = [];
var numVertices;
var ambient, diffuse, specular, emissive, shininess, opacity;
var objBufferInfo;
var objProgramInfo;

var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl");
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
const strangeCubeProgramInfo = webglUtils.createProgramInfo(gl, ["strange-cube-vertex-shader", "strange-cube-fragment-shader"]);
const strangeCubeBufferInfo = webglUtils.createBufferInfoFromArrays(gl, strangeCubeData);
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

	var light = [controls.DLight*Math.sin(controls.phiLight)*Math.cos(controls.thetaLight),
		controls.DLight*Math.sin(controls.phiLight)*Math.sin(controls.thetaLight),
		controls.DLight*Math.cos(controls.phiLight), 1];

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

/*========DRAW OBJ MODEL==========*/
	if (objBufferInfo) { // Safety check to ensure it's loaded
		gl.useProgram(objProgramInfo.program);
		
		// Adjust this matrix if the model is too big/small or rotated wrong
		var objWorldMatrix = m4.identity();
		objWorldMatrix = m4.yRotate(objWorldMatrix, time * 0.5); // Add a little spin
		// Example to move it up slightly if it's clipping the floor:
		// objWorldMatrix = m4.translate(objWorldMatrix, 0, 1.0, 0); 
		
		webglUtils.setBuffersAndAttributes(gl, objProgramInfo, objBufferInfo);
		
		webglUtils.setUniforms(objProgramInfo, {
			u_view: viewMatrix,
			u_projection: projectionMatrix,
			u_world: objWorldMatrix,
			u_viewWorldPosition: camera, // Uses 'camera' array from index.js
			u_lightDirection: m4.normalize([light[0], light[1], light[2]]), // Uses 'light' from index.js
			u_ambientLight: [0.2, 0.2, 0.2],
			u_colorLight: [1.0, 1.0, 1.0],
			diffuse: diffuse,
			ambient: ambient,
			specular: specular,
			emissive: emissive,
			shininess: shininess,
			opacity: opacity
		});

		// Texture Binding
		gl.uniform1i(gl.getUniformLocation(objProgramInfo.program, "diffuseMap"), 0);
		gl.activeTexture(gl.TEXTURE0);
		for (var m = mesh.materials.length - 1; m >= 0; m--) {
			if (mesh.materials[m] && mesh.materials[m].parameter) {
				var tex = mesh.materials[m].parameter.get("map_Kd");
				if (tex instanceof WebGLTexture) {
					gl.bindTexture(gl.TEXTURE_2D, tex);
					break;
				}
			}
		}

		webglUtils.drawBufferInfo(gl, objBufferInfo, gl.TRIANGLES, numVertices);
	}
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

// Remove drawScene(0); at the bottom and put this instead:

objProgramInfo = webglUtils.createProgramInfo(gl, ["obj-vertex-shader", "obj-fragment-shader"]);
mesh.sourceMesh = 'resources/data/lovecraft.obj';

(async () => {
    await LoadMesh(gl, mesh);
    
    var Data = {
        position: { numComponents: 3, data: positions },
        normal: { numComponents: 3, data: normals },
        texcoord: { numComponents: 2, data: texcoords },
    };
    objBufferInfo = webglUtils.createBufferInfoFromArrays(gl, Data);
    
    // Start the render loop ONLY after the model is fully loaded
    drawScene(0);
})();
