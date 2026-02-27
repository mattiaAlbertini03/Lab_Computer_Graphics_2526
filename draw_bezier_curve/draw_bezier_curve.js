var canvas, ctx, wind, scx, scy;
var np=0, point=-1; 
var xt=[], yt=[], //punti dell'utente
    fxt=[], fyt=[], //punti dell'utente in floating point
    vxt=[], vyt=[]; //punti della curva
const R=6, m=100, h=1/m;

function init() {
	canvas = document.getElementById('mycanvas');
	ctx = canvas.getContext("2d");
	wind = canvas.getBoundingClientRect();
	scx = wind.left * (canvas.width  / wind.width);
	scy = wind.top  * (canvas.height / wind.height);
}

function restart(){
	np=0, point=-1; 
	xt=[], yt=[], fxt=[], fyt=[], vxt=[], vyt=[];
	clear();
}

function draw_line(x0, y0, x1, y1){
	ctx.strokeStyle = "blue";
	ctx.beginPath();
	ctx.moveTo(x0,y0);
	ctx.lineTo(x1,y1);
	ctx.stroke();
}

function draw_circ(x, y){
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.fillStyle = "black";
	ctx.arc(x, y, R, 0, Math.PI*2, true); 
	ctx.fill();
}

function draw_curve(){
	ctx.strokeStyle ="red";
	ctx.beginPath();
	ctx.moveTo(vxt[0],vyt[0]);
	for(i=1; i<=m; i++){
		ctx.lineTo(vxt[i],vyt[i]);
	}
	ctx.stroke();
}

function clear() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function windowToCanvas(px, py) {
	x = Math.round(px - scx);
	y = Math.round(py - scy);
	return { x: x, y: y};
}

function myUp(){
	point=-1;
}

function savePoint(loc, e, i){
	xt[i]=loc.x;
	yt[i]=loc.y;
	fxt[i] = e.pageX;
	fyt[i] = e.pageY;
}

function myMove(e){
	if (point != -1){
		loc = windowToCanvas(e.pageX, e.pageY);
		savePoint(loc, e, point);
		draw();
	}
}

function myDown(e){ 
	point=-1;
	loc = windowToCanvas(e.pageX, e.pageY);
	for (i=0; i<np; i++)
		if (loc.x < xt[i] + R && loc.x > xt[i] - R && loc.y < yt[i] + R && loc.y > yt[i] - R){
			point = i;
		}
	if (point==-1) {  
		savePoint(loc, e, np);
		if (np!=0)
			draw_line(xt[np-1],yt[np-1],xt[np],yt[np]);
		draw_circ(xt[np],yt[np]);
		np++;
		draw();
	}
}

function draw() {
	clear();
	for(i=0; i<np; i++){
		draw_circ(xt[i],yt[i]);
		draw_line(xt[i-1], yt[i-1], xt[i], yt[i])
	}
	compute_bezier();
	draw_curve();
}

function compute_bezier(){
	var fxp=[], fyp=[]; 
	var t,d1,d2; 
	vxt[0]=xt[0];
	vyt[0]=yt[0];
	for (k=1; k<m; k++){
		fxp=Array.from(fxt);
		fyp=Array.from(fyt);
		t=k*h;
		d1=t;
		d2=1.0-t;
		for (j=1; j<np; j++)
			for (i=0; i<np-j; i++){
				fxp[i]=d1*fxp[i+1]+d2*fxp[i];
				fyp[i]=d1*fyp[i+1]+d2*fyp[i]; 
			}
		loc = windowToCanvas(fxp[0], fyp[0]);
		vxt[k]=loc.x;
		vyt[k]=loc.y;
	}
	vxt[m]=xt[np-1];
	vyt[m]=yt[np-1];
}

init();
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;
canvas.onmousemove = myMove;

