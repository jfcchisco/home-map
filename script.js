gsap.registerPlugin(Draggable, InertiaPlugin);

let image = document.querySelector("#image");
let container = document.querySelector("#view");

let containerWidth  = 900;
let containerHeight = 1600;

let imageWidth  = 900;
let imageHeight = 1600;

let zoom = {
    value: 1,
    min: 1,
    max: 5,
    step: 1,  
    factor: 1.1
};

let initialDistance = 0;
let initialZoom = 1;
let isPinching = false;
let zoomOrigin = {x: 0, y: 0};

container.addEventListener("wheel", wheelAction);
container.addEventListener("touchstart", touchStart, {passive: false});
container.addEventListener("touchmove", touchMove, {passive: false});
container.addEventListener("touchend", touchEnd);

gsap.set(image, { scale: zoom.value, transformOrigin: "left top" });

// var transform = image._gsTransform;
let props = gsap.getProperty(image);

let draggable = new Draggable(image, {
    cursor: "inherit",
    onClick: onClick,
    inertia: true,
    minimumMovement: 10,
    // allowEventDefault: true,
    overshootTolerance: 0
});

function touchStart(event) {
    if (event.touches.length === 2) {
        isPinching = true;
        let touch1 = event.touches[0];
        let touch2 = event.touches[1];
        initialDistance = getDistance(touch1, touch2);
        initialZoom = zoom.value;
        zoomOrigin.x = (touch1.clientX + touch2.clientX) / 2;
        zoomOrigin.y = (touch1.clientY + touch2.clientY) / 2;
    }
}

function touchMove(event) {
    if (event.touches.length === 2) {
        event.preventDefault();
        let touch1 = event.touches[0];
        let touch2 = event.touches[1];
        let newDistance = getDistance(touch1, touch2);
        let newZoom = initialZoom * (newDistance / initialDistance);
        newZoom = gsap.utils.clamp(zoom.min, zoom.max, newZoom);
        
        let zoomDelta = newZoom - zoom.value;
        zoom.value = newZoom;
        
        let scale = props("scaleX");
        let x = props("x");
        let y = props("y");
        
        let rect = container.getBoundingClientRect();
        let globalX = zoomOrigin.x - rect.left;
        let globalY = zoomOrigin.y - rect.top;
        
        let localX = (globalX - x) / scale;
        let localY = (globalY - y) / scale;
        
        x += -(localX * zoomDelta);
        y += -(localY * zoomDelta);
        
        gsap.set(image, {
            scale: zoom.value,
            x: x,
            y: y
        });
        
        setBounds();
    }
}

function touchEnd(event) {
    isPinching = false;
}

function getDistance(touch1, touch2) {
    let dx = touch1.clientX - touch2.clientX;
    let dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

let reset = document.querySelector("#reset");

reset.addEventListener("click", resetZoom);

function resetZoom() {
    zoom.value = 1;
    gsap.set(image, {
        scale: 1,
        x: 0,
        y: 0
    });
    setBounds();
}

function onClick(event) {
  
    let oldZoom = zoom.value;
    
    zoom.value = Math.floor((zoom.value + zoom.step) / zoom.step) * zoom.step;
    
    if (zoom.value > zoom.max) {
        zoom.value = zoom.min;
    }
    
    changeZoom(zoom.value - oldZoom, event);
}

function wheelAction(event) {
  
    event.preventDefault();
    
    let oldZoom = zoom.value;
    
    let wheel = event.deltaY / 100;
    
    if (wheel > 0) {
        zoom.value /= zoom.factor;
    } else {
        zoom.value *= zoom.factor;
    }
    
    zoom.value = gsap.utils.clamp(zoom.min, zoom.max, zoom.value);
    
    changeZoom(zoom.value - oldZoom, event);
}

function changeZoom(zoomDelta, event) {
    
    let scale = props("scaleX");
    let x = props("x");
    let y = props("y");
    
    let rect = container.getBoundingClientRect();  
    let globalX = event.clientX - rect.left;
    let globalY = event.clientY - rect.top;
    
    let localX = (globalX - x) / scale;
    let localY = (globalY - y) / scale;
        
    x += -(localX * zoomDelta);
    y += -(localY * zoomDelta);
    
    gsap.set(image, {
        scale: zoom.value,
        x: x,
        y: y,
    });
    
    setBounds();
}

function setBounds() {
  
    let dx = containerWidth  - (imageWidth  * zoom.value);
    let dy = containerHeight - (imageHeight * zoom.value);
    
    let width  = containerWidth  - dx * 2;
    let height = containerHeight - dy * 2;
    
    draggable.applyBounds({    
        left: dx,
        top: dy,
        width: width,
        height: height
    });
}