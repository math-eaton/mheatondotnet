import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export function modelLoader(containerId) {
    let scene, camera, renderer, controls, pivot;
    let animationFrameId;
    let isRotationEnabled = true;

    const models = [
        { name: 'horse', url: '/obj/horse_d.obj', cameraPosition: { desktop: [-90, 0, 0], mobile: [-100, 5, 10000] } },
        { name: 'hand', url: '/obj/hand_d.obj', cameraPosition: { desktop: [-120, -50, 200], mobile: [-20, 15, 500] } },
        // { name: 'sword', url: '/obj/sword.obj', cameraPosition: { desktop: [-10, -5, 20], mobile: [1,-1,-10] } }

    ];

    function getRandomModel() {
        return models[Math.floor(Math.random() * models.length)];
    }

    function init() {
        // Scene
        scene = new THREE.Scene();
        let isMobile = Math.min(window.innerWidth, window.innerHeight) < 600;

        // Camera
        if (isMobile) {
            camera = new THREE.PerspectiveCamera(24, (window.innerWidth / window.innerHeight) * 2, 0.1, 1000);
        } else {
            camera = new THREE.PerspectiveCamera(18, (window.innerWidth / window.innerHeight) / 2, 0.1, 1000);
        }

        // Renderer
        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xC0C0C0, 0);
        document.getElementById(containerId).appendChild(renderer.domElement);

        // OrbitControls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
        controls.zoomSpeed = 0.2;
        controls.rotateSpeed = 0.5;
        controls.minDistance = 0.5;
        controls.maxDistance = 4.5;
        controls.enablePan = false;

        // Light
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
        directionalLight.position.set(1, 1, 1).normalize();
        scene.add(directionalLight);

        // Create a pivot group
        pivot = new THREE.Group();
        scene.add(pivot);

        // Load a random model
        const model = getRandomModel();
        console.log(model.name)
        loadObjModel(model.url, obj => switchToObjModel(obj, model.cameraPosition, model.name), handleModelError);

        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);

        onWindowResize();

        // Animation loop
        animate();
    }

    function loadObjModel(url, onLoad, onError) {
        const loader = new OBJLoader();
        loader.load(url, obj => {
            obj.traverse(function (child) {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xff0000,
                        // wireframe: true,
                        depthWrite: false,
                        stencilWrite: true,
                        stencilZPass: THREE.InvertStencilOp,
                        alphaTest: 0.5,                
                        blending: THREE.CustomBlending,
                        blendEquation: THREE.MaxEquation,
                        blendSrc: THREE.OneMinusSrcColorFactor,
                        blendDst: THREE.OneMinusConstantColorFactor
                        
                    });
                }
            });
            onLoad(obj);
        }, undefined, onError);
    }

    function handleModelError(error) {
        console.error('Error loading OBJ model:', error);
    }

    function switchToObjModel(obj, cameraPosition, name) {
        // Clear existing shape
        while (pivot.children.length) {
            const child = pivot.children[0];
            pivot.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }

        // Center and scale the original model
        const boundingBox = new THREE.Box3().setFromObject(obj);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxAxis = Math.max(size.x, size.y, size.z);
        obj.scale.multiplyScalar(1.0 / maxAxis);
        obj.position.sub(center.multiplyScalar(1.0 / maxAxis));

        // Clone the object
        const clone = obj.clone();

        // Position the clone slightly offset from the original
        if (name == "horse"){
            clone.position.set(0.8, 0.22, 0.55);
            clone.rotation.x = Math.PI / -3;
            clone.rotation.y = Math.PI / -1;
            clone.rotation.z = Math.PI / -3;    

        }
        else if (name == "hand"){
            clone.position.set(0.3, -0.02, -0.05);
            clone.rotation.x = Math.PI / 9;
            clone.rotation.y = Math.PI / 4;
            clone.rotation.z = Math.PI / 5;    
        }
        else if (name == "sword"){
            clone.position.set(0.1, -0.15, -0.1);
            clone.rotation.x = Math.PI / -1;
            clone.rotation.y = Math.PI / 4;
            clone.rotation.z = Math.PI / -3;    
        }



        // Apply the same blending mode to the clone
        clone.traverse(function (child) {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    wireframe: false,
                    depthTest: false,
                    stencilWrite: true,
                    alphaTest: 0.5,
                    stencilFunc: THREE.EqualStencilFunc,
                    stencilRef: 0,                
                    blending: THREE.CustomBlending,
                    blendEquation: THREE.AddEquation,
                    blendSrc: THREE.OneFactor,
                    blendDst: THREE.OneFactor
                });
            }
        });

        pivot.add(obj);
        pivot.add(clone);

        camera.lookAt(center);

        let isMobile = Math.min(window.innerWidth, window.innerHeight) < 600;
        const position = isMobile ? cameraPosition.mobile : cameraPosition.desktop;

        camera.position.set(...position);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        if (isRotationEnabled) {
            pivot.rotation.y += 0.0005;
            if (pivot.children.length > 0) {
                pivot.children[0].rotation.y += 0.0007; // Rotate the original object
                pivot.children[1].rotation.y -= 0.0005; // Rotate the clone object in the opposite direction
                // pivot.children[0].rotation.x += 0.0008; // og
                pivot.children[1].rotation.x -= 0.0005;  // clone
            }
        }
        controls.update();
        renderer.render(scene, camera);
    }

    function dispose() {
        // Clean up resources
        window.removeEventListener('resize', onWindowResize);
        cancelAnimationFrame(animationFrameId);

        while (pivot.children.length) {
            const child = pivot.children[0];
            pivot.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }

        // Clear the container
        const container = document.getElementById(containerId);
        if (container && renderer.domElement) {
            container.removeChild(renderer.domElement);
        }
    }

    // Event listener for toggling rotation
    window.addEventListener('keydown', (event) => {
        if (event.key === 'R' || event.key === 'r') { // 'R' key toggles rotation
            isRotationEnabled = !isRotationEnabled;
        }
    });

    // Initialize and start the animation
    init();

    // Return an object with all functions you want to expose
    return {
        dispose
    };
}
