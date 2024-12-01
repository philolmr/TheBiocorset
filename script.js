import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Water } from "three/addons/objects/Water2.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 10000);
camera.position.set(1, 15, 22);

const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;


// Charger une texture pour le fond
const loader = new THREE.TextureLoader();
loader.load('files/fondbleu.jpg', function (texture) {
    scene.background = texture;
}, undefined, function (err) {
    console.error('Erreur lors du chargement de l\'image de fond :', err);
});

scene.add(new THREE.AmbientLight(0x444444));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7).normalize();
light.castShadow = true;
scene.add(light);


//################ WATER ###########################

const waterNormals = new THREE.TextureLoader().load('files/waternormals.jpg');
waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

const waterGeometry = new THREE.CircleGeometry(100, 100);
const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: waterNormals,
    sunDirection: light.position.clone().normalize(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 5,
    
});

water.rotation.x = -Math.PI / 2;
scene.add(water);


//############################### LOAD GLB #############################

// Charger le fichier GLB
const gltfLoader = new GLTFLoader();
function loadGLB(model,fichier, scale, positionx, positiony,positionz,rotax,rotay,rotaz) {
    gltfLoader.load(
        fichier, // Chemin vers le fichier GLB
        function (gltf) {
            // Ajouter le modèle chargé à la scène
            model = gltf.scene;
            model.scale.set(scale, scale,scale); // Ajustez l'échelle si nécessaire
            model.position.set(positionx, positionz, positiony); // Positionnez le modèle
            model.rotation.x = rotax;
            model.rotation.y = rotay;
            model.rotation.z = rotaz;

            scene.add(model);
        }
    )
};

let rock1, rock2, rock3, boat, palm, seashell,etoile,table,book;
loadGLB(rock1,'files/glb/forest_rock_wjxqcct_low.glb',10,-40,0,0 ,0,2*Math.PI/3,0);
loadGLB(rock2,'files/glb/forest_rock_wjxqcct_low.glb', 15,-45,-12,-1,0,2*Math.PI/3,0);
loadGLB(rock3,'files/glb/forest_rock_wjxqcct_low.glb', 7,28,-35,0,0,2*Math.PI/3,0);
loadGLB(boat, 'files/glb/boats.glb', 3, 34,-5,1,0,2*Math.PI/3,0);
loadGLB(palm, 'files/glb/palm_1.glb', 0.04, 20,-33,1,0,2*Math.PI/3,0);
loadGLB(seashell,'files/glb/seashell.glb',5,-38,-8, 1,0,2*Math.PI/3,0);
loadGLB(etoile,'files/glb/025_deep_sea.glb',0.2,-35,-25, 1.2,0,2*Math.PI/3,0);


//##########################   BOOK    #####################

let bookMesh; // Déclare le mesh du livre
let initialPosition = new THREE.Vector3(); // Position initiale du livre
let initialRotation = new THREE.Euler(); // Rotation initiale du livre
let initialScale = new THREE.Vector3(7, 7, 7); // Échelle initiale du livre
let isBookMoved = false; // Vérifie si le livre a été déplacé

const targetPosition = new THREE.Vector3(0, 9, 12); // Position cible devant la caméra
const targetRotation = new THREE.Vector3(Math.PI/3, -Math.PI, 0); // Position cible devant la caméra
const targetScale = new THREE.Vector3(16, 16, 16); // Échelle cible du livre

// Charger le modèle 3D du livre (GLTF)
gltfLoader.load('files/glb/open_old_book.glb', function (gltf) {
    bookMesh = gltf.scene;
    bookMesh.scale.copy(initialScale); // Ajustez l'échelle si nécessaire
    bookMesh.position.set(-10, 5,1); // Positionnez le modèle
    bookMesh.rotation.set(2*Math.PI/6, -2*Math.PI/3, 2*Math.PI/6);

    scene.add(bookMesh);
    // Sauvegarder la position et la rotation initiales
    initialPosition.copy(bookMesh.position);
    initialRotation.copy(bookMesh.rotation);  

});

let animationStartTime = null;
let animationDuration = 1000; // 1 seconde
let isAnimating = false;

// Fonction pour lancer l'animation
function moveBookToCamera() {
    if (!isAnimating && bookMesh) {
        isAnimating = true;
        isBookMoved = !isBookMoved; // Bascule entre position initiale et cible
        animationStartTime = performance.now(); // Temps de départ de l'animation
    }
}

