import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/Addons.js';
import { Easing, Tween, update as updateTween } from 'tween';
import { images, titles, artists } from './model.js';

//renderer settings
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

//Define Texture Loader
const textureLoader = new THREE.TextureLoader();

//scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const MIN_ZOOM = -2.5;
const MAX_ZOOM = -4.5;
const MIN_RIGHT = 0;
const MAX_RIGHT = 2;
camera.position.z = MIN_ZOOM;

//Define Root Node for Rotation
const rootNode = new THREE.Object3D();
scene.add(rootNode);
const circleRadius = 7.5;

//Load Arrow Textures
const leftArrowTexture = textureLoader.load('left.png');
const rightArrowTexture = textureLoader.load('right.png');

let count = 8;
const artworkHeight = 3;
const artworkDepth = 0.001;
for (let i = 0; i < count; i++){
    //Define Texture
    const texture = textureLoader.load(images[i]);
    texture.colorSpace = THREE.SRGBColorSpace;

    //Add Base Node 
    const baseNode = new THREE.Object3D();
    baseNode.rotation.y = i * (2 * Math.PI / count);
    rootNode.add(baseNode);

    //Calculate Artworks aspect ratio
    const img = new Image();
    img.src = images[i];
    const aspectRatio = img.width / img.height;
    const artworkWidth = artworkHeight*aspectRatio;

    //Add Border as children of Base Node
    const border = new THREE.Mesh(
        new THREE.BoxGeometry(artworkWidth+0.2, artworkHeight+0.2, artworkDepth),
        new THREE.MeshStandardMaterial({
            color: 0x202020,
            transparent: true
        })
    );
    border.name = `Border_${i}`;
    border.position.z = -circleRadius-0.001;
    baseNode.add(border);

    //Add artworks as children of Base Node
    const artwork = new THREE.Mesh(
        new THREE.BoxGeometry(artworkWidth, artworkHeight, artworkDepth),
        new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true
        })
    );
    artwork.name = `Art_${i}`;
    artwork.position.z = -circleRadius;
    baseNode.add(artwork);

    //Add left arrow
    const leftArrow = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, artworkDepth),
        new THREE.MeshStandardMaterial({
            map: leftArrowTexture,
            transparent: true
        })
    );
    leftArrow.name = `LeftArrow`;
    leftArrow.userData = (i === count -1) ? 0 : i + 1;
    leftArrow.position.set((-artworkWidth / 2)-0.5, 0, -circleRadius);
    baseNode.add(leftArrow);

    //Add right arrow
    const rightArrow = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, artworkDepth),
        new THREE.MeshStandardMaterial({
            map: rightArrowTexture,
            transparent: true
        })
    );
    rightArrow.name = `RightArrow`;
    rightArrow.userData = (i === 0) ? count - 1 : i - 1;
    rightArrow.position.set((artworkWidth / 2)+0.5, 0, -circleRadius);
    baseNode.add(rightArrow);
}

//Light
const spotlight = new THREE.SpotLight(0xffffff, 200.0, 10.0, 0.8, 0.5);
spotlight.position.set(0, 5, MIN_ZOOM);
spotlight.target.position.set(0, 0.5, -circleRadius-1);
scene.add(spotlight);
scene.add(spotlight.target);

//Mirror on Floor
const mirror = new Reflector(
    new THREE.CircleGeometry(10),
    {
        color: 0x606060, //changes strength of reflection
        textureWidth: window.innerWidth,
        textureHeight: window.innerHeight
    }
);
mirror.position.y = -1.6;
mirror.rotateX(-Math.PI / 2); // rorate so that face is pointing upwords so camera sees it
scene.add(mirror);

//Rotating the gallery and update Texts
let currentlyRotating = false;

function rotateGallery(direction, newIndex){
    const deltaY = direction * (2 * Math.PI / count);
    new Tween(rootNode.rotation)
        .to({ y: rootNode.rotation.y + deltaY})
        .easing(Easing.Quadratic.InOut)
        .start()
        .onStart(() => {
            currentlyRotating = true;
            document.getElementById('title').style.opacity = 0;
            document.getElementById('artist').style.opacity = 0;
        })
        .onComplete(() => {
            currentlyRotating = false;
            document.getElementById('title').innerText = titles[newIndex];
            document.getElementById('artist').innerText = artists[newIndex];
            document.getElementById('title').style.opacity = 1;
            document.getElementById('artist').style.opacity = 1;
        })
}

//Animation
function animate() {
    updateTween();
	renderer.render( scene, camera );
}

//calculate the angle between the given object and the basenode
function calculateAngleToZAxis(baseNode){
    const forward = new THREE.Vector3(0, 0, -1);
    const baseNodeDirection = new THREE.Vector3(0, 0, -1);
    baseNodeDirection.applyQuaternion(baseNode.getWorldQuaternion(new THREE.Quaternion()));
    const angle = forward.angleTo(baseNodeDirection);
    const degrees = THREE.MathUtils.radToDeg(angle);
    return degrees;
}

