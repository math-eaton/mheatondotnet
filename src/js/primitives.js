import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

export function modelLoader(containerId) {
    let scene, camera, renderer, controls, pivot;
    let animationFrameId;
    let gui;
    let guiParams = {
        // Background controls
        backgroundColor: '#C0C0C0',
        backgroundOpacity: 0.0,
        
        // Lighting controls
        ambientLightColor: '#404040',
        ambientLightIntensity: 1.0,
        directionalLightColor: '#ffffff',
        directionalLightIntensity: 5.0,
        directionalLightX: 1,
        directionalLightY: 1,
        directionalLightZ: 1,
        
        // Model controls
        originalModelColor: '#ff0000',
        originalModelOpacity: 1.0,
        originalModelWireframe: false,
        
        // Clone controls
        cloneModelColor: '#ffffff',
        cloneModelOpacity: 1.0,
        cloneModelWireframe: false,
        clonePositionX: 0.8,
        clonePositionY: 0.22,
        clonePositionZ: 0.55,
        cloneRotationX: -Math.PI / 3,
        cloneRotationY: -Math.PI,
        cloneRotationZ: -Math.PI / 3,
        
        // Animation controls
        enableRotation: true,
        pivotRotationSpeed: 0.0005,
        originalRotationSpeed: 0.0007,
        cloneRotationSpeed: -0.0005,
        cloneRotationSpeedX: -0.0005,
        
        // Blend mode controls
        originalBlendMode: 'MaxEquation',
        cloneBlendMode: 'AddEquation',
        
        // Model selection
        selectedModel: 'random',
        
        // Camera controls
        autoRotateCamera: false,
        cameraAutoRotateSpeed: 1.0,
        
        // Effects
        enableDepthTest: false,
        enableStencil: true,
        alphaTest: 0.5
    };

    const models = [
        { name: 'horse', url: '/obj/horse_d.obj', cameraPosition: { desktop: [-90, 0, 0], mobile: [-100, 5, 10000] } },
        { name: 'hand', url: '/obj/hand_d.obj', cameraPosition: { desktop: [-120, -50, 200], mobile: [-20, 15, 500] } },
        // { name: 'sword', url: '/obj/sword.obj', cameraPosition: { desktop: [-10, -5, 20], mobile: [1,-1,-10] } }
    ];

    let currentModel = null;
    let originalObject = null;
    let cloneObject = null;
    let ambientLight = null;
    let directionalLight = null;

    function getRandomModel() {
        return models[Math.floor(Math.random() * models.length)];
    }

    function createGUI() {
        gui = new GUI();
        
        // Position GUI in bottom right corner of viewport
        const guiWrapper = document.createElement('div');
        guiWrapper.id = 'gui-wrapper';
        guiWrapper.style.position = 'fixed';
        guiWrapper.style.bottom = '2vh';
        guiWrapper.style.right = '2vw';
        guiWrapper.style.zIndex = '10000';
        guiWrapper.style.display = 'none'; // Initially hidden
        guiWrapper.appendChild(gui.domElement);
        document.body.appendChild(guiWrapper);
        
        // Style the GUI
        gui.domElement.style.position = 'relative';
        gui.domElement.style.top = '0';
        gui.domElement.style.right = '0';
        
        // Make GUI responsive for mobile
        const isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;
        if (isMobile) {
            gui.domElement.style.transform = 'scale(0.7)';
            gui.domElement.style.transformOrigin = 'bottom right';
        }

        // Background controls
        const backgroundFolder = gui.addFolder('Background');
        backgroundFolder.addColor(guiParams, 'backgroundColor').onChange(updateBackground);
        backgroundFolder.add(guiParams, 'backgroundOpacity', 0, 1, 0.1).onChange(updateBackground);

        // Lighting controls
        const lightingFolder = gui.addFolder('Lighting');
        lightingFolder.addColor(guiParams, 'ambientLightColor').onChange(updateLighting);
        lightingFolder.add(guiParams, 'ambientLightIntensity', 0, 5, 0.1).onChange(updateLighting);
        lightingFolder.addColor(guiParams, 'directionalLightColor').onChange(updateLighting);
        lightingFolder.add(guiParams, 'directionalLightIntensity', 0, 10, 0.1).onChange(updateLighting);
        lightingFolder.add(guiParams, 'directionalLightX', -5, 5, 0.1).onChange(updateLighting);
        lightingFolder.add(guiParams, 'directionalLightY', -5, 5, 0.1).onChange(updateLighting);
        lightingFolder.add(guiParams, 'directionalLightZ', -5, 5, 0.1).onChange(updateLighting);

        // Original model controls
        const originalFolder = gui.addFolder('Original Model');
        originalFolder.addColor(guiParams, 'originalModelColor').onChange(updateMaterials);
        originalFolder.add(guiParams, 'originalModelOpacity', 0, 1, 0.1).onChange(updateMaterials);
        originalFolder.add(guiParams, 'originalModelWireframe').onChange(updateMaterials);

        // Clone model controls
        const cloneFolder = gui.addFolder('Clone Model');
        cloneFolder.addColor(guiParams, 'cloneModelColor').onChange(updateMaterials);
        cloneFolder.add(guiParams, 'cloneModelOpacity', 0, 1, 0.1).onChange(updateMaterials);
        cloneFolder.add(guiParams, 'cloneModelWireframe').onChange(updateMaterials);
        
        // Clone position controls
        const clonePositionFolder = cloneFolder.addFolder('Position');
        clonePositionFolder.add(guiParams, 'clonePositionX', -2, 2, 0.01).onChange(updateCloneTransform);
        clonePositionFolder.add(guiParams, 'clonePositionY', -2, 2, 0.01).onChange(updateCloneTransform);
        clonePositionFolder.add(guiParams, 'clonePositionZ', -2, 2, 0.01).onChange(updateCloneTransform);
        
        // Clone rotation controls
        const cloneRotationFolder = cloneFolder.addFolder('Rotation');
        cloneRotationFolder.add(guiParams, 'cloneRotationX', -Math.PI, Math.PI, 0.01).onChange(updateCloneTransform);
        cloneRotationFolder.add(guiParams, 'cloneRotationY', -Math.PI, Math.PI, 0.01).onChange(updateCloneTransform);
        cloneRotationFolder.add(guiParams, 'cloneRotationZ', -Math.PI, Math.PI, 0.01).onChange(updateCloneTransform);

        // Animation controls
        const animationFolder = gui.addFolder('Animation');
        animationFolder.add(guiParams, 'enableRotation').name('Enable Rotation');
        animationFolder.add(guiParams, 'pivotRotationSpeed', -0.01, 0.01, 0.0001).name('Pivot Speed');
        animationFolder.add(guiParams, 'originalRotationSpeed', -0.01, 0.01, 0.0001).name('Original Speed');
        animationFolder.add(guiParams, 'cloneRotationSpeed', -0.01, 0.01, 0.0001).name('Clone Speed Y');
        animationFolder.add(guiParams, 'cloneRotationSpeedX', -0.01, 0.01, 0.0001).name('Clone Speed X');

        // Camera controls
        const cameraFolder = gui.addFolder('Camera');
        cameraFolder.add(guiParams, 'autoRotateCamera').onChange(updateCameraControls);
        cameraFolder.add(guiParams, 'cameraAutoRotateSpeed', 0.1, 5, 0.1).onChange(updateCameraControls);

        // Blend mode controls
        const blendFolder = gui.addFolder('Blend Modes');
        const blendModes = ['NormalBlending', 'AddEquation', 'SubtractEquation', 'MaxEquation', 'MinEquation'];
        blendFolder.add(guiParams, 'originalBlendMode', blendModes).onChange(updateMaterials);
        blendFolder.add(guiParams, 'cloneBlendMode', blendModes).onChange(updateMaterials);

        // Effects controls
        const effectsFolder = gui.addFolder('Effects');
        effectsFolder.add(guiParams, 'enableDepthTest').onChange(updateMaterials);
        effectsFolder.add(guiParams, 'enableStencil').onChange(updateMaterials);
        effectsFolder.add(guiParams, 'alphaTest', 0, 1, 0.1).onChange(updateMaterials);

        // Model selection
        const modelFolder = gui.addFolder('Model Selection');
        const modelNames = ['random', ...models.map(m => m.name)];
        modelFolder.add(guiParams, 'selectedModel', modelNames).onChange(loadSelectedModel);

        // Actions
        const actionsFolder = gui.addFolder('Actions');
        actionsFolder.add({ resetCamera: resetCamera }, 'resetCamera').name('Reset Camera');
        actionsFolder.add({ loadRandomModel: loadRandomModel }, 'loadRandomModel').name('Load Random Model');
        actionsFolder.add({ toggleGUI: toggleGUI }, 'toggleGUI').name('Hide/Show GUI');

        // Close some folders by default to save space
        backgroundFolder.close();
        lightingFolder.close();
        clonePositionFolder.close();
        cloneRotationFolder.close();
        blendFolder.close();
        effectsFolder.close();
        modelFolder.close();
        actionsFolder.close();
    }

    function updateBackground() {
        renderer.setClearColor(guiParams.backgroundColor, guiParams.backgroundOpacity);
    }

    function updateLighting() {
        if (ambientLight) {
            ambientLight.color.setHex(guiParams.ambientLightColor.replace('#', '0x'));
            ambientLight.intensity = guiParams.ambientLightIntensity;
        }
        
        if (directionalLight) {
            directionalLight.color.setHex(guiParams.directionalLightColor.replace('#', '0x'));
            directionalLight.intensity = guiParams.directionalLightIntensity;
            directionalLight.position.set(
                guiParams.directionalLightX,
                guiParams.directionalLightY,
                guiParams.directionalLightZ
            ).normalize();
        }
    }

    function updateMaterials() {
        if (originalObject) {
            originalObject.traverse(function (child) {
                if (child.isMesh) {
                    child.material.color.setHex(guiParams.originalModelColor.replace('#', '0x'));
                    child.material.opacity = guiParams.originalModelOpacity;
                    child.material.transparent = guiParams.originalModelOpacity < 1;
                    child.material.wireframe = guiParams.originalModelWireframe;
                    child.material.depthTest = guiParams.enableDepthTest;
                    child.material.depthWrite = !guiParams.enableDepthTest;
                    child.material.stencilWrite = guiParams.enableStencil;
                    child.material.alphaTest = guiParams.alphaTest;
                    
                    // Update blend mode
                    const blendEquations = {
                        'NormalBlending': THREE.NormalBlending,
                        'AddEquation': THREE.AddEquation,
                        'SubtractEquation': THREE.SubtractEquation,
                        'MaxEquation': THREE.MaxEquation,
                        'MinEquation': THREE.MinEquation
                    };
                    
                    if (guiParams.originalBlendMode !== 'NormalBlending') {
                        child.material.blending = THREE.CustomBlending;
                        child.material.blendEquation = blendEquations[guiParams.originalBlendMode];
                        child.material.blendSrc = THREE.OneMinusSrcColorFactor;
                        child.material.blendDst = THREE.OneMinusConstantColorFactor;
                    } else {
                        child.material.blending = THREE.NormalBlending;
                    }
                    
                    if (guiParams.enableStencil) {
                        child.material.stencilZPass = THREE.InvertStencilOp;
                    }
                }
            });
        }

        if (cloneObject) {
            cloneObject.traverse(function (child) {
                if (child.isMesh) {
                    child.material.color.setHex(guiParams.cloneModelColor.replace('#', '0x'));
                    child.material.opacity = guiParams.cloneModelOpacity;
                    child.material.transparent = guiParams.cloneModelOpacity < 1;
                    child.material.wireframe = guiParams.cloneModelWireframe;
                    child.material.depthTest = guiParams.enableDepthTest;
                    child.material.alphaTest = guiParams.alphaTest;
                    
                    // Update blend mode
                    const blendEquations = {
                        'NormalBlending': THREE.NormalBlending,
                        'AddEquation': THREE.AddEquation,
                        'SubtractEquation': THREE.SubtractEquation,
                        'MaxEquation': THREE.MaxEquation,
                        'MinEquation': THREE.MinEquation
                    };
                    
                    if (guiParams.cloneBlendMode !== 'NormalBlending') {
                        child.material.blending = THREE.CustomBlending;
                        child.material.blendEquation = blendEquations[guiParams.cloneBlendMode];
                        child.material.blendSrc = THREE.OneFactor;
                        child.material.blendDst = THREE.OneFactor;
                    } else {
                        child.material.blending = THREE.NormalBlending;
                    }
                    
                    if (guiParams.enableStencil) {
                        child.material.stencilFunc = THREE.EqualStencilFunc;
                        child.material.stencilRef = 0;
                    }
                }
            });
        }
    }

    function updateCloneTransform() {
        if (cloneObject) {
            cloneObject.position.set(
                guiParams.clonePositionX,
                guiParams.clonePositionY,
                guiParams.clonePositionZ
            );
            cloneObject.rotation.set(
                guiParams.cloneRotationX,
                guiParams.cloneRotationY,
                guiParams.cloneRotationZ
            );
        }
    }

    function updateCameraControls() {
        if (controls) {
            controls.autoRotate = guiParams.autoRotateCamera;
            controls.autoRotateSpeed = guiParams.cameraAutoRotateSpeed;
        }
    }

    function loadSelectedModel() {
        if (guiParams.selectedModel === 'random') {
            loadRandomModel();
        } else {
            const selectedModel = models.find(m => m.name === guiParams.selectedModel);
            if (selectedModel) {
                loadObjModel(selectedModel.url, obj => switchToObjModel(obj, selectedModel.cameraPosition, selectedModel.name), handleModelError);
            }
        }
    }

    function loadRandomModel() {
        const model = getRandomModel();
        console.log('Loading model:', model.name);
        loadObjModel(model.url, obj => switchToObjModel(obj, model.cameraPosition, model.name), handleModelError);
    }

    function resetCamera() {
        if (currentModel && camera) {
            const isMobile = Math.min(window.innerWidth, window.innerHeight) < 600;
            const position = isMobile ? currentModel.cameraPosition.mobile : currentModel.cameraPosition.desktop;
            camera.position.set(...position);
            controls.reset();
        }
    }

    function toggleGUI() {
        const guiWrapper = document.getElementById('gui-wrapper');
        if (guiWrapper) {
            if (guiWrapper.style.display === 'none' || guiWrapper.style.display === '') {
                guiWrapper.style.display = 'block';
            } else {
                guiWrapper.style.display = 'none';
            }
        }
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
        renderer.setClearColor(guiParams.backgroundColor, guiParams.backgroundOpacity);
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

        // Lighting
        ambientLight = new THREE.AmbientLight(guiParams.ambientLightColor, guiParams.ambientLightIntensity);
        scene.add(ambientLight);

        directionalLight = new THREE.DirectionalLight(guiParams.directionalLightColor, guiParams.directionalLightIntensity);
        directionalLight.position.set(
            guiParams.directionalLightX,
            guiParams.directionalLightY,
            guiParams.directionalLightZ
        ).normalize();
        scene.add(directionalLight);

        // Create a pivot group
        pivot = new THREE.Group();
        scene.add(pivot);

        // Create GUI
        createGUI();

        // Load initial model
        loadRandomModel();

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
                        color: guiParams.originalModelColor,
                        wireframe: guiParams.originalModelWireframe,
                        depthWrite: !guiParams.enableDepthTest,
                        stencilWrite: guiParams.enableStencil,
                        stencilZPass: THREE.InvertStencilOp,
                        alphaTest: guiParams.alphaTest,                
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
        // Store current model info
        currentModel = models.find(m => m.name === name);
        
        // Clear existing shapes
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

        // Store reference to original object
        originalObject = obj;

        // Clone the object
        const clone = obj.clone();
        cloneObject = clone;

        // Set clone position based on model name with default values
        if (name === "horse") {
            guiParams.clonePositionX = 0.8;
            guiParams.clonePositionY = 0.22;
            guiParams.clonePositionZ = 0.55;
            guiParams.cloneRotationX = Math.PI / -3;
            guiParams.cloneRotationY = Math.PI / -1;
            guiParams.cloneRotationZ = Math.PI / -3;
        } else if (name === "hand") {
            guiParams.clonePositionX = 0.3;
            guiParams.clonePositionY = -0.02;
            guiParams.clonePositionZ = -0.05;
            guiParams.cloneRotationX = Math.PI / 9;
            guiParams.cloneRotationY = Math.PI / 4;
            guiParams.cloneRotationZ = Math.PI / 5;
        } else if (name === "sword") {
            guiParams.clonePositionX = 0.1;
            guiParams.clonePositionY = -0.15;
            guiParams.clonePositionZ = -0.1;
            guiParams.cloneRotationX = Math.PI / -1;
            guiParams.cloneRotationY = Math.PI / 4;
            guiParams.cloneRotationZ = Math.PI / -3;
        }

        // Apply clone position and rotation
        updateCloneTransform();

        // Apply materials to clone
        clone.traverse(function (child) {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: guiParams.cloneModelColor,
                    wireframe: guiParams.cloneModelWireframe,
                    depthTest: guiParams.enableDepthTest,
                    stencilWrite: guiParams.enableStencil,
                    alphaTest: guiParams.alphaTest,
                    stencilFunc: THREE.EqualStencilFunc,
                    stencilRef: 0,                
                    blending: THREE.CustomBlending,
                    blendEquation: THREE.AddEquation,
                    blendSrc: THREE.OneFactor,
                    blendDst: THREE.OneFactor
                });
            }
        });

        // Add objects to scene
        pivot.add(originalObject);
        pivot.add(cloneObject);

        // Update materials to reflect current GUI settings
        updateMaterials();

        // Set camera position
        camera.lookAt(center);
        let isMobile = Math.min(window.innerWidth, window.innerHeight) < 600;
        const position = isMobile ? cameraPosition.mobile : cameraPosition.desktop;
        camera.position.set(...position);

        // Update GUI controllers to reflect new values
        if (gui) {
            gui.controllersRecursive().forEach(controller => {
                controller.updateDisplay();
            });
        }
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Adjust GUI for mobile on resize
        const isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;
        if (gui) {
            if (isMobile) {
                gui.domElement.style.transform = 'scale(0.7)';
                gui.domElement.style.transformOrigin = 'bottom right';
            } else {
                gui.domElement.style.transform = 'scale(1)';
                gui.domElement.style.transformOrigin = 'bottom right';
            }
        }
    }

    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        if (guiParams.enableRotation && pivot && pivot.children.length > 0) {
            // Rotate pivot
            pivot.rotation.y += guiParams.pivotRotationSpeed;
            
            // Rotate original object
            if (originalObject) {
                originalObject.rotation.y += guiParams.originalRotationSpeed;
            }
            
            // Rotate clone object
            if (cloneObject) {
                cloneObject.rotation.y += guiParams.cloneRotationSpeed;
                cloneObject.rotation.x += guiParams.cloneRotationSpeedX;
            }
        }
        
        controls.update();
        renderer.render(scene, camera);
    }

    function dispose() {
        // Clean up GUI
        if (gui) {
            gui.destroy();
        }
        
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
        if (event.key === 'R' || event.key === 'r') {
            guiParams.enableRotation = !guiParams.enableRotation;
            // Update GUI display
            if (gui) {
                gui.controllersRecursive().forEach(controller => {
                    if (controller.property === 'enableRotation') {
                        controller.updateDisplay();
                    }
                });
            }
        }
        // Toggle GUI with 'G' key
        if (event.key === 'G' || event.key === 'g') {
            toggleGUI();
        }
        // Load random model with 'M' key
        if (event.key === 'M' || event.key === 'm') {
            loadRandomModel();
        }
    });

    // Initialize and start the animation
    init();

    // Return an object with all functions you want to expose
    return {
        dispose,
        gui: gui,
        loadRandomModel,
        resetCamera,
        toggleGUI
    };
}