// Fonction d'animation
function animateBookToPosition() {
    if (!isAnimating || !bookMesh) return;

    const elapsedTime = performance.now() - animationStartTime;
    const t = Math.min(elapsedTime / animationDuration, 1); // Normaliser le temps (0 à 1)

    // Interpolation de position
    const startPosition = isBookMoved ? initialPosition : targetPosition;
    const endPosition = isBookMoved ? targetPosition : initialPosition;
    bookMesh.position.lerpVectors(startPosition, endPosition, t);

    // Interpolation de rotation
    const startRotation = isBookMoved ? initialRotation : targetRotation;
    const endRotation = isBookMoved ? targetRotation : initialRotation;
    // bookMesh.rotation.lerpVectors(startRotation, endRotation, t);
    bookMesh.rotation.x = startRotation.x * (1 - t) + endRotation.x * t;
    bookMesh.rotation.y = startRotation.y * (1 - t) + endRotation.y * t;
    bookMesh.rotation.z = startRotation.z * (1 - t) + endRotation.z * t;


    // THREE.Quaternion.slerp(startRotation, endRotation, bookMesh.quaternion, t);

    // Interpolation de l'échelle
    const startScale = isBookMoved ? initialScale : targetScale;
    const endScale = isBookMoved ? targetScale : initialScale;
    bookMesh.scale.lerpVectors(startScale, endScale, t);

    // Terminer l'animation
    if (t === 1) {
        isAnimating = false;
    }
}

// Fonction pour animer ou transformer le livre
function animateBook(time) {
    if (!bookMesh) return; // Attendre que le modèle soit chargé

    if (!isBookMoved) {
            // Animation simple de rotation ou oscillation
        bookMesh.position.y = initialPosition.y + Math.sin(time) * 0.5; // Oscillation en Y
        bookMesh.rotation.x = initialRotation.x ; // Rotation
        bookMesh.rotation.z = initialRotation.z ; // Rotation
    }
    else {
        
        // Animation simple de rotation ou oscillation
        bookMesh.position.y = targetPosition.y + Math.sin(time) * 0.5; // Oscillation en Y
        bookMesh.rotation.x = targetRotation.x ; // Rotation
        bookMesh.rotation.z = targetRotation.z ; // Rotation
        textMesh.position.y = targetPosition.y + 1 + Math.sin(time) * 0.5;
        text2Mesh.position.y = targetPosition.y +1 +Math.sin(time) * 0.5;
        clicMesh.position.y = targetPosition.y -2.3 +Math.sin(time) * 0.5;

    }

}

//#########################   TEXTE BOOK ###########################

function createTextZone({
    text,
    position = { x: 0, y: 0, z: 0 },
    width = 500,  // Augmentez cette valeur pour éviter les coupures
    height = 1000,
    margin = 10, // Marge gauche
    lineHeight = 40, // Ajuster l'espacement entre les lignes
}) {
    const textCanvas = document.createElement('canvas');
    textCanvas.width = width;
    textCanvas.height = height;
    const textContext = textCanvas.getContext('2d');

    // Fonction pour dessiner du texte dans le canvas
    const drawText = (text) => {
        textContext.clearRect(0, 0, textCanvas.width, textCanvas.height);


        // Style du texte
        textContext.font = '30px Arial'; // Taille et police
        textContext.fillStyle = '#ffffff'; // Couleur du texte
        textContext.textAlign = 'left'; // Aligné à gauche
        textContext.textBaseline = 'top'; // Départ en haut

        // Découper le texte en lignes
        const words = text.split(' ');
        let line = '';
        let y = margin;

        for (const word of words) {
            const testLine = line + word + ' ';
            const testWidth = textContext.measureText(testLine).width;

            // Si la ligne dépasse la largeur, passe à la ligne suivante
            if (testWidth > width - 2 * margin) {
                textContext.fillText(line, margin, y);
                line = word + ' ';
                y += lineHeight;

                // Si la hauteur dépasse le canvas, arrêter d'ajouter du texte
                if (y + lineHeight > height) {
                    console.warn('Le texte est trop long pour la zone de texte définie.');
                    break;
                }
            } else {
                line = testLine;
            }
        }
        // Afficher la dernière ligne
        textContext.fillText(line, margin, y);
    };

    drawText(text);

    // Créer une texture à partir du canvas
    const textTexture = new THREE.CanvasTexture(textCanvas);

    // Matériau avec transparence
    const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture });
    textMaterial.transparent = true;

    // Géométrie du panneau
    const textGeometry = new THREE.PlaneGeometry(
        width / 100, // Ajuster à l'échelle Three.js
        height / 100
    );
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Positionner le panneau
    textMesh.position.set(position.x, position.y, position.z);
    textMesh.rotation.x = -Math.PI / 6;
    textMesh.visible = false;
    
    // Ajouter une méthode pour mettre à jour le texte
    textMesh.updateText = (newText) => {
        drawText(newText);
        textTexture.needsUpdate = true; // Informer Three.js que la texture a changé
    };

    return textMesh;
}

