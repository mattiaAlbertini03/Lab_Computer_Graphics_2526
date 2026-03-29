var canvas = document.getElementById('my_Canvas4');
var gl = canvas.getContext('experimental-webgl');
/*========== Defining and storing the geometry ==========*/
var vertices=[
	-1,-1,-1,  1,-1,-1,  1,1,-1,  -1,1,-1,  -1,-1,1,  1,-1,1,  1,1,1, -1,1,1,  
	-1,-1,-1,  -1,1,-1,  -1,1,1,  -1,-1,1,  1,-1,-1,  1,1,-1,  1,1,1,  1,-1,1, 
	-1,-1,-1,  -1,-1,1,  1,-1,1,  1,-1,-1,  -1,1,-1,  -1,1,1,  1,1,1,  1,1,-1,];
var colors=[
	1,0,1,1,  1,0,1,1,  1,0,1,1,  1,0,1,1,
	1,0,0,1,  1,0,0,1,  1,0,0,1,  1,0,0,1,
	0,0,1,1,  0,0,1,1,  0,0,1,1,  0,0,1,1,
	0,1,1,1,  0,1,1,1,  0,1,1,1,  0,1,1,1,
	1,1,0,1,  1,1,0,1,  1,1,0,1,  1,1,0,1,
	0,1,0,1,  0,1,0,1,  0,1,0,1,  0,1,0,1];
var indices = [
	0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11, 12,13,14, 12,14,15, 16,17,18, 16,18,19, 20,21,22, 20,22,23 ];
var texcoords = [
	1.0, 0.0,  1.0, 1.0,   0.0, 1.0,  0.0, 0.0,
	1.0, 0.0,  1.0, 1.0,   0.0, 1.0,  0.0, 0.0,
	1.0, 0.0,  1.0, 1.0,   0.0, 1.0,  0.0, 0.0,
	1.0, 0.0,  1.0, 1.0,   0.0, 1.0,  0.0, 0.0,
	1.0, 0.0,  1.0, 1.0,   0.0, 1.0,  0.0, 0.0,
	1.0, 0.0,  1.0, 1.0,   0.0, 1.0,  0.0, 0.0,];

let data = {
	position: vertices,
	color: colors,
	texcoord: texcoords,
	indices: indices,
};
const bufferCuboInfo = webglUtils.createBufferInfoFromArrays(gl, data); 

// Create a texture.
var texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
// Fill the texture with a 1x1 blue pixel.
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
	new Uint8Array([0, 0, 255, 255]));
// Asynchronously load an image
var image = new Image();
image.src = "grid.png";

image.addEventListener('load', function() {
	// Now that the image has loaded make copy it to the texture.
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);

	// Check if the image is a power of 2 in both dimensions.
	if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
		// Yes, it's a power of 2. Generate mips.
		gl.generateMipmap(gl.TEXTURE_2D);
	} else {
		// No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
});

/*=================== SHADERS =================== */
var programInfo = webglUtils.createProgramInfo(gl, ["vertex-shader4", "fragment-shader4"]);


gl.useProgram(programInfo.program);

var THETA = degToRad(20);
var PHI = degToRad(60);
var D = 5; 
var r=Math.sqrt(3);
var s=r*D/Math.sqrt(Math.pow(D,2)-Math.pow(r,2));
var alpha=2*Math.atan(s/D);
var salpha=0.025;
var dr = degToRad(2.4);


function degToRad(d) {
	return d * Math.PI / 180;
}

function isPowerOf2(value) {
	return (value & (value - 1)) === 0;
}

var mouseDown=function(e) {
	drag=true;
	old_x=e.pageX;
	old_y=e.pageY;
	return false;
};

var mouseUp=function(e){
	drag=false;
};

var mouseMove=function(e) {
	if (!drag) return false; 
	dX=(e.pageX-old_x)*2*Math.PI/canvas.width; 
	dY=(e.pageY-old_y)*2*Math.PI/canvas.height; 
	THETA+=dX;
	PHI+=dY;
	old_x=e.pageX;
	old_y=e.pageY;
	e.preventDefault();
};

function mouseWheel(e){
	if (e.deltaY < 0) D += 0.2;
	else if (e.deltaY > 0) D -= 0.2;
}

/*=================== Drawing =================== */
var animate=function(time) {

	var proj_matrix = m4.perspective(alpha, canvas.width/canvas.height, 0.5, 50);

	var sTHETA=Math.sin(THETA), cTHETA=Math.cos(THETA);
	var sPHI=Math.sin(PHI), cPHI=Math.cos(PHI);
	var cameraPosition = [D*sPHI*cTHETA, D*sPHI*sTHETA, D*cPHI];
	var up = [0, 0, 1];
	var target = [0, 0, 0];
	var view_matrix = m4.inverse(m4.lookAt(cameraPosition, target, up));
	let shared1Uniforms = {
		Vmatrix: view_matrix,
		Pmatrix: proj_matrix,
	};

	webglUtils.setUniforms(programInfo, shared1Uniforms);

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.75, 0.75, 0.75, 1); 
	gl.clearDepth(1.0);
	gl.viewport(0.0, 0.0, canvas.width, canvas.height); 
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var mo_matrix=m4.identity();
	let shared2Uniforms = {
		Mmatrix: mo_matrix,
	};         
	webglUtils.setUniforms(programInfo, shared2Uniforms); 

	webglUtils.setBuffersAndAttributes(gl, programInfo, bufferCuboInfo);
	webglUtils.drawBufferInfo(gl, bufferCuboInfo);

	window.requestAnimationFrame(animate); 
}

var drag=false;
var old_x, old_y;
var dX=0, dY=0;

canvas.onmousedown=mouseDown;
canvas.onmouseup=mouseUp;
canvas.onmouseout=mouseUp;
canvas.onmousemove=mouseMove;
canvas.onwheel=mouseWheel;

animate(0);
