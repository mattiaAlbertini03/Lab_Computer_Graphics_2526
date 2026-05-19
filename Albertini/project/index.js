"use strict";

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



/*================= SETUP OBJ =================*/
var objProgramInfo = webglUtils.createProgramInfo(gl, ["obj-vertex-shader", "obj-fragment-shader"]);
var objBufferInfo;
var dataUniform;
var dataObj;
var mesh = new Array();
var numVertices;

/*================= SETUP SKYBOX =================*/
var skyboxProgramInfo;
var skyboxBufferInfo; 

/*================= SETUP FLOOR =================*/
var floorProgramInfo;
var floorBufferInfo;

/*================= SETUP STRANGE CUBE =================*/
var strangeCubeProgramInfo;
var strangeCubeBufferInfo;
var strangeCubeBufferInfo2;

/*================= RENDER LOOP =================*/

webglUtils.resizeCanvasToDisplaySize(gl.canvas);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

function drawScene(time) {
	time *= 0.001;

	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const projectionMatrix = m4.perspective(degToRad(controls.fovy), aspect, controls.near, controls.far);

	const x = Math.cos(controls.theta) * Math.sin(controls.phi) * controls.D;
	const y = Math.cos(controls.phi) * controls.D;
	const z = Math.sin(controls.theta) * Math.sin(controls.phi) * controls.D;

	const xLight = Math.cos(controls.thetaLight) * Math.sin(controls.phiLight) * controls.DLight;
	const yLight = Math.cos(controls.phiLight) * controls.DLight;
	const zLight = Math.sin(controls.thetaLight) * Math.sin(controls.phiLight) * controls.DLight;

	var light = [xLight, yLight, zLight];

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
	cubiStrani(-time, dist, -dist);
	cubiStrani(-time, -dist, dist);
	cubiStrani(time, dist, dist);

	/*========DRAW FLOOR==========*/
	gl.useProgram(floorProgramInfo.program);

	webglUtils.setBuffersAndAttributes(gl, floorProgramInfo, floorBufferInfo);
	webglUtils.setUniforms(floorProgramInfo, {
		Vmatrix: viewMatrix,
		Pmatrix: projectionMatrix,
	});
	webglUtils.drawBufferInfo(gl, floorBufferInfo);

	/*========DRAW OBJ MODEL==========*/
	gl.useProgram(objProgramInfo.program);
	webglUtils.setBuffersAndAttributes(gl, objProgramInfo, objBufferInfo);
	
	webglUtils.setUniforms(objProgramInfo, dataUniform);

	var objWorldMatrix = m4.identity();
	objWorldMatrix = m4.scale(objWorldMatrix, 4, 4, 4);
	objWorldMatrix = m4.translate(objWorldMatrix, 0, 0.75, 0);

	webglUtils.setUniforms(objProgramInfo, {
		u_view: viewMatrix,
		u_projection: projectionMatrix,
		u_world: objWorldMatrix,
		u_viewWorldPosition: camera, 
		u_lightDirection: m4.normalize([light[0], light[1], light[2]]), 
		u_ambientLight: [0.2, 0.2, 0.2],
		u_colorLight: [1.0, 1.0, 1.0],
	});
	
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
		u_skybox: textureSkybox,
	});
	webglUtils.drawBufferInfo(gl, skyboxBufferInfo);

	
	requestAnimationFrame(drawScene);
}

mesh.sourceMesh = 'resources/data/lovecraft.obj';

(async () => {
	await LoadMesh(gl, mesh);

	objBufferInfo = webglUtils.createBufferInfoFromArrays(gl, dataObj);

	// Start the render loop ONLY after the model is fully loaded
	drawScene(0);
})();