// Créer un canvas pour le texte "CLIC HERE"
const clicCanvas = document.createElement('canvas');
clicCanvas.width = 180; // Largeur du canvas
clicCanvas.height = 30; // Hauteur du canvas
// clicCanvas.margin = 5;
const clicContext = clicCanvas.getContext('2d');
clicContext.fillStyle = '#116717'; // Couleur verte
clicContext.fillRect(0, 0, clicCanvas.width/2, clicCanvas.height/2);
clicContext.font = '13px Arial'; // Taille et police
clicContext.fillStyle = '#FFFFFF'; // Couleur du texte
clicContext.textAlign = 'center'; // Aligné au centre
clicContext.textBaseline = 'middle'; // Centré verticalement
clicContext.fillText('CLIC HERE', clicCanvas.width/4, clicCanvas.height/4);
const clicTexture = new THREE.CanvasTexture(clicCanvas);
const clicMaterial = new THREE.MeshBasicMaterial({ map: clicTexture });
clicMaterial.transparent = true;
const clicGeometry = new THREE.PlaneGeometry(4,1);
const clicMesh = new THREE.Mesh(clicGeometry, clicMaterial);
clicMesh.position.set(-4, targetPosition.y -3 , 14.5); // Ajuster la position dans la scène
clicMesh.rotation.x =-Math.PI / 6; // Pas de rotation initiale
clicMesh.visible = false; // Visible par défaut
scene.add(clicMesh);

//       PAGES

//page gauche 1
const textMesh = createTextZone({
    text: 'La Chlorella en poudre a été choisie en raison de sa meilleure conversion en PLA par rapport à d’autres types d’algues comme la spiruline. Pour obtenir la poudre, les algues sont récoltées, séchées, puis transformées en une poudre fine qui servira de matière première pour la suite du processus.',
    position: { x: -3, y: targetPosition.y -0.2 , z: 13.5 },
    width: 500, // Largeur augmentée
    height: 550, // Hauteur adaptée
    margin: 10,  // Marge suffisante
    lineHeight: 50, // Espacement entre les lignes
});
scene.add(textMesh);

//page droite 1
const text2Mesh = createTextZone({
    text : 'Cette forme de Chlorella a été préférée pour sa facilité de transformation et sa meilleure compatibilité avec les technologies d’impression 3D.',
    position: { x: 4, y: targetPosition.y -0.2 , z: 13.5 },
    width: 500, // Largeur augmentée
    height: 550, // Hauteur adaptée
    margin: 10,  // Marge suffisante
    lineHeight: 50, // Espacement entre les lignes
});
scene.add(text2Mesh);

// function checkBookPosition() {
//     if (bookMesh.position.equals(targetPosition)) {
//         textMesh.visible = true;
//         text2Mesh.visible = true;
//         clicMesh.visible = true;
//     } else {
//         textMesh.visible = false;
//         text2Mesh.visible = false;
//         clicMesh.visible = false;
//     }
// }


//#####################  STL LOADER - DECO ##########################


const stlLoader = new STLLoader();
let algaePLA, sandPLA, algaePLA2, sandPLA2, bancsablePLA;
// Declare variables for meshes
let algueMesh, sableMesh, alguePoudreMesh, supportPoudreMesh, becherMesh, liquideMesh, bouchonMesh, billesMesh, bobineMesh,supportBobineMesh, corsetMesh;


stlLoader.load('files/algues.stl', function (geometry) {
    const material = new THREE.MeshLambertMaterial({ color: 0x075E0A });
    algaePLA = new THREE.Mesh(geometry, material);
    algaePLA.scale.set(0.5, 0.5, 0.5);
    algaePLA.position.set(10, 1, -40);
    algaePLA.rotation.x = -Math.PI / 2;
    algaePLA.rotation.z = Math.PI;
    algaePLA.castShadow = true;
    scene.add(algaePLA);
});

stlLoader.load('files/sable.stl', function (geometry) {
    const material = new THREE.MeshLambertMaterial({ color: 0xE2CFAE });
    sandPLA = new THREE.Mesh(geometry, material);
    sandPLA.scale.set(0.5, 0.5, 0.5);
    sandPLA.position.set(10, 1, -40);
    sandPLA.rotation.x = -Math.PI / 2;
    sandPLA.rotation.z = Math.PI;
    sandPLA.castShadow = true;
    scene.add(sandPLA);
});

stlLoader.load('files/algues.stl', function (geometry) {
    const material = new THREE.MeshLambertMaterial({ color: 0x075E0A });
    algaePLA2 = new THREE.Mesh(geometry, material);
    algaePLA2.scale.set(0.5, 0.5, 0.5);
    algaePLA2.position.set(25, 1, -38);
    algaePLA2.rotation.x = -Math.PI / 2;
    algaePLA2.rotation.z = -Math.PI/8;
    algaePLA2.castShadow = true;
    scene.add(algaePLA2);
});

stlLoader.load('files/sable.stl', function (geometry) {
    const material = new THREE.MeshLambertMaterial({ color: 0xE2CFAE });
    sandPLA2 = new THREE.Mesh(geometry, material);
    sandPLA2.scale.set(0.5, 0.5, 0.5);
    sandPLA2.position.set(25, 1, -38);
    sandPLA2.rotation.x = -Math.PI / 2;
    sandPLA2.rotation.z = -Math.PI/8;
    sandPLA2.castShadow = true;
    scene.add(sandPLA2);
});

stlLoader.load('files/bancsable.stl', (geometry) => {
    bancsablePLA = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: 0xE2CFAE }));
    bancsablePLA.scale.set(1, 1, 1);
    bancsablePLA.position.set(0,9,0);
    bancsablePLA.rotation.x = -Math.PI / 2;
    scene.add(bancsablePLA);
});

