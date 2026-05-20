const S = 10;   // Floor sizE
const floorData = {
	position: [
		-S, 0, -S, 
		S, 0, -S, 
		-S, 0,  S, 
		S, 0,  S
	],
	color: [
		0, 0.4, 0.7, 1,  
		0, 0.4, 0.7, 1,  
		0, 0.4, 0.7, 1,  
		0, 0.4, 0.7, 1
	],
	indices: [0, 2, 1,  2, 3, 1], 
};
var floorBufferInfo = webglUtils.createBufferInfoFromArrays(gl, floorData);

var floorProgramInfo = webglUtils.createProgramInfo(gl, ["floor-vertex-shader", "floor-fragment-shader"]);

function drawFloor(){
	
	gl.useProgram(floorProgramInfo.program);
	webglUtils.setBuffersAndAttributes(gl, floorProgramInfo, floorBufferInfo);

	webglUtils.setUniforms(floorProgramInfo, {
		Vmatrix: m4.copy(viewMatrix),
		Pmatrix: projectionMatrix,
	});
	webglUtils.drawBufferInfo(gl, floorBufferInfo);
}
