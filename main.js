import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/Addons.js';
import { Easing, Tween, update as updateTween } from 'tween';
import { artworks, titles, artists, artistPictures, infoTexts, arrows } from './model.js';
import Decimal from 'decimal.js';

//HTML-Elements holen
const infoTextElement =  document.getElementById('infoText');
const titleElement = document.getElementById('title');
const artistElement = document.getElementById('artist');

//Render Einstellungen
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

//Texture Loader definieren
const textureLoader = new THREE.TextureLoader();

//Szene und Kamera erstellen sowie Konstanten für Kamerabewegung anlegen
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const MIN_ZOOM = -2.5;
const MAX_ZOOM = -4.5;
const MIN_RIGHT = 0;
const MAX_RIGHT = 2;
camera.position.z = MIN_ZOOM;

//root Node definieren, welche später rotiert wird um alle Kinder bzw. base Nodes zu rotieren
const rootNode = new THREE.Object3D();
scene.add(rootNode);
const circleRadius = 7.5;

//Variablen zum Erstellen der Kunstwerke und Künstlerportraits
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
            const artistPictureWidth = artistPictureHeight * aspectRatio;

            //Bild des Künstlers hinzufügen
            const artistPicture = new THREE.Mesh(
                new THREE.BoxGeometry(artistPictureWidth, artistPictureHeight, artistPictureDepth),
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

            //Rahmen des Künstlerbildes hinzufügen
            const artistBorder = new THREE.Mesh(
                new THREE.BoxGeometry(artistPictureWidth + 0.1, artistPictureHeight + 0.1, artistPictureDepth),
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
                artistPicture.position.x = (artworkWidth / 2) + 2.4;
                artistBorder.position.x = (artworkWidth / 2) + 2.4;
            }else if (i === 1){
                artistPicture.position.x = (artworkWidth / 2) + 1.9;
                artistBorder.position.x = (artworkWidth / 2) + 1.9;
            }else if (i === 2){
                artistPicture.position.x = (artworkWidth / 2) + 2.4;
                artistBorder.position.x = (artworkWidth / 2) + 2.4;
            }else if (i === 3){
                artistPicture.position.x = (artworkWidth / 2) + 2.2;
                artistBorder.position.x = (artworkWidth / 2) + 2.2;
            }else if (i === 4){
                artistPicture.position.x = (artworkWidth / 2) + 2.7;
                artistBorder.position.x = (artworkWidth / 2) + 2.7;
            }else if (i === 5){
                artistPicture.position.x = (artworkWidth / 2) + 2.3;
                artistBorder.position.x = (artworkWidth / 2) + 2.3;
            }else if (i === 6){
                artistPicture.position.x = (artworkWidth / 2) + 3.3;
                artistBorder.position.x = (artworkWidth / 2) + 3.3;
            }else{
                artistPicture.position.x = (artworkWidth / 2) + 2.6;
                artistBorder.position.x = (artworkWidth / 2) + 2.6;
            }

            baseNode.add(artistBorder);
            baseNode.add(artistPicture);
            resolve();
        };
        artistPictureImg.onerror = reject;
        artistPictureImg.src = "images/" + artistPictures[i];
    });
}

