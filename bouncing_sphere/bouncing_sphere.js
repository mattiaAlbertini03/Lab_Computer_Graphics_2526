var canvas = document.getElementById('my_Canvas');
var gl = canvas.getContext('experimental-webgl');
var lato = 5.0; 
var vertici_cubo = [
	-lato,-lato,-lato,   lato,-lato,-lato,   lato, lato,-lato,   -lato, lato,-lato, 
	-lato,-lato, lato,   lato,-lato, lato,   lato, lato, lato,   -lato, lato, lato,
];
var indici_cubo = [
	0,1,  1,2,  2,3,  3,0, 
	4,5,  5,6,  6,7,  7,4,
	1,5,  2,6,  3,7,  0,4
];
let data = {
	position: vertici_cubo,
	indices: indici_cubo,
};
const bufferCuboInfo = webglUtils.createBufferInfoFromArrays(gl, data); 

var programInfo = webglUtils.createProgramInfo(gl, ["vertex-shader", "fragment-shader"]);

const posLoc = gl.getAttribLocation(programInfo.program, 'a_position');
gl.useProgram(programInfo.program);   

var THETA = degToRad(20);
var PHI = degToRad(60);
var D = 30; 
var r = Math.sqrt(3);
var s = r*D/Math.sqrt(Math.pow(D,2)-Math.pow(r,2));
var alpha = 10*Math.atan(s/D);
var salpha=0.025;
var dr = degToRad(2.4);

var x = 0, y = 0, z = 0; 
var dx = 0.10, dy = 0.05, dz = 0.15; 
var br = 1.0; 

var ball_index_count = 0;

function degToRad(d) { return d * Math.PI / 180; }

var animate=function(time) {
	proj_matrix = m4.perspective(alpha, canvas.clientWidth / canvas.clientHeight, 1, 100);
	var sTHETA=Math.sin(THETA), cTHETA=Math.cos(THETA);
	var sPHI=Math.sin(PHI), cPHI=Math.cos(PHI);
	var cameraPosition = [D*sPHI*cTHETA, D*sPHI*sTHETA, D*cPHI];
	var up = [0, 0, 1];
	var target = [0, 0, 0];
	view_matrix = m4.inverse(m4.lookAt(cameraPosition, target, up));
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
	webglUtils.drawBufferInfo(gl, bufferCuboInfo, gl.LINES);

	if (ball_index_count > 0) {
		if(x + br >= lato || x - br <= -lato) dx = -dx;
		if(y + br >= lato || y - br <= -lato) dy = -dy;
		if(z + br >= lato || z - br <= -lato) dz = -dz;
		x += dx; 
		y += dy; 
		z += dz;
		var ball_M = new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			x, y, z, 1
		]);
		let shared3Uniforms = {
			Mmatrix: ball_M,
		};         
		webglUtils.setUniforms(programInfo, shared3Uniforms); 
		webglUtils.setBuffersAndAttributes(gl, programInfo, bufferObjInfo);
		webglUtils.drawBufferInfo(gl, bufferObjInfo, gl.LINES);
	}

	window.requestAnimationFrame(animate); 
}

var drag=false;
var old_x, old_y;
var dX=0, dY=0;

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
	if (e.deltaY < 0) D += 0.5;
	else if (e.deltaY > 0) D -= 0.5;
}

function getWireframeIndices(faces) {
	const edges = new Set();
	const ind = [];
	faces.forEach(face => {
		for (let i = 0; i < face.length; i++) {
			let v1 = face[i]-1;
			let v2 = face[(i + 1) % face.length]-1;
			const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
			if (!edges.has(edgeKey)) {
				edges.add(edgeKey);
				ind.push(v1, v2);
			}
		}
	});
	return ind;
}

function unitize(vert) {
	var maxx = minx = vert[0];
	var maxy = miny = vert[1];
	var maxz = minz = vert[2];
	for (var i = 3; i < vert.length; i=i+3) {
		if (maxx < vert[i]) maxx = vert[i];
		if (minx > vert[i]) minx = vert[i];
		if (maxy < vert[i+1]) maxy = vert[i+1];
		if (miny > vert[i+1]) miny = vert[i+1];
		if (maxz < vert[i+2]) maxz = vert[i+2];
		if (minz > vert[i+2]) minz = vert[i+2];
	}
	var w = maxx - minx;
	var h = maxy - miny;
	var d = maxz - minz;
	var cx = (maxx + minx) / 2.0;
	var cy = (maxy + miny) / 2.0;
	var cz = (maxz + minz) / 2.0;
	var scale = 2.0 / Math.max(Math.max(w, h), d);
	for (i = 0; i < vert.length; i=i+3) {
		vert[i] = (vert[i] - cx) * scale;
		vert[i+1] = (vert[i+1] - cy) * scale;
		vert[i+2] = (vert[i+2] - cz) * scale;
	}
}

var bufferObjInfo;

function render(gl, mesh) {
	var vertices = mesh.vertices.flat();
	unitize(vertices);
	var ind = getWireframeIndices(mesh.faces);
	ball_index_count = ind.length;
	let data2 = {
		position: vertices,
		indices: ind,
	};

	bufferObjInfo = new webglUtils.createBufferInfoFromArrays(gl, data2); 
}


function parseOBJ(text) {
	const vertices = [];
	const faces = [];
	text.split('\n').forEach(l => {
		l = l.trim();
		if (!l || l.startsWith('#')) return;
		const p = l.split(/\s+/);

		if (p[0] === 'v') {
			vertices.push(p.slice(1).map(Number));
		} else if (p[0] === 'f') {
			faces.push(p.slice(1).map(Number));
		}
	});
	return { vertices, faces };
}

document.addEventListener('DOMContentLoaded', async () => {
	const response = await fetch('./sphere_quad.obj'); 
	const objText = await response.text();
	const mesh = parseOBJ(objText);
	render(gl, mesh);
});

document.getElementById("Button1").onclick = function(){alpha += salpha; };
document.getElementById("Button2").onclick = function(){alpha -= salpha; };
document.getElementById("Button3").onclick = function(){D *= 1.1; };
document.getElementById("Button4").onclick = function(){D *= 0.9; };
document.getElementById("Button5").onclick = function(){THETA += dr; };
document.getElementById("Button6").onclick = function(){THETA -= dr; };
document.getElementById("Button7").onclick = function(){PHI += dr; };
document.getElementById("Button8").onclick = function(){PHI -= dr; };

canvas.onmousedown=mouseDown;
canvas.onmouseup=mouseUp;
canvas.onmouseout=mouseUp;
canvas.onmousemove=mouseMove;
canvas.onwheel=mouseWheel;

animate(0);
