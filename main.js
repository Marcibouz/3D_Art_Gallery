import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/Addons.js';
import { Easing, Tween, update as updateTween } from 'tween';
import { artworks, titles, artists, artistPictures, infoTexts, arrows } from './model.js';

// Get HTML-Elements
const infoTextElement =  document.getElementById('infoText');
const titleElement = document.getElementById('title');
const artistElement = document.getElementById('artist');

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

//Variables for loop
let count = 8;
const artworkHeight = 3;
const artworkDepth = 0.001;
const artistPictureHeight = 1;
const artistPictureDepth = 0.001;

function loadArtistPicture(i, baseNode, artworkWidth) {
    return new Promise((resolve, reject) => {
        const artistPictureTexture = textureLoader.load("images/" + artistPictures[i]);
        artistPictureTexture.colorSpace = THREE.SRGBColorSpace;

        const artistPictureImg = new Image();
        artistPictureImg.onload = () => {
            const aspectRatio = artistPictureImg.width / artistPictureImg.height;
            const artistPicturekWidth = artistPictureHeight * aspectRatio;

            //Add artist picture
            const artistPicture = new THREE.Mesh(
                new THREE.BoxGeometry(artistPicturekWidth, artistPictureHeight, artistPictureDepth),
                new THREE.MeshBasicMaterial({
                    map: artistPictureTexture,
                    transparent: true,
                    color: 0xaaaaaa,
                    opacity: 0
                })
            );
            artistPicture.name = `Picture`;
            artistPicture.position.z = -circleRadius;
            artistPicture.position.y = 1;
            artistPicture.position.x = (artworkWidth / 2) + 2;

            //Add artist pictures border
            const artistBorder = new THREE.Mesh(
                new THREE.BoxGeometry(artistPicturekWidth + 0.1, artistPictureHeight + 0.1, artistPictureDepth),
                new THREE.MeshBasicMaterial({
                    color: 0x202020,
                    transparent: true,
                    opacity: 0
                })
            );
            artistBorder.name = `PictureBorder`;
            artistBorder.position.z = -circleRadius - 0.001;
            artistBorder.position.y = 1;

            if(i === 0){
                artistPicture.position.x = (artworkWidth / 2) + 2;
                artistBorder.position.x = (artworkWidth / 2) + 2;
            }else if (i === 1){
                artistPicture.position.x = (artworkWidth / 2) + 1.6;
                artistBorder.position.x = (artworkWidth / 2) + 1.6;
            }else if (i === 2){
                artistPicture.position.x = (artworkWidth / 2) + 2.3;
                artistBorder.position.x = (artworkWidth / 2) + 2.3;
            }else if (i === 3){
                artistPicture.position.x = (artworkWidth / 2) + 1.8;
                artistBorder.position.x = (artworkWidth / 2) + 1.8;
            }else if (i === 4){
                artistPicture.position.x = (artworkWidth / 2) + 2.3;
                artistBorder.position.x = (artworkWidth / 2) + 2.3;
            }else if (i === 5){
                artistPicture.position.x = (artworkWidth / 2) + 2;
                artistBorder.position.x = (artworkWidth / 2) + 2;
            }else if (i === 6){
                artistPicture.position.x = (artworkWidth / 2) + 2.9;
                artistBorder.position.x = (artworkWidth / 2) + 2.9;
            }else{
                artistPicture.position.x = (artworkWidth / 2) + 2.2;
                artistBorder.position.x = (artworkWidth / 2) + 2.2;
            }
            baseNode.add(artistBorder);

            baseNode.add(artistPicture);
            resolve();
        };
        artistPictureImg.onerror = reject;
        artistPictureImg.src = "images/" + artistPictures[i];
    });
}