//baut Kreis mit 8 base Nodes, an welche die Kunstwerke angehängt werden, um die Kamera herum
function initializeScene() {
    const scenePromises = [];
    const artWorkBorderTexture = textureLoader.load("images/artworkborder.png");
    artWorkBorderTexture.colorSpace = THREE.SRGBColorSpace;

    for (let i = 0; i < count; i++) {
        const artWorkTexture = textureLoader.load("images/" + artworks[i]);
        artWorkTexture.colorSpace = THREE.SRGBColorSpace;

        const artworkPromise = new Promise((resolve, reject) => {
            const artworkImg = new Image();
            artworkImg.onload = () => {
                const aspectRatio = artworkImg.width / artworkImg.height;
                const artworkWidth = artworkHeight * aspectRatio;

                const baseNode = new THREE.Object3D();
                baseNode.rotation.y = i * (2 * Math.PI / count);
                rootNode.add(baseNode);

                // Artwork mesh erstellen
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

                // Artwork Rahmen erstellen
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

                // Bilder der Künstler laden
                const artistPicturePromise = loadArtistPicture(i, baseNode, artworkWidth);

                // Pfeile hinzufügen
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

//Licht
const spotlight = new THREE.SpotLight(0xffffff, 200.0, 10.0, 0.8, 0.5);
spotlight.position.set(0, 5, MIN_ZOOM);
spotlight.target.position.set(0, 0.5, -circleRadius-1);
scene.add(spotlight);
scene.add(spotlight.target);

//Spiegel auf Boden
const mirror = new Reflector(
    new THREE.CircleGeometry(10),
    {
        color: 0x606060, //Stärke der Reflektion anpassen
        textureWidth: window.innerWidth,
        textureHeight: window.innerHeight
    }
);
mirror.position.y = -1.6;
mirror.rotateX(-Math.PI / 2); // Rotieren damit kamera es sehen kann
scene.add(mirror);

//Variable die umgestellt wird je nachdem ob sich die Galerie grade dreht, um zoomen währenddessen zu verhindern
let currentlyRotating = false;

//Dreht die Galerie und passt währenddessen Opacity und Inhalt der Texte an
function rotateGallery(direction, newIndex) {
    if(!currentlyRotating){
        const deltaY = new Decimal(direction)
        .times(new Decimal(2).times(Math.PI))
        .div(count)
        .toNumber();

    new Tween(rootNode.rotation)
        .to({ y: rootNode.rotation.y + deltaY })
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
            infoTextElement.innerText = infoTexts[newIndex];
            titleElement.style.opacity = 1;
            artistElement.style.opacity = 1;
        });
    }
}


//Animation
function animate() {
    updateTween();
	renderer.render( scene, camera );
}

//Berechnet den Winkel zwischen der negativen Z-Achse und der Base Node
function calculateAngleToZAxis(baseNode){
    const forward = new THREE.Vector3(0, 0, -1);
    const baseNodeDirection = new THREE.Vector3(0, 0, -1);
    baseNodeDirection.applyQuaternion(baseNode.getWorldQuaternion(new THREE.Quaternion()));
    const angle = forward.angleTo(baseNodeDirection);
    const degrees = THREE.MathUtils.radToDeg(angle);
    return degrees;
}

//Resize wenn sich die Viewport größe ändert
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mirror.getRenderTarget().setSize(window.innerWidth, window.innerHeight);
});

//Auf Klicks auf Pfeile reagieren
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
        
        // Arrow wurde geklickt
        if ((obj.name === 'LeftArrow' || obj.name === 'RightArrow') && obj.material.opacity > 0.9) {
            // Parent Node des arrows holen
            const baseNode = obj.parent;
            
            // Winkel berechnen
            let degrees = calculateAngleToZAxis(baseNode);
            
            //Nur Interaktion erlauben wenn der Pfeil mit einem Winkel < 20 zur Kamera ausgerichtet ist
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

//Auf wheel scrolling reagieren
window.addEventListener('wheel', (event) => {
    event.preventDefault();

    //Nur zoomen wenn wir uns grade nicht drehen
    if (!currentlyRotating){
        // Momentante Kameraposition holen
        const currentZ = camera.position.z;
        const currentX = camera.position.x;
        
        // Ziel mit momentaner position initialisieren
        let targetZ = currentZ;
        let targetX = currentX;

        // Kleiner threshhold für den Vergleich, damit Übergang von zoom rein/raus und rechts/links flüssiger ist
        const THRESHOLD = 0.1;
        const isAtMaxZoom = Math.abs(currentZ - MAX_ZOOM) < THRESHOLD;
        const isAtMinRight = Math.abs(currentX - MIN_RIGHT) < THRESHOLD;
        
        if (event.deltaY > 0) { // Scrolling down/away - raus zoomen
            if (isAtMaxZoom && !isAtMinRight) {
                targetX = Math.max(MIN_RIGHT, currentX - 0.5);
            } else {
                targetZ = Math.min(MIN_ZOOM, currentZ + 0.5);
                targetX = MIN_RIGHT;
            }
        } else { // Scrolling up/towards - rein zoomen
            if (!isAtMaxZoom) {
                targetZ = Math.max(MAX_ZOOM, currentZ - 0.5);
                targetX = MIN_RIGHT
            } else {
                targetX = Math.min(MAX_RIGHT, currentX + 0.5);
            }
        }

       if (camera.position._tween) camera.position._tween.stop();

       // Tween für Kamerabewegung
       const tween = new Tween(camera.position)
           .to({ x: targetX, z: targetZ }, 500)
           .easing(Easing.Quadratic.Out)
           .start();
       camera.position._tween = tween;

        //Fade Title und Artist
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

        //Fade Arrows, Artworks und Infotext
        if (targetZ < MIN_ZOOM){
            rootNode.children.forEach((baseNode, index) => {
                let degrees = calculateAngleToZAxis(baseNode);
                let isVisibleByDegrees = Math.abs(degrees) < 10;
                
                baseNode.children.forEach(child => {
                    if (child.material) {
                        //fade arrows
                        if (child.name === 'LeftArrow' || child.name === 'RightArrow') {
                            new Tween(child.material)
                                .to({ opacity: 0 }, 500)
                                .easing(Easing.Quadratic.Out)
                                .start();
                        //fade artist picture and border
                        } else if (child.name === 'Picture' || child.name === 'PictureBorder'){
                            const shouldShowPicture = targetX === MAX_RIGHT && isVisibleByDegrees;
                            new Tween(child.material)
                                .to({ opacity: shouldShowPicture ? 1 : 0 }, 500)
                                .easing(Easing.Quadratic.Out)
                                .start();
                        } else {
                            const opacity = isVisibleByDegrees ? 1 : 0; //alles raus/rein faden bis auf die Base Node vor uns
                        
                            // Tween für opacity transition
                            new Tween(child.material)
                                .to({ opacity }, 500)
                                .easing(Easing.Quadratic.Out)
                                .start();
                            
                            child.material.transparent = true;
                        }
                    }
                });
            });
        } else {
            // Opacity für alles außer Künstlerbilder wiederherstellen
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
}, { passive: false });

//Erstes Kunstwerk, ersten Künstler und ersten Infotext initialisieren
titleElement.innerText = titles[0];
artistElement.innerText = artists[0];
infoTextElement.innerText = infoTexts[0];