var objProgramInfo = webglUtils.createProgramInfo(gl, ["obj-vertex-shader", "obj-fragment-shader"]);
var objBufferInfo;
var dataObj;
var numVertices;
var dataUniform;

function drawObj(){
	gl.useProgram(objProgramInfo.program);
	webglUtils.setBuffersAndAttributes(gl, objProgramInfo, objBufferInfo);
	
	webglUtils.setUniforms(objProgramInfo, dataUniform);

	var objWorldMatrix = m4.identity();
	objWorldMatrix = m4.scale(objWorldMatrix, 4, 4, 4);
	objWorldMatrix = m4.translate(objWorldMatrix, 0, 1., 0);

	webglUtils.setUniforms(objProgramInfo, {
		u_view: m4.copy(viewMatrix),
		u_projection: projectionMatrix,
		u_world: objWorldMatrix,
		u_viewWorldPosition: camera, 
		u_lightDirection: m4.normalize([light[0], light[1], light[2]]), 
		u_ambientLight: [0.2, 0.2, 0.2],
		u_colorLight: [1.0, 1.0, 1.0],
	});
	
	gl.uniform1i(gl.getUniformLocation(objProgramInfo.program, "diffuseMap"), 0);

	gl.activeTexture(gl.TEXTURE0);
	if (dataUniform && dataUniform.diffuseMapTex) {
		gl.bindTexture(gl.TEXTURE_2D, dataUniform.diffuseMapTex);
	}

	webglUtils.drawBufferInfo(gl, objBufferInfo, gl.TRIANGLES, numVertices);

}


