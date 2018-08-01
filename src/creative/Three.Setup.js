/*global THREE Quad Stats*/

import {EventEmitter} from 'events';
import TweenMax from 'gsap';
var screenWidth, screenHeight, scene, renderer, camera, controls, stats, gridHelper;
var arr_materials = [];
var obj_materials = [];
var objects = {};
var sky, sunSphere;
var controlsActive;

class ThreeSetup extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.init()
    }
    setControlsActive(b) {
        controlsActive = b;
    }
    init() {
        /**
         * Setup Three.js scene
         * @type {Element}
         */
        let container = document.querySelector( '.experience' );
        screenWidth = document.documentElement.clientWidth;
        screenHeight = document.documentElement.clientHeight;
        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setPixelRatio( 2 );
        renderer.setSize( screenWidth, screenHeight );
        renderer.sortObjects = false;
        container.appendChild( renderer.domElement );
        camera = new THREE.PerspectiveCamera( 60, screenWidth / screenHeight, 1, 25000 );

        if (!this.config.gyro) {
            console.log('no gyro');
            controls = new THREE.OrbitControls( camera, renderer.domElement );
            controls.enableZoom = true;
            camera.position.z = 0;
            camera.position.y = 700;
            camera.position.z = 1;
            camera.lookAt(new THREE.Vector3());
            controls.update();
        } else {
            controls = new THREE.DeviceOrientationControls( camera );
            var initialPosition = new THREE.Vector3(0, 1300, 0);
            camera.position.copy(initialPosition);
            controls.update();
        }
        let size = 20000;
        let divisions = 50;
        gridHelper = new THREE.GridHelper( size, divisions, 0xaaaaaa, 0xaaaaaa );
        // scene.add( gridHelper );
        gridHelper.position.y = -300;
        gridHelper.position.x = 5;

        /**
         * Lights
         */
        var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.5 );
        scene.add( ambientLight );

        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
        directionalLight.position.set( 1, 10, 0 ).normalize();
        scene.add( directionalLight );
        //controlsActive = true;
        // this.animate();
    }
    hideGrid() {
        scene.remove( gridHelper );
    }
    // this is called from Visualisation
    animate() {
        if (controlsActive) {
            // console.log('update control');
            controls.update();
        }
        // console.log('', camera.position);
        renderer.render( scene, camera );
        /**
         * update canvastextures
         */
        for (let i=0; i<arr_materials.length; i++) {
            arr_materials[i]['mat'].map.needsUpdate = true
        }
    }
    getScene() {
        return scene;
    }
    getCamera() {
        return camera;
    }
    getCrate() {
        var geometry = new THREE.BoxGeometry( 0, 0, 0 );
        var material = new THREE.MeshPhongMaterial( { depthWrite: true, map: THREE.ImageUtils.loadTexture(require('../img/crate.jpg')) } );
        var object = new THREE.Mesh( geometry, material );
        object.castShadow = true;
        object.receiveShadow = true;
        object.position.x = 0;
        object.position.y = 0;
        object.position.z = 0;
        objects['crate'] = object;
        return object;
    }
    getStats() {
        stats = new Stats();
        // document.body.appendChild(stats.domElement);
        return stats;
    }
    getAnimatedSprite(canvas, id) {
        let crateTexture = new THREE.Texture(canvas);
        let crateMaterial = new THREE.SpriteMaterial( { map: crateTexture, useScreenCoordinates: false } );
        let obj = new THREE.Sprite( crateMaterial );
        obj_materials[id] = crateMaterial;
        objects[id] = obj;
        arr_materials.push({mat: crateMaterial, canv: canvas});
        return obj;
    }
    getObject(id) {
        return objects[id];
    }
    getRenderer() {
        return renderer;
    }
    hideObject(id) {
        arr_materials[arr_materials.length-1].mat.opacity = 1;
        objects[id].material = arr_materials[arr_materials.length-1].mat;
        TweenMax.to(objects[id].material, 1, {delay: 0.3, opacity: 0, ease: Quad.easeIn, onComplete: ()=> {
            // console.log('', obj_materials);
                setTimeout(()=> {
                    objects[id].material = obj_materials[id]
                }, 200);
            }});
    }
    noCamera() {
        this.skyBox();
        scene.add(gridHelper);

    }
    skyBox() {
        /**
         * Config
         * https://threejs.org/examples/#webgl_shaders_sky
         * @type {THREE.Sky}
         */
        // Add Sky
            sky = new THREE.Sky();
            sky.scale.setScalar( 450000 );
            scene.add( sky );

            // Add Sun Helper
            sunSphere = new THREE.Mesh(
                new THREE.SphereBufferGeometry( 21000, 16, 8 ),
                new THREE.MeshBasicMaterial( { color: 0xffffff } )
            );
            sunSphere.position.y = - 700000;
            sunSphere.visible = false;
            scene.add( sunSphere );

            /// GUI

            var effectController  = {
                turbidity: 1,
                rayleigh: 0.729,
                mieCoefficient: 0.012,
                mieDirectionalG: 0.442,
                luminance: 0.1,
                inclination: 0.6699, // elevation / inclination
                azimuth: 0.6374, // Facing front,
                sun: ! true
            };

            var distance = 400000;

            function guiChanged() {

                var uniforms = sky.material.uniforms;
                uniforms.turbidity.value = effectController.turbidity;
                uniforms.rayleigh.value = effectController.rayleigh;
                uniforms.luminance.value = effectController.luminance;
                uniforms.mieCoefficient.value = effectController.mieCoefficient;
                uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

                var theta = Math.PI * ( effectController.inclination - 0.5 );
                var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

                sunSphere.position.x = distance * Math.cos( phi );
                sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
                sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

                sunSphere.visible = effectController.sun;

                uniforms.sunPosition.value.copy( sunSphere.position );

                renderer.render( scene, camera );

            }
            guiChanged();
        }


}

export default ThreeSetup;