//####################### LOAD 3D - TRANSFO ##########################

//feuille algue
stlLoader.load(
    './3D/feuille_algue.stl',  // Path to STL file
    function (geometry) {
        const material = new THREE.MeshLambertMaterial({color : 0x075E0A});
        algueMesh = new THREE.Mesh(geometry, material);
        algueMesh.scale.set(0.7, 0.7, 0.7);
        algueMesh.position.set(0,4,-4);
        algueMesh.rotation.x = -Math.PI / 2;
        algueMesh.castShadow = true;
        scene.add(algueMesh);
    },
    undefined,
    function (error) {
        console.error('Error loading algae model', error);
    }
);

// Load sand model
stlLoader.load(
    './3D/sable_algue.stl',  // Path to STL file
    function (geometry) {
        const material = new THREE.MeshLambertMaterial({ color: 0xDDB29B });
        sableMesh = new THREE.Mesh(geometry, material);
        sableMesh.scale.set(0.7, 0.7, 0.7);
        sableMesh.position.set(0,4,-4);
        sableMesh.rotation.x = -Math.PI / 2;
        sableMesh.castShadow = true;
        scene.add(sableMesh);
    },
    undefined,
    function (error) {
        console.error('Error loading sand model', error);
    }
);


//Load becher model
stlLoader.load(
    './3D/becher.stl',
    function (geometry) {
        const material = new THREE.MeshLambertMaterial({
            color: 0xE8F9FF, // Couleur bleue claire pour un effet de verre
            transparent: true, // Activer la transparence
            opacity: 0.5, // Régler l'opacité (0 est complètement transparent, 1 est opaque)
            refractionRatio: 0.98 // Réfraction pour un effet de verre
        });
        becherMesh = new THREE.Mesh(geometry, material);
        becherMesh.scale.set(0.15, 0.15, 0.15);
        becherMesh.position.set(0,4,-4);

        becherMesh.castShadow = true;
        scene.add(becherMesh);
        becherMesh.visible = false;
    },
    undefined,
    function (error) {
        console.error('Error loading sand model', error);
    }
)

//Load bouchon model
stlLoader.load(
    './3D/bouchon.stl',
    function (geometry) {
        const material = new THREE.MeshLambertMaterial({ color: 0x481600 });
        bouchonMesh = new THREE.Mesh(geometry, material);
        bouchonMesh.scale.set(0.15, 0.15, 0.15);
        bouchonMesh.position.set(0,4,-4);

        bouchonMesh.castShadow = true;
        scene.add(bouchonMesh);
        bouchonMesh.visible = false;
    },
    undefined,
    function (error) {
        console.error('Error loading sand model', error);
    }
)

//Load becher model
stlLoader.load(
    './3D/liquide.stl',
    function (geometry) {
        const material = new THREE.MeshLambertMaterial({ color: 0x7BDF7B });
        liquideMesh = new THREE.Mesh(geometry, material);
        liquideMesh.scale.set(0.15, 0.15, 0.15);
        liquideMesh.position.set(0,4,-4);

        liquideMesh.castShadow = true;
        scene.add(liquideMesh);
        liquideMesh.visible = false;
    },
    undefined,
    function (error) {
        console.error('Error loading sand model', error);
    }
)

// Load billes PLA 
stlLoader.load(
    './3D/billes_PLA.stl',  // Path to STL file
    function (geometry) {
        const material = new THREE.MeshLambertMaterial({color : 0x075E0A});
        billesMesh = new THREE.Mesh(geometry, material);
        billesMesh.scale.set(0.17, 0.17, 0.17);
        billesMesh.position.set(0,4,-4);
        billesMesh.rotation.y = -Math.PI / 2;
        billesMesh.castShadow = true;
        scene.add(billesMesh);
        billesMesh.visible = false;
        billesMesh.name = "billes";
    },
    undefined,
    function (error) {
        console.error('Error loading algae model', error);
    }
);

// Load bobine PLA 
stlLoader.load(
    './3D/bobine.stl',  // Path to STL file
    function (geometry) {
        const material = new THREE.MeshLambertMaterial({color : 0x075E0A});
        bobineMesh = new THREE.Mesh(geometry, material);
        bobineMesh.scale.set(0.4, 0.4, 0.4);
        bobineMesh.position.set(0,4,-4);

        bobineMesh.rotation.x = -Math.PI / 5;
        bobineMesh.castShadow = true;
        scene.add(bobineMesh);
        bobineMesh.visible = false;
        bobineMesh.name = "bobine";
    },
    undefined,
    function (error) {
        console.error('Error loading algae model', error);
    }
);