function initializeScene() {
    const scenePromises = [];

    for (let i = 0; i < count; i++) {
        const artWorkTexture = textureLoader.load("images/" + artworks[i]);
        artWorkTexture.colorSpace = THREE.SRGBColorSpace;
        const artWorkBorderTexture = textureLoader.load("images/artworkborder.png");
        artWorkBorderTexture.colorSpace = THREE.SRGBColorSpace;

        const artworkPromise = new Promise((resolve, reject) => {
            const artworkImg = new Image();
            artworkImg.onload = () => {
                const aspectRatio = artworkImg.width / artworkImg.height;
                const artworkWidth = artworkHeight * aspectRatio;

                const baseNode = new THREE.Object3D();
                baseNode.rotation.y = i * (2 * Math.PI / count);
                rootNode.add(baseNode);

                // Create artwork mesh
                const artwork = new THREE.Mesh(
                    new THREE.BoxGeometry(artworkWidth, artworkHeight, artworkDepth),
                    new THREE.MeshStandardMaterial({
                        map: artWorkTexture,
                        transparent: true
                    })
                );
                artwork.name = `Art_${i}`;
                artwork.position.z = -circleRadius;
                baseNode.add(artwork);

                // Create artwork border
                const artworkBorder = new THREE.Mesh(
                    new THREE.BoxGeometry(artworkWidth + 0.1, artworkHeight + 0.1, artworkDepth),
                    new THREE.MeshStandardMaterial({
                        map: artWorkBorderTexture,
                        transparent: true
                    })
                );
                artworkBorder.name = `ArtworkBorder_${i}`;
                artworkBorder.position.z = -circleRadius - 0.001;
                baseNode.add(artworkBorder);

                // Load artist picture
                const artistPicturePromise = loadArtistPicture(i, baseNode, artworkWidth);

                // Add arrows
                const leftArrowTexture = textureLoader.load('images/' + arrows[0]);
                const rightArrowTexture = textureLoader.load('images/' + arrows[1]);

                const leftArrow = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.3, artworkDepth),
                    new THREE.MeshStandardMaterial({
                        map: leftArrowTexture,
                        transparent: true
                    })
                );
                leftArrow.name = `LeftArrow`;
                leftArrow.userData = (i === count - 1) ? 0 : i + 1;
                leftArrow.position.set((-artworkWidth / 2) - 0.5, 0, -circleRadius);
                baseNode.add(leftArrow);

                const rightArrow = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.3, artworkDepth),
                    new THREE.MeshStandardMaterial({
                        map: rightArrowTexture,
                        transparent: true
                    })
                );
                rightArrow.name = `RightArrow`;
                rightArrow.userData = (i === 0) ? count - 1 : i - 1;
                rightArrow.position.set((artworkWidth / 2) + 0.5, 0, -circleRadius);
                baseNode.add(rightArrow);

                // Resolve with artist picture promise
                resolve(artistPicturePromise);
            };
            artworkImg.onerror = reject;
            artworkImg.src = "images/" + artworks[i];
        });

        scenePromises.push(artworkPromise);
    }

    Promise.all(scenePromises)
        .then(() => {
            console.log("All artworks, artist pictures, and arrows loaded successfully");
        })
        .catch(error => {
            console.error("Error loading scene elements:", error);
        });
}

initializeScene();

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
            titleElement.style.opacity = 0;
            artistElement.style.opacity = 0;
        })
        .onComplete(() => {
            currentlyRotating = false;
            titleElement.innerText = titles[newIndex];
            artistElement.innerText = artists[newIndex];
            document.getElementById('infoText').innerText = infoTexts[newIndex];
            titleElement.style.opacity = 1;
            artistElement.style.opacity = 1;
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

    //Only allow zoom if we are not currently rotating
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
        const isAtMaxRight = Math.abs(currentX - MAX_RIGHT) < THRESHOLD;
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
            titleElement.style.opacity = 0;
            artistElement.style.opacity = 0;
        } else{
            titleElement.style.opacity = 1;
            artistElement.style.opacity = 1;
        }

        //Fade Infotext
        if (targetX === MAX_RIGHT){
            infoTextElement.style.opacity = 1;
        } else{
            infoTextElement.style.opacity = 0;
        }

        //Fade Arrows, Artworks and Infotext
        if (targetZ < MIN_ZOOM){
            // Find and fade out non-centered elements
            rootNode.children.forEach((baseNode, index) => {
                // Calculate the angle between the baseNode's forward direction and negative z-axis
                let degrees = calculateAngleToZAxis(baseNode);
                let isVisibleByDegrees = Math.abs(degrees) < 10;
                
                // Fade based on whether the artwork is centered
                baseNode.children.forEach(child => {
                    if (child.material) {
                        if (child.name === 'LeftArrow' || child.name === 'RightArrow') {
                            new Tween(child.material)
                                .to({ opacity: 0 }, 500)
                                .easing(Easing.Quadratic.Out)
                                .start();
                        } else if (child.name === 'Picture' || child.name === 'PictureBorder'){
                            const shouldShowPicture = targetX === MAX_RIGHT && isVisibleByDegrees;
                            new Tween(child.material)
                                .to({ opacity: shouldShowPicture ? 1 : 0 }, 500)
                                .easing(Easing.Quadratic.Out)
                                .start();
                        } else {
                            const opacity = isVisibleByDegrees ? 1 : 0; //Fade out everything except the baseNode right in Front of us
                        
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
        } else {
            // Restore opacity for everything except Info text when fully zoomed out
            rootNode.children.forEach(baseNode => {
                baseNode.children.forEach(child => {
                    if (child.material && child.name !== 'Picture' && child.name !== 'PictureBorder') {
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
titleElement.innerText = titles[0];
artistElement.innerText = artists[0];
infoTextElement.innerText = infoTexts[0];