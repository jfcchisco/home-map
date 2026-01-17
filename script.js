gsap.registerPlugin(Draggable, InertiaPlugin);

let $view  = document.querySelector("#view");
let $image = document.querySelector("#image");
let $reset = document.querySelector("#reset");

let firstRun = true;

let viewWidth  = window.innerWidth;
let viewHeight = window.innerHeight;

let imageWidth  = $image.width;
let imageHeight = $image.height;

let zoom = {  
    accel: 0.1, 
    chaseScale: 1,
    chaseX: 0,
    chaseY: 0,  
    min: 0.0001,
    max: 10,
    scale: 1,
    scaleFactor: 1.1
};

let pointer = {
    x: viewWidth  / 2,
    y: viewHeight / 2
};

let initialDistance = 0;
let initialScale = 1;

let setX = gsap.quickSetter($image, "x", "px");
let setY = gsap.quickSetter($image, "y", "px");
let setScaleX = gsap.quickSetter($image, "scaleX");
let setScaleY = gsap.quickSetter($image, "scaleY");

gsap.set($image, { force3D: true, transformOrigin: "left top" });

let tracker = InertiaPlugin.track($image, "x,y")[0];
let props = gsap.getProperty($image);

let throwTween = gsap.to({}, {});
let resetTween = gsap.to({}, {});

let draggable = new Draggable($image, {
    trigger: $view,
    onDrag: onDrag,
    onPress: onPress,
    onRelease: onRelease
});

init();

function init() {
    
    resetView();  
    
    $reset.addEventListener("click", resetView);
    $view.addEventListener("mousewheel", mouseWheel);
    $view.addEventListener("DOMMouseScroll", mouseWheel);  
    window.addEventListener("resize", resize);
    $view.addEventListener("touchstart", touchStart);
    $view.addEventListener("touchmove", touchMove);
    $view.addEventListener("touchend", touchEnd);
    gsap.ticker.add(updateZoom);
    gsap.set($view, { autoAlpha: 1 });
    
    firstRun = false;
}

function mouseWheel(event) {
    
    event.preventDefault();
    
    throwTween.kill();
    
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    
    let wheel = event.detail || event.deltaY || 0;
    
    if (wheel > 0) {
        zoom.chaseScale /= zoom.scaleFactor;
    } else {
        zoom.chaseScale *= zoom.scaleFactor;
    }
    
    zoom.chaseScale = gsap.utils.clamp(zoom.min, zoom.max, zoom.chaseScale);
}

function updateZoom() {
  
    if (resetTween.isActive()) {
        return;
    }
  
    let oldZoom = zoom.scale;
    
    zoom.scale += (zoom.chaseScale - zoom.scale) * zoom.accel;
    
    let zoomDelta = zoom.scale - oldZoom;
        
    let scale = props("scaleX");  
    let x = props("x");
    let y = props("y");
    
    let localX = (pointer.x - x) / scale;
    let localY = (pointer.y - y) / scale;
    
    x += -(localX * zoomDelta);
    y += -(localY * zoomDelta);
        
    x = gsap.utils.clamp(-(imageWidth  * zoom.scale), viewWidth, x);
    y = gsap.utils.clamp(-(imageHeight * zoom.scale), viewHeight, y);
    
    setScaleX(zoom.scale);
    setScaleY(zoom.scale);
    setX(x);
    setY(y);
    
    // gsap.set($image, {
    //   scale: zoom.scale,
    //   x: x,
    //   y: y
    // });
}

function onDrag() {
    
    zoom.chaseX = this.x;
    zoom.chaseY = this.y;
}

function onPress() {
    
    throwTween.kill();
    
    zoom.chaseX = this.x;
    zoom.chaseY = this.y;
    
    this.update();
}

function onRelease() {
    
    throwTween = gsap.to(zoom, {      
        inertia: {
            resistance: 2000,
            chaseX: {
            velocity: tracker.get("x"),
            min: -(imageWidth  * zoom.scale) - 100,
            max: viewWidth + 100
            },
            chaseY: {
            velocity: tracker.get("y"),
            min: -(imageHeight  * zoom.scale) - 100,
            max: viewHeight + 100
            }
        },
        onUpdate: function() {
            
            setX(zoom.chaseX);
            setY(zoom.chaseY);
            // gsap.set($image, {
            //   x: zoom.chaseX,
            //   y: zoom.chaseY
            // });
        }
    });
}

function resetView() {
  
    throwTween.kill();
    
    let sx = viewWidth  / imageWidth;
    let sy = viewHeight / imageHeight;
    
    let scale = Math.min(sx, sy);
    
    let x = viewWidth  / 2 - imageWidth  / 2 * scale;
    let y = viewHeight / 2 - imageHeight / 2 * scale;
    
    zoom.chaseScale = scale;
    zoom.chaseX = x;
    zoom.chaseY = y;
    zoom.scale = scale;
    
    resetTween = gsap.to($image, {
        duration: firstRun ? 0 : 0.5,
        ease: "expo.out",
        scale: scale,
        x: x,
        y: y
    });  
}

function touchStart(event) {
    if (event.touches.length === 2) {
        throwTween.kill();
        let touch1 = event.touches[0];
        let touch2 = event.touches[1];
        initialDistance = getDistance(touch1, touch2);
        initialScale = zoom.scale;
    }
}

function touchMove(event) {
    if (event.touches.length === 2) {
        event.preventDefault();
        let touch1 = event.touches[0];
        let touch2 = event.touches[1];
        let newDistance = getDistance(touch1, touch2);
        zoom.chaseScale = initialScale * (newDistance / initialDistance);
        zoom.chaseScale = gsap.utils.clamp(zoom.min, zoom.max, zoom.chaseScale);
        pointer.x = (touch1.clientX + touch2.clientX) / 2;
        pointer.y = (touch1.clientY + touch2.clientY) / 2;
    }
}

function touchEnd(event) {
    // Optional: handle end of touch
}

function getDistance(touch1, touch2) {
    let dx = touch1.clientX - touch2.clientX;
    let dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function resize() {
    viewWidth  = window.innerWidth;
    viewHeight = window.innerHeight;
}

function openModal() {
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