//Resize when Viewport Size changes
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mirror.getRenderTarget().setSize(window.innerWidth, window.innerHeight);
});

//React to clicks on Arrows
window.addEventListener('click', (event) => {
    const raycaster = new THREE.Raycaster();

    const mouseNDC = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
    );

    raycaster.setFromCamera(mouseNDC, camera);

    const intersections = raycaster.intersectObject(rootNode, true);
    if (intersections.length > 0) {
        const obj = intersections[0].object;
        
        // We clicked on Arrow
        if ((obj.name === 'LeftArrow' || obj.name === 'RightArrow') && obj.material.opacity > 0.9) {
            // Get the parent node of the arrow
            const baseNode = obj.parent;
            
            // Calculate the angle between the baseNode z direction and z-axis
            let degrees = calculateAngleToZAxis(baseNode);
            
            // Only allow interaction if the artwork is facing camera with angle < 20
            if (Math.abs(degrees) < 20) {
                const newIndex = obj.userData;
                
                if (obj.name === 'LeftArrow') {
                    rotateGallery(-1, newIndex);
                }
                if (obj.name === 'RightArrow') {
                    rotateGallery(1, newIndex);
                }
            }
        }
    }
});

//React to Scrolling with wheel
window.addEventListener('wheel', (event) => {
    event.preventDefault();

    //Only allow zoom if we are not currenlty rotating
    if (!currentlyRotating){
        // Get current camera position
        const currentZ = camera.position.z;
        const currentX = camera.position.x;
        
        // Calculate target position based on scroll direction
        let targetZ = currentZ;
        let targetX = currentX;

        // Add a small threshold for comparing floating point values
        const THRESHOLD = 0.1;
        const isAtMaxZoom = Math.abs(currentZ - MAX_ZOOM) < THRESHOLD;
        const isAtMinRight = Math.abs(currentX - MIN_RIGHT) < THRESHOLD;
        
        if (event.deltaY > 0) { // Scrolling down/away - zoom out
            if (isAtMaxZoom && !isAtMinRight) {
                targetX = Math.max(MIN_RIGHT, currentX - 0.5);
            } else {
                targetZ = Math.min(MIN_ZOOM, currentZ + 0.5);
                targetX = MIN_RIGHT;  // Always reset X when zooming out
            }
        } else { // Scrolling up/towards - zoom in
            if (!isAtMaxZoom) {
                // First zoom in fully
                targetZ = Math.max(MAX_ZOOM, currentZ - 0.5);
                targetX = MIN_RIGHT // Ensure X is reset while zooming in
            } else {
                // Once at max zoom, move right
                targetX = Math.min(MAX_RIGHT, currentX + 0.5);
            }
        }

       // Cancel existing tweens
       if (camera.position._tween) camera.position._tween.stop();

       // Create single tween for both coordinates
       const tween = new Tween(camera.position)
           .to({ x: targetX, z: targetZ }, 500)
           .easing(Easing.Quadratic.Out)
           .start();
       camera.position._tween = tween;

        //Fade Title and Artist
        if (targetZ <= -3.5){
            document.getElementById('title').style.opacity = 0;
            document.getElementById('artist').style.opacity = 0;
        } else{
            document.getElementById('title').style.opacity = 1;
            document.getElementById('artist').style.opacity = 1;
        }

        //Fade Arrows and other Artworks
        if (targetZ < MIN_ZOOM){
            // Find and fade out non-centered artworks
            rootNode.children.forEach((baseNode, index) => {
                // Calculate the angle between the baseNode's forward direction and negative z-axis
                let degrees = calculateAngleToZAxis(baseNode);
                
                // Fade based on whether the artwork is centered
                baseNode.children.forEach(child => {
                    if (child.material) {
                        if (child.name === 'LeftArrow' || child.name === 'RightArrow') {
                            new Tween(child.material)
                                .to({ opacity: 0 }, 500)
                                .easing(Easing.Quadratic.Out)
                                .start();
                        } else{
                            const opacity = Math.abs(degrees) < 20 ? 1 : 0;
                        
                            // Create a tween for smooth opacity transition
                            new Tween(child.material)
                                .to({ opacity }, 500)
                                .easing(Easing.Quadratic.Out)
                                .start();
                            
                            // Ensure transparency is enabled
                            child.material.transparent = true;
                        }
                    }
                });
            });
        } else{
            // Restore opacity of all elements
            rootNode.children.forEach(baseNode => {
                baseNode.children.forEach(child => {
                    if (child.material) {
                        new Tween(child.material)
                            .to({ opacity: 1 }, 500)
                            .easing(Easing.Quadratic.Out)
                            .start();
                    }
                });
            });
        }
    }
});

//Initialize first title and artist
document.getElementById('title').innerText = titles[0];
document.getElementById('artist').innerText = artists[0];