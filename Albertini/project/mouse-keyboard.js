let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

/*================= EVENT MOUSE =================*/
canvas.addEventListener('mousedown', (e) => {
	mouseDown = true;
	lastMouseX = e.clientX;
	lastMouseY = e.clientY;
	e.preventDefault();
});

canvas.addEventListener('mouseup', () => { mouseDown = false; });

canvas.addEventListener('mousemove', (e) => {
	e.preventDefault();
	if (!mouseDown) return;
	const deltaX = e.clientX - lastMouseX;
	const deltaY = e.clientY - lastMouseY;
	lastMouseX = e.clientX;
	lastMouseY = e.clientY;

	controls.theta += deltaX * 0.01;
	controls.phi -= deltaY * 0.01;
	controls.phi = Math.max(0.1, Math.min(3.0, controls.phi));


});

canvas.addEventListener('wheel', (e) => {
	e.preventDefault();
	controls.D += e.deltaY * 0.01;
	controls.D = Math.max(15, Math.min(45, controls.D));
});

/*================= EVENT KEYBOARD =================*/
window.addEventListener('keydown', (e) => {
	if (e.key.toLowerCase() === 'w') {
		controls.phiLight += dr;
	} 
	if (e.key.toLowerCase() === 's') {
		controls.phiLight -= dr;
	}
	if (e.key.toLowerCase() === 'a') {
		controls.thetaLight -= dr;
	} 
	if (e.key.toLowerCase() === 'd') {
		controls.thetaLight += dr;
	}
	controls.phiLight = Math.max(0.1, Math.min(3.0, controls.phiLight));
});