// Load support bobine PLA 
stlLoader.load(
    './3D/support_bobine.stl',  // Path to STL file
    function (geometry) {
        const material = new THREE.MeshLambertMaterial({color : 0x797272});
        supportBobineMesh = new THREE.Mesh(geometry, material);
        supportBobineMesh.scale.set(0.4, 0.4, 0.4);
        supportBobineMesh.position.set(0,4,-4);
        supportBobineMesh.rotation.x = -Math.PI / 5;
        supportBobineMesh.castShadow = true;
        scene.add(supportBobineMesh);
        supportBobineMesh.visible = false;
    },
    undefined,
    function (error) {
        console.error('Error loading algae model', error);
    }
);

// Load corset PLA 
stlLoader.load(
    './files/corset.stl',  // Path to STL file
    function (geometry) {
        const material = new THREE.MeshLambertMaterial({color : 0x075E0A});
        corsetMesh = new THREE.Mesh(geometry, material);
        corsetMesh.scale.set(0.25, 0.25, 0.25);
         // Positionne l'objet à (0, 0, 0)
        corsetMesh.position.set(0,4,-4);
        corsetMesh.rotation.x = -Math.PI / 2;
        corsetMesh.castShadow = true;
        scene.add(corsetMesh);
        corsetMesh.visible = false;
    },
    undefined,
    function (error) {
        console.error('Error loading algae model', error);
    }
);
// Function to transform algae and sand into powder
stlLoader.load(
    './3D/algue_en_poudre.stl',
    function (geometry) {
        const material = new THREE.MeshLambertMaterial({ color : 0x0F830F });
        alguePoudreMesh = new THREE.Mesh(geometry, material);
        alguePoudreMesh.scale.set(0.8, 0.8, 0.8).multiplyScalar(1/3); // Reduce by 3
        alguePoudreMesh.position.set(0,4,-4);
        alguePoudreMesh.castShadow = true;
        scene.add(alguePoudreMesh);
        alguePoudreMesh.visible = false;
    }
);

// Replace sand with support
stlLoader.load(
    './3D/support_poudre.stl',
    function (geometry) {
        const material = new THREE.MeshLambertMaterial({ 
            color: 0xE8F9FF, // Couleur bleue claire pour un effet de verre
            transparent: true, // Activer la transparence
            opacity: 0.5, // Régler l'opacité (0 est complètement transparent, 1 est opaque)
            refractionRatio: 0.98 // Réfraction pour un effet de verre
        });
        supportPoudreMesh = new THREE.Mesh(geometry, material);
        supportPoudreMesh.scale.set(0.8,0.8, 0.8).multiplyScalar(1/3); // Reduce by 3
        supportPoudreMesh.position.set(0,4,-4);

        supportPoudreMesh.castShadow = true;
        scene.add(supportPoudreMesh);
        supportPoudreMesh.visible = false; // Hide original sand
    }
);

// Variables for animation
let rotationSpeed = 0.01;
let fastRotationDuration = 1000; // 3 seconds
let isTransforming = false;
let isTransformingAlgues = false;
let isTransformingAcyde = false;
let isTransformingBilles = false;
let isTransformingBobine = false;
let isTransformingToCorset = false;

// Animation function
const animate = () => {
    requestAnimationFrame(animate);

    if (algueMesh && sableMesh) {
        algueMesh.rotation.z += rotationSpeed; // Rotation around Z axis
        sableMesh.rotation.z += rotationSpeed; // Rotation around Z axis
    }
    if (alguePoudreMesh && supportPoudreMesh) {
        alguePoudreMesh.rotation.y += rotationSpeed; // Rotation around Z axis
        supportPoudreMesh.rotation.y += rotationSpeed; // Rotation around Z axis
    }
    if (becherMesh && bouchonMesh && liquideMesh) {
        becherMesh.rotation.y +=rotationSpeed;
        bouchonMesh.rotation.y +=rotationSpeed;
        liquideMesh.rotation.y +=rotationSpeed;
    }
    if (billesMesh) {
        billesMesh.rotation.y +=rotationSpeed;
    }
    if (bobineMesh && supportBobineMesh) {
        bobineMesh.rotation.y +=rotationSpeed;
        supportBobineMesh.rotation.y += rotationSpeed;
    }
    if (corsetMesh) {
        corsetMesh.rotation.z += rotationSpeed;
    }

    renderer.render(scene, camera);
};

const controls = new OrbitControls(camera, renderer.domElement);
// Désactiver la rotation de la caméra
controls.enableRotate = false;

// Définir des limites de zoom
//controls.minDistance = 5;  // Distance minimale de la caméra
controls.maxDistance = 25; // Distance maximale de la caméra

// Optionnel : désactiver les autres mouvements si besoin
controls.enablePan = false; // Désactiver le déplacement latéral

// const liste_algue = [];
// const liste_poudre = [];
// liste_algue.push(algueMesh,sableMesh);
// liste_poudre.push(alguePoudreMesh, supportPoudreMesh);

//###########   TRANSFO   ########################

// function transformeMesh (liste1, liste2, bool) {
    
//     if (bool) return bool; // Prevent multiple triggers

//     bool = true;

//     // Set fast rotation speed for 3 seconds
//     rotationSpeed = 0.2; // Increased speed for transformation

//         // Perform transformations after fast rotation duration
//     setTimeout(() => {
//         // Hide meshes from `liste1`
//         liste1.forEach((mesh) => {
//             if (mesh) mesh.visible = false;
//         });

//         // Show meshes from `liste2`
//         liste2.forEach((mesh) => {
//             if (mesh) mesh.visible = true;
//         });

//         // Gradually return to normal rotation speed
//         let decreaseDuration = 2000; // 2 seconds to slow down
//         let startTime = performance.now();

//         const animateRotationBack = () => {
//             let currentTime = performance.now();
//             let elapsedTime = currentTime - startTime;

//             if (elapsedTime < decreaseDuration) {
//                 rotationSpeed = 0.1 - (0.09 * (elapsedTime / decreaseDuration)); // Gradually decrease speed
//                 requestAnimationFrame(animateRotationBack);
//             } else {
//                 rotationSpeed = 0.01; // Set to normal speed
//                 bool = false; // End transformation
//             }
//         };

//         animateRotationBack(); // Start slowing down
//     }, fastRotationDuration); // Wait 3 seconds
//     return bool;
// };

const transformToAlgues = () => {
    if (isTransformingAlgues) return; // Prevent multiple triggers

    isTransformingAlgues = true;

    // Set fast rotation speed for 3 seconds
    rotationSpeed = 0.2; // Increased speed for transformation

    // Set a timeout to revert speed and perform transformations after 3 seconds
    setTimeout(() => {
        // Replace algae with powdered algae
        algueMesh.visible = true; // Hide original algae
        corsetMesh.visible = false;
        sableMesh.visible = true;

        // Gradually return to normal rotation speed
        let decreaseDuration = 2000; // 2 seconds to slow down
        let startTime = performance.now();

        const animateRotationBack = () => {
            let currentTime = performance.now();
            let elapsedTime = currentTime - startTime;

            if (elapsedTime < decreaseDuration) {
                rotationSpeed = 0.1 - (0.09 * (elapsedTime / decreaseDuration)); // Gradually decrease speed
                requestAnimationFrame(animateRotationBack);
            } else {
                rotationSpeed = 0.01; // Set to normal speed
                isTransforming = false; // End transformation
            }
        };

        animateRotationBack(); // Start slowing down
    }, fastRotationDuration); // Wait 3 seconds
};

const transformToPoudre = () => {
    if (isTransforming) return; // Prevent multiple triggers

    isTransforming = true;

    // Set fast rotation speed for 3 seconds
    rotationSpeed = 0.2; // Increased speed for transformation

    // Set a timeout to revert speed and perform transformations after 3 seconds
    setTimeout(() => {
        // Replace algae with powdered algae
        algueMesh.visible = false; // Hide original algae
        alguePoudreMesh.visible = true;
        supportPoudreMesh.visible = true;
        sableMesh.visible = false;

        // Gradually return to normal rotation speed
        let decreaseDuration = 2000; // 2 seconds to slow down
        let startTime = performance.now();

        const animateRotationBack = () => {
            let currentTime = performance.now();
            let elapsedTime = currentTime - startTime;

            if (elapsedTime < decreaseDuration) {
                rotationSpeed = 0.1 - (0.09 * (elapsedTime / decreaseDuration)); // Gradually decrease speed
                requestAnimationFrame(animateRotationBack);
            } else {
                rotationSpeed = 0.01; // Set to normal speed
                isTransforming = false; // End transformation
            }
        };

        animateRotationBack(); // Start slowing down
    }, fastRotationDuration); // Wait 3 seconds
};

// Function to transform algae and sand into powder
const transformToAcyde = () => {
    if (isTransformingAcyde) return; // Prevent multiple triggers

    isTransformingAcyde = true;

    // Set fast rotation speed for 3 seconds
    rotationSpeed = 0.2; // Increased speed for transformation

    // Set a timeout to revert speed and perform transformations after 3 seconds
    setTimeout(() => {
        // Replace algae with powdered algae
        alguePoudreMesh.visible = false;
        supportPoudreMesh.visible = false;
        liquideMesh.visible = true;
        bouchonMesh.visible = true;
        becherMesh.visible = true;

        // Gradually return to normal rotation speed
        let decreaseDuration = 2000; // 2 seconds to slow down
        let startTime = performance.now();

        const animateRotationBack = () => {
            let currentTime = performance.now();
            let elapsedTime = currentTime - startTime;

            if (elapsedTime < decreaseDuration) {
                rotationSpeed = 0.1 - (0.09 * (elapsedTime / decreaseDuration)); // Gradually decrease speed
                requestAnimationFrame(animateRotationBack);
            } else {
                rotationSpeed = 0.01; // Set to normal speed
                isTransformingAcyde = false; // End transformation
            }
        };

        animateRotationBack(); // Start slowing down
    }, fastRotationDuration); // Wait 3 seconds
};

