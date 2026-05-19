/*================= EVENT TOUCHSCREEN =================*/
canvas.addEventListener('touchstart', (e) => {
	e.preventDefault();
	mouseDown = true; 

	const touch = e.touches[0];
	lastMouseX = touch.clientX;
	lastMouseY = touch.clientY;
}, { passive: false });

canvas.addEventListener('touchend', () => { mouseDown = false; });

canvas.addEventListener('touchmove', (e) => {
	e.preventDefault();
	if (!mouseDown) return;

	const touch = e.touches[0];
	const deltaX = touch.clientX - lastMouseX;
	const deltaY = touch.clientY - lastMouseY;

	lastMouseX = touch.clientX;
	lastMouseY = touch.clientY;

	controls.theta += deltaX * 0.01;
	controls.phi -= deltaY * 0.01;

	controls.phi = Math.max(0.1, Math.min(3.0, controls.phi));
}, { passive: false });

const zoomSlider = document.getElementById('zoom-slider');

zoomSlider.addEventListener('input', (e) => {
	controls.D = -parseFloat(e.target.value);
});

/*================= EVENT TOUCHSCREEN-JOYSTICK =================*/
const zone = document.getElementById('joystick-zone');
const handle = document.getElementById('joystick-handle');

let lightDown = false;
let startX, startY; 
let lastJoystickX = 0; 
let lastJoystickY = 0;

zone.addEventListener('touchstart', (e) => {
    lightDown = true;
    
    const rect = zone.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
    
    const touch = e.touches[0];
    lastJoystickX = touch.clientX;
    lastJoystickY = touch.clientY;
    
    e.stopPropagation();
}, { passive: false });

zone.addEventListener('touchmove', (e) => {
    if (!lightDown) return;
    e.preventDefault();

	const maxRadius = 60;  

    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    let visualDeltaX = clientX - startX;
    let visualDeltaY = clientY - startY;
    let distance = Math.sqrt(visualDeltaX * visualDeltaX + visualDeltaY * visualDeltaY);

    if (distance > maxRadius) {
        visualDeltaX = (visualDeltaX / distance) * maxRadius;
        visualDeltaY = (visualDeltaY / distance) * maxRadius;
    }

    handle.style.left = `calc(50% + ${visualDeltaX}px)`;
    handle.style.top = `calc(50% + ${visualDeltaY}px)`;

    const deltaX = clientX - lastJoystickX;
    const deltaY = clientY - lastJoystickY;

    lastJoystickX = clientX;
    lastJoystickY = clientY;

    controls.thetaLight -= deltaX * 0.01;
    controls.phiLight += deltaY * 0.01;
    controls.phiLight = Math.max(0.1, Math.min(3.0, controls.phiLight));

}, { passive: false });

zone.addEventListener('touchend', (e) => {
    lightDown = false;

    handle.style.left = '50%';
    handle.style.top = '50%';
}, { passive: false });

