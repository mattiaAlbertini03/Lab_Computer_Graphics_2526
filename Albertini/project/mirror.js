const colors = [
	[
		0, 0, 0, 0,  
		0, 0, 0, 0,  
		0, 0, 0, 0,  
		0, 0, 0, 0
	],
	[
		0.1, 0.1, 0.1, 1,  
		0.1, 0.1, 0.1, 1,  
		0.1, 0.1, 0.1, 1,  
		0.1, 0.1, 0.1, 1
	],
]

var S = 10;
const mirrorData = {
	position: [
		-S, 0, -S, 
		S, 0, -S, 
		-S, 0,  S, 
		S, 0,  S
	],
	color: colors[1],
	indices: [0, 2, 1,  2, 3, 1], 
};
var mirrorBufferInfo = webglUtils.createBufferInfoFromArrays(gl, mirrorData);

const mirrorData2 = {
	position: [
		-S, 0, -S, 
		S, 0, -S, 
		-S, 0,  S, 
		S, 0,  S
	],
	color: colors[1],
	indices: [0, 2, 1,  2, 3, 1], 
};
var mirrorBufferInfo2 = webglUtils.createBufferInfoFromArrays(gl, mirrorData2);

var mirrorProgramInfo = webglUtils.createProgramInfo(gl, ["mirror-vertex-shader", "mirror-fragment-shader"]);

function drawMirror(viewM, time){
	var view = viewM;
	gl.useProgram(mirrorProgramInfo.program);
	gl.enable(gl.STENCIL_TEST);
	gl.clearStencil(0x0);
	gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
	gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
	gl.colorMask(false, false, false, false);
	gl.depthFunc(gl.ALWAYS);
	gl.depthMask(false);

	drawData(view, mirrorBufferInfo);

	gl.depthMask(true);
	gl.colorMask(true, true, true, true);
	gl.depthFunc(gl.LESS);
	gl.stencilFunc(gl.EQUAL, 1, 0xFF);

	if (camera[1] >= 0){
		const reflectY = [1,0,0,0, 0,-1,0,0, 0,0,1,0, 0,0,0,1];
		const reflView = m4.multiply(m4.copy(view), reflectY);
		drawCubes(time, reflView);
		drawObj(reflView);
	}
	gl.disable(gl.STENCIL_TEST);

	if(camera[1] < 0)
		drawData(view, mirrorBufferInfo2);

}


function drawData(view, buffer){

	webglUtils.setBuffersAndAttributes(gl, mirrorProgramInfo, buffer);

	webglUtils.setUniforms(mirrorProgramInfo, {
		Vmatrix: m4.copy(view),
		Pmatrix: projectionMatrix,
	});
	webglUtils.drawBufferInfo(gl, buffer);

}