// Function to transform acyde into billes
const transformToBilles = () => {
    if (isTransformingBilles) return; // Prevent multiple triggers

    isTransformingBilles = true;

    // Set fast rotation speed for 3 seconds
    rotationSpeed = 0.2; // Increased speed for transformation

    // Set a timeout to revert speed and perform transformations after 3 seconds
    setTimeout(() => {
        // Replace algae with powdered algae
        liquideMesh.visible = false;
        bouchonMesh.visible = false;
        becherMesh.visible = false;
        billesMesh.visible = true;

        // Gradually return to normal rotation speed
        let decreaseDuration = 2000; // 2 seconds to slow down
        let startTime = performance.now();

        const animateRotationBack = () => {
            let currentTime = performance.now();
            let elapsedTime = currentTime - startTime;

            if (elapsedTime < decreaseDuration) {
                rotationSpeed = 0.1 - (0.09 * (elapsedTime / decreaseDuration)); // Gradually decrease speed
                requestAnimationFrame(animateRotationBack);
            } else {
                rotationSpeed = 0.01; // Set to normal speed
                isTransformingBilles = false; // Corriger ici : utiliser isTransformingBilles au lieu de isTransformingAcyde
            }
        };

        animateRotationBack(); // Start slowing down
    }, fastRotationDuration); // Wait 3 seconds
};

// Function to transform billes into bobine
const transformToBobine = () => {
    if (isTransformingBobine) return; // Prevent multiple triggers

    isTransformingBobine = true;

    // Set fast rotation speed for 3 seconds
    rotationSpeed = 0.2; // Increased speed for transformation

    // Set a timeout to revert speed and perform transformations after 3 seconds
    setTimeout(() => {
        // Replace algae with powdered algae
        billesMesh.visible = false;
        bobineMesh.visible = true;
        supportBobineMesh.visible = true;
        

        // Gradually return to normal rotation speed
        let decreaseDuration = 2000; // 2 seconds to slow down
        let startTime = performance.now();

        const animateRotationBack = () => {
            let currentTime = performance.now();
            let elapsedTime = currentTime - startTime;

            if (elapsedTime < decreaseDuration) {
                rotationSpeed = 0.1 - (0.09 * (elapsedTime / decreaseDuration)); // Gradually decrease speed
                requestAnimationFrame(animateRotationBack);
            } else {
                rotationSpeed = 0.01; // Set to normal speed
                isTransformingBobine = false; // Corriger ici : utiliser isTransformingBilles au lieu de isTransformingAcyde
            }
        };

        animateRotationBack(); // Start slowing down
    }, fastRotationDuration); // Wait 3 seconds
};

// Function to transform billes into bobine
const transformToCorset = () => {
    if (isTransformingToCorset) return; // Prevent multiple triggers

    isTransformingToCorset = true;

    // Set fast rotation speed for 3 seconds
    rotationSpeed = 0.2; // Increased speed for transformation

    // Set a timeout to revert speed and perform transformations after 3 seconds
    setTimeout(() => {
        // Replace algae with powdered algae
        bobineMesh.visible = false;
        supportBobineMesh.visible = false;
        corsetMesh.visible = true;
        

        // Gradually return to normal rotation speed
        let decreaseDuration = 2000; // 2 seconds to slow down
        let startTime = performance.now();

        const animateRotationBack = () => {
            let currentTime = performance.now();
            let elapsedTime = currentTime - startTime;

            if (elapsedTime < decreaseDuration) {
                rotationSpeed = 0.1 - (0.09 * (elapsedTime / decreaseDuration)); // Gradually decrease speed
                requestAnimationFrame(animateRotationBack);
            } else {
                rotationSpeed = 0.01; // Set to normal speed
                isTransformingToCorset = false; // Corriger ici : utiliser isTransformingBilles au lieu de isTransformingAcyde
            }
        };

        animateRotationBack(); // Start slowing down
    }, fastRotationDuration); // Wait 3 seconds
};


// ###################  EVENT ##############################

