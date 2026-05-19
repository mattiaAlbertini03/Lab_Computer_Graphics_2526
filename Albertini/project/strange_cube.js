const l = 1.5;
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

const strangeCubeData2 = {
	position: [-l,-l,-l, l,-l,-l, l,l,-l, -l,l,-l, -l,-l,l, l,-l,l, l,l,l, -l,l,l,],
	color: [
		0,0,0,1, 0,0,0,1,  0,0,0,1,  0,0,0,1,
		0,0,0,1, 0,0,0,1,  0,0,0,1,  0,0,0,1,
	],
	indices:[0,1, 1,2, 2,3, 3,0, 4,5, 5,6, 6,7, 7,4, 1,5, 2,6, 3,7, 0,4],
};

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


