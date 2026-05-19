const S = 10;   // Floor sizE
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
floorBufferInfo = webglUtils.createBufferInfoFromArrays(gl, floorData);

floorProgramInfo = webglUtils.createProgramInfo(gl, ["floor-vertex-shader", "floor-fragment-shader"]);

