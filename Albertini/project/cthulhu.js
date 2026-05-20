var objProgramInfo = webglUtils.createProgramInfo(gl, ["obj-vertex-shader", "obj-fragment-shader"]);
var objBufferInfo;
var dataObj;
var numVertices;
var dataUniform;

function drawObj(){
	gl.useProgram(objProgramInfo.program);
	webglUtils.setBuffersAndAttributes(gl, objProgramInfo, objBufferInfo);
	
	webglUtils.setUniforms(objProgramInfo, dataUniform);

	var m_matrix = m4.identity();
	m_matrix = m4.scale(m_matrix, 4, 4, 4);
	m_matrix = m4.translate(m_matrix, 0, 1., 0);

	webglUtils.setUniforms(objProgramInfo, {
		Vmatrix: m4.copy(viewMatrix),
		Pmatrix: projectionMatrix,
		Mmatrix: m_matrix,
		camera: camera, 
		u_lightDirection: m4.normalize([light[0], light[1], light[2]]), 
		u_ambientLight: ambientLight,
		u_colorLight: colorLight,
	});
	
	gl.uniform1i(gl.getUniformLocation(objProgramInfo.program, "diffuseMap"), 0);

	gl.activeTexture(gl.TEXTURE0);
	if (dataUniform && dataUniform.diffuseMapTex) {
		gl.bindTexture(gl.TEXTURE_2D, dataUniform.diffuseMapTex);
	}

	webglUtils.drawBufferInfo(gl, objBufferInfo, gl.TRIANGLES, numVertices);

}