// Add event listener for click
canvas.addEventListener('click', (event) => {
    // Check if user clicked on algae or sand
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    // Convert mouse coordinates to scene coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    //console.log(algueMesh, sableMesh, alguePoudreMesh, supportPoudreMesh, becherMesh, bouchonMesh, liquideMesh, billesMesh, bobineMesh);
    const intersectsResult = raycaster.intersectObjects([algueMesh, sableMesh, alguePoudreMesh, supportPoudreMesh, becherMesh, bouchonMesh, liquideMesh, billesMesh, bobineMesh, supportBobineMesh, corsetMesh, bookMesh]);
    let intersects = [];
    console.log(intersects, bookMesh);
    intersectsResult.forEach(element => {
        intersects.push(element.object);
    })
    console.log(intersects);

    if (intersects.length === 0 ) { return }

    else if ((intersects.includes(algueMesh) && algueMesh.visible) || (intersects.includes(sableMesh) && sableMesh.visible)) {
        transformToPoudre();
        }
    else if ((intersects.includes(alguePoudreMesh) && alguePoudreMesh.visible) || (intersects.includes(supportPoudreMesh) && supportPoudreMesh.visible) ) {
        transformToAcyde(); // Transforme en potion si on clique sur la poudre
    }
    else if ((intersects.includes(becherMesh) && becherMesh.visible) || (intersects.includes(bouchonMesh) && bouchonMesh.visible) || (intersects.includes(liquideMesh) && liquideMesh.visible)) {
        transformToBilles(); // Transforme en billes si on clique sur le becher
    }
    else if ((intersects.includes(billesMesh) && billesMesh.visible)) {
        transformToBobine();
    }
    else if ((intersects.includes(bobineMesh) && bobineMesh.visible) || (intersects.includes(supportBobineMesh) && supportBobineMesh.visible)) {
        transformToCorset();
    }
    else if ((intersects.includes(corsetMesh) && corsetMesh.visible)) {
        isTransforming = false;
        isTransformingAcyde = false;
        isTransformingBilles = false;
        isTransformingBobine = false;
        isTransformingAlgues = false;
        isTransformingToCorset = false;
        transformToAlgues();    
    }

    let bookIsInIntersects = false;
    bookMesh.traverse(child => {
        if (intersects.includes(child)) {
          bookIsInIntersects = true;
          if (algueMesh.visible) {
            text2Mesh.updateText(' Un corset fait avec des materiaux bodégradables et biosoucés !');
            textMesh.updateText('Le BioCorset');
            
          }
          else if (alguePoudreMesh.visible){
            text2Mesh.updateText('Cette forme de Chlorella a été préférée pour sa facilité de transformation et sa meilleure compatibilité avec les technologies d’impression 3D.');
            textMesh.updateText('La Chlorella en poudre a été choisie en raison de sa meilleure conversion en PLA par rapport à d’autres types d’algues comme la spiruline. Pour obtenir la poudre, les algues sont récoltées, séchées, puis transformées en une poudre fine qui servira de matière première pour la suite du processus.');
          }
          else if (becherMesh.visible) {
            textMesh.updateText('Extraction des sucres : La première étape consiste à extraire les sucres présents dans la poudre de Chlorella.grâce à l’hydrolyse. Les glucides contenus dans les algues sont convertis en sucres simples grâce à l’utilisation d’acides dilués ou d’enzymes hydrolytiques. Une fois cette réaction terminée, la solution est filtrée.');
            text2Mesh.updateText('Fermentation des sucres en acide lactique : Les sucres obtenus sont ensuite soumis à une fermentation avec des bactéries lactiques. Ces bactéries transforment les sucres en acide lactique dans un bioréacteur  (30-40°C) avec un PH controlé pH. Puis, l’acide lactique est purifié afin d’éliminer les impuretés restantes.');
          }
          else if (billesMesh.visible){
            textMesh.updateText("Polymérisation de l’acide lactique : L’acide lactique purifié est ensuite soumis à un processus de polymérisation pour produire de l'acide polylactique (PLA).");
            text2Mesh.updateText('Ce processus, appelé polymérisation par ouverture de cycle, se fait en présence de catalyseurs comme le stannous octoate et à des températures élevées, autour de 150-200°C. Ce traitement permet de transformer l’acide lactique en granulés de PLA, un bioplastique solide et prêt à l’emploi');

          }
          else if (bobineMesh.visible){
            textMesh.updateText("Une fois le PLA sous forme de granulés, ceux-ci sont utilisés pour fabriquer des filaments d'impression 3D. Le PLA est chargé dans une extrudeuse de filament, où il est chauffé à environ 180-220°C pour le faire fondre. ");
            text2Mesh.updateText("Une fois fondu, il est extrudé en filament de diamètre standard (1,75 mm ou 2,85 mm), qui est ensuite refroidi dans un bain d’eau pour le solidifier. Ce filament peut alors être utilisé pour l'impression 3D de divers objets.");
            
          }
          else if (corsetMesh.visible){
            textMesh.updateText("Modélisation 3D du corset : Le design du corset est d'abord créé à l’aide du logiciel Rhino 3D, qui permet de réaliser une modélisation précise du produit final. Pour optimiser la conception et permettre une personnalisation facile, le logiciel Grasshopper est utilisé pour intégrer des ajustements paramétriques.");
            text2Mesh.updateText("Impression 3D : Une fois le modèle 3D du corset finalisé, le filament PLA est utilisé pour imprimer le corset à l'aide d'une imprimante 3D. Le processus d’impression 3D permet de créer un objet précis et fonctionnel en utilisant le PLA comme matériau d’impression.");

          }
          textMesh.visible = !textMesh.visible;
          text2Mesh.visible = !text2Mesh.visible;
          clicMesh.visible = !clicMesh.visible;
          
        };
            
    })

    if (bookIsInIntersects) {
        moveBookToCamera();
    }


});

renderer.render(scene, camera);


// Exemple d'intégration dans une animation manuelle
function render() {
    const time = performance.now() * 0.001; // Temps en secondes
    animateBook(time); // Appliquer l'animation du livre
    requestAnimationFrame(render); // Boucle
    animateBookToPosition();

    renderer.render(scene, camera); // Rendu de la scène
}


// Start animation
animate();
render();