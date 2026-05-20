const l = 1.5;

const cubeTextures = [
    loadTexture(gl, "resources/images/", "photo.jpg"), 
    loadTexture(gl, "resources/images/", "tentacle.png"), 
    loadTexture(gl, "resources/images/", "abnormal.png"), 
    loadTexture(gl, "resources/images/", "Yog_sothoth.png"), 
];

const strangeCubeData = {
	position: [
		-l,-l,-l,  l,-l,-l,  l,l,-l,  -l,l,-l,  -l,-l,l,  l,-l,l,  l,l,l, -l,l,l,  
		-l,-l,-l,  -l,l,-l,  -l,l,l,  -l,-l,l,  l,-l,-l,  l,l,-l,  l,l,l,  l,-l,l, 
		-l,-l,-l,  -l,-l,l,  l,-l,l,  l,-l,-l,  -l,l,-l,  -l,l,l,  l,l,l,  l,l,-l,
	],
texcoord: [
		0,0, 1,0, 1,1, 0,1,
		0,0, 1,0, 1,1, 0,1,
		0,0, 1,0, 1,1, 0,1,
		0,0, 1,0, 1,1, 0,1,
		0,0, 1,0, 1,1, 0,1,
		0,0, 1,0, 1,1, 0,1  
	],	
	indices: [ 0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11, 12,13,14, 12,14,15, 16,17,18, 16,18,19, 20,21,22, 20,22,23 ],
};

const strangeCubeData2 = {
	position: [-l,-l,-l, l,-l,-l, l,l,-l, -l,l,-l, -l,-l,l, l,-l,l, l,l,l, -l,l,l,],
	color: [
		0,0,0,1, 0,0,0,1,  0,0,0,1,  0,0,0,1,
		0,0,0,1, 0,0,0,1,  0,0,0,1,  0,0,0,1,
	],
	indices:[0,1, 1,2, 2,3, 3,0, 4,5, 5,6, 6,7, 7,4, 1,5, 2,6, 3,7, 0,4],
};

var strangeCubeBufferInfo = webglUtils.createBufferInfoFromArrays(gl, strangeCubeData);
var strangeCubeBufferInfo2 = webglUtils.createBufferInfoFromArrays(gl, strangeCubeData2);
var strangeCubeProgramInfo = webglUtils.createProgramInfo(gl, ["strange-cube-vertex-shader", "strange-cube-fragment-shader"]);

function drawCube(time,dx, dz, idx)
{
	let m_matrix=m4.identity(); 
	m_matrix=m4.translate(m_matrix,dx,3,dz);
	m_matrix=m4.xRotate(m_matrix, time);
	m_matrix=m4.yRotate(m_matrix, -time);
	m_matrix=m4.zRotate(m_matrix, time);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, cubeTextures[idx]);
	webglUtils.setUniforms(strangeCubeProgramInfo, {
		Mmatrix: m_matrix,
		mode: idx,
	}); 

	webglUtils.setBuffersAndAttributes(gl, strangeCubeProgramInfo, strangeCubeBufferInfo);
	webglUtils.drawBufferInfo(gl, strangeCubeBufferInfo);

	webglUtils.setBuffersAndAttributes(gl, strangeCubeProgramInfo, strangeCubeBufferInfo2);
	webglUtils.drawBufferInfo(gl, strangeCubeBufferInfo2, gl.LINES);
}

function drawCubes(time){
	gl.useProgram(strangeCubeProgramInfo.program);   

	webglUtils.setUniforms(strangeCubeProgramInfo,{
		Vmatrix: m4.copy(viewMatrix),
		Pmatrix: projectionMatrix,
	});
	var dist = S - l - 1.5;

	drawCube(time, -dist, -dist, 0); 
	drawCube(-time, dist, -dist, 1); 
	drawCube(-time, -dist, dist, 2); 
	drawCube(time, dist, dist, 3);   
}

