import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export function horseLoader(containerId) {
    let scene, camera, renderer, controls, currentShape;
    let animationFrameId;
    let isRotationEnabled = true;

    function init() {
        // Scene
        scene = new THREE.Scene();
        // scene.background = new THREE.Color(0xf0f0f0);

        // Camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 1;

        // Renderer
        renderer = new THREE.WebGLRenderer( { alpha: true } );
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor( 0xC0C0C0, 0 ); 
        document.getElementById(containerId).appendChild(renderer.domElement);

        // OrbitControls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
        controls.zoomSpeed = 0.2;

        controls.rotateSpeed = 0.5;
        controls.minDistance = 0.5;
        controls.maxDistance = 2;

        controls.enablePan = true;
    

        // Light
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        scene.add(directionalLight);

        // Load the horse OBJ model
        loadObjModel('/obj/horse2.obj', switchToObjModel, handleModelError);

        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);

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
                        wireframe: false
                    });
                }
            });
            onLoad(obj);
        }, undefined, onError);
    }

    function handleModelError(error) {
        console.error('Error loading OBJ model:', error);
    }

    function switchToObjModel(obj) {
        if (currentShape) {
            scene.remove(currentShape);
            if (currentShape.geometry) currentShape.geometry.dispose();
            if (currentShape.material) currentShape.material.dispose();
        }

        currentShape = obj;
        scene.add(currentShape);

        // Center and scale the model
        const boundingBox = new THREE.Box3().setFromObject(obj);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxAxis = Math.max(size.x, size.y, size.z);
        obj.scale.multiplyScalar(1.0 / maxAxis);
        obj.position.sub(center.multiplyScalar(1.0 / maxAxis));

        camera.lookAt(center);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        if (currentShape && isRotationEnabled) {
            currentShape.rotation.y += 0.0025;
        }
        controls.update();
        renderer.render(scene, camera);
    }

    function dispose() {
        // Clean up resources
        window.removeEventListener('resize', onWindowResize);
        cancelAnimationFrame(animationFrameId);

        if (currentShape) {
            scene.remove(currentShape);
            if (currentShape.geometry) currentShape.geometry.dispose();
            if (currentShape.material) currentShape.material.dispose();
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
