/*============= Creating a canvas ======================*/ 
var canvas = document.getElementById('mycanvas');
gl = canvas.getContext('experimental-webgl');
/*========== Defining and storing the geometry ==========*/
var vertices=[
-1,-1,-1,  1,-1,-1,  1,1,-1,  -1,1,-1,  -1,-1,1,  1,-1,1,  1,1,1, -1,1,1,  
-1,-1,-1,  -1,1,-1,  -1,1,1,  -1,-1,1,  1,-1,-1,  1,1,-1,  1,1,1,  1,-1,1, 
-1,-1,-1,  -1,-1,1,  1,-1,1,  1,-1,-1,  -1,1,-1,  -1,1,1,  1,1,1,  1,1,-1,];
var colors=[
   1,0,0,1,  1,0,0,1,  1,0,0,1,  1,0,0,1,
   0,1,1,1,  0,1,1,1,  0,1,1,1,  0,1,1,1,
   0,0,1,1,  0,0,1,1,  0,0,1,1,  0,0,1,1,
   0,1,0,1,  0,1,0,1,  0,1,0,1,  0,1,0,1,
   1,1,0,1,  1,1,0,1,  1,1,0,1,  1,1,0,1,
   1,0,1,1,  1,0,1,1,  1,0,1,1,  1,0,1,1];
var indices = [
0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11, 12,13,14, 12,14,15, 16,17,18, 16,18,19, 20,21,22, 20,22,23 ];
let data = {
          position: vertices,
          color: colors,
          indices: indices,
         };
const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data); 

var vertices2=[
-1,-1,-1, 1,-1,-1, 1,1,-1, -1,1,-1, -1,-1,1, 1,-1,1, 1,1,1, -1,1,1,];
var colors2=[
   0,0,0,1,  0,0,0,1,  0,0,0,1,  0,0,0,1,
   0,0,0,1,  0,0,0,1,  0,0,0,1,  0,0,0,1,];
var indices2 = [
 0,1, 1,2, 2,3, 3,0, 4,5, 5,6, 6,7, 7,4, 1,5, 2,6, 3,7, 0,4]; 
let data2 = {
          position: vertices2,
          color: colors2,
          indices: indices2,
         };
const bufferInfo2 = webglUtils.createBufferInfoFromArrays(gl, data2); 

var programInfo = webglUtils.createProgramInfo(gl, ["vertex-shader", "fragment-shader"]);

/*======== Associating attributes to vertex shader =====*/

gl.useProgram(programInfo.program);   

function degToRad(d) {
   return d * Math.PI / 180;
}

var THETA=degToRad(225), PHI=degToRad(115);

/*================= Mouse events ======================*/
var AMORTIZATION=0.95;
var drag=false;
var old_x, old_y;
var dX=0, dY=0;

var mouseDown=function(e) {
    drag=true;
    old_x=e.pageX, old_y=e.pageY;
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
  old_x=e.pageX, old_y=e.pageY; 
  e.preventDefault();
};

canvas.onmousedown=mouseDown;
canvas.onmouseup=mouseUp;
canvas.onmouseout=mouseUp;
canvas.onmousemove=mouseMove;

/*=================== Drawing =================== */
var draw_cube=function(dx,dy,dz){
var val=0.01;
if (dx>0) dx+=val;
if (dx<0) dx-=val;

if (dy>0) dy+=val;
if (dy<0) dy-=val;

if (dz>0) dz+=val;
if (dz<0) dz-=val;

var mo_matrix=m4.identity();
mo_matrix=m4.translate(mo_matrix, dx, dy, dz);
 let shared2Uniforms = {
          Mmatrix: mo_matrix,
         };         
 webglUtils.setUniforms(programInfo, shared2Uniforms); 

 webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
 webglUtils.drawBufferInfo(gl, bufferInfo);

 webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo2);
 webglUtils.drawBufferInfo(gl, bufferInfo2, gl.LINES);

}

var animate=function() {

var proj_matrix = m4.perspective(degToRad(40), canvas.clientWidth / canvas.clientHeight, 1, 100);

var camera = [13*Math.sin(PHI)*Math.cos(THETA),
              13*Math.sin(PHI)*Math.sin(THETA),
              13*Math.cos(PHI)];
var view_matrix = m4.inverse(m4.lookAt(camera, [0, 0, 1.1], [0, 0, 1]));

let shared1Uniforms = {
          Vmatrix: view_matrix,
          Pmatrix: proj_matrix,
};

webglUtils.setUniforms(programInfo, shared1Uniforms);
gl.enable(gl.DEPTH_TEST);
gl.clearColor(1., 1., 1., 1); 
gl.clearDepth(1.0);
gl.viewport(0.0, 0.0, canvas.width, canvas.height); 
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

draw_cube(0,0,0);
draw_cube(2,0,0);
draw_cube(0,2,0);
draw_cube(-2,0,0);
draw_cube(0,-2,0);
draw_cube(-2,2,0);
draw_cube(2,-2,0);
draw_cube(-2,0,2);
draw_cube(0,-2,2);
draw_cube(0,0,2);
draw_cube(0,0,-2);
draw_cube(2,0,-2);
draw_cube(0,2,-2);

window.requestAnimationFrame(animate); 

}

animate(0);
