/*================= EVENT TOUCHSCREEN =================*/
let lastDist = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mouseDown = true;

    const touch = e.touches[0];
    lastMouseX = touch.clientX;
    lastMouseY = touch.clientY;

    if (e.touches.length === 2) {
        lastDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
    }
}, { passive: false });

canvas.addEventListener('touchend', () => { 
    mouseDown = false; 
    lastDist = 0; 
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!mouseDown) return;

    if (e.touches.length === 2) {
        const curDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );

        if (lastDist > 0) {
            const delta = curDist - lastDist;
            controls.D += delta * 0.05; 
        }
        lastDist = curDist;
    } 
    else if (e.touches.length === 1) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastMouseX;
        const deltaY = touch.clientY - lastMouseY;

        lastMouseX = touch.clientX;
        lastMouseY = touch.clientY;
        
        controls.theta += deltaX * 0.01;
        controls.phi -= deltaY * 0.01;
        controls.phi = Math.max(0.1, Math.min(3.0, controls.phi));
    }
}, { passive: false });

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

	controls.thetaLight -= dr * deltaX * 0.1;
    controls.phiLight += dr * deltaY  * 0.1;
	controls.phiLight = Math.max(0.1, Math.min(3.0, controls.phiLight));

}, { passive: false });

zone.addEventListener('touchend', (e) => {
    lightDown = false;

    handle.style.left = '50%';
    handle.style.top = '50%';
}, { passive: false });

