const skyboxData = {
	position: [
		-1, -1, 1,
		1, -1, 1,
		-1,  1, 1,
		1,  1, 1,
	],
	indices: [ 0, 1, 2,  2, 1, 3 ],
};

var skyboxProgramInfo = webglUtils.createProgramInfo(gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);

var skyboxBufferInfo = webglUtils.createBufferInfoFromArrays(gl, skyboxData);

const textureSkybox = gl.createTexture();
gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureSkybox);


const faceInfos = [
	{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'resources/images/skybox/xpos.png' },
	{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'resources/images/skybox/xneg.png' },
	{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'resources/images/skybox/ypos.png' },
	{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'resources/images/skybox/yneg.png' },
	{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'resources/images/skybox/zpos.png' },
	{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'resources/images/skybox/zneg.png' },
]

let imagesLoaded = 0;
faceInfos.forEach((faceInfo) => {
	const {target, url} = faceInfo;
	const image = new Image();
	image.src = url;
	image.onload = function() {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		imagesLoaded++;
		if (imagesLoaded === 6) {
			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		}
	};
});


function drawSkybox(view0){
	gl.useProgram(skyboxProgramInfo.program);

	webglUtils.setBuffersAndAttributes(gl, skyboxProgramInfo, skyboxBufferInfo);

	var view = m4.copy(view0);

	view[12] = 0; 
	view[13] = 0; 
	view[14] = 0;

	const VPMatrix = m4.multiply(projectionMatrix, view);
	const VPIMatrix = m4.inverse(VPMatrix);

	webglUtils.setUniforms(skyboxProgramInfo, {
		u_VPInverse: VPIMatrix,
		u_skybox: textureSkybox,
	});
	webglUtils.drawBufferInfo(gl, skyboxBufferInfo);
}


