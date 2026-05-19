const skyboxData = {
	position: [
		-1, -1, 1,
		1, -1, 1,
		-1,  1, 1,
		1,  1, 1,
	],
	indices: [ 0, 1, 2,  2, 1, 3 ],
};

;

skyboxProgramInfo = webglUtils.createProgramInfo(gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);

skyboxBufferInfo = webglUtils.createBufferInfoFromArrays(gl, skyboxData);
const textureSkybox = gl.createTexture();
gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
const faceInfos = [
	{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'resources/images/skybox/right.jpg' },
	{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'resources/images/skybox/left.jpg' },
	{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'resources/images/skybox/top.jpg' },
	{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'resources/images/skybox/bottom.jpg' },
	{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'resources/images/skybox/front.jpg' },
	{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'resources/images/skybox/back.jpg' },
]
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

