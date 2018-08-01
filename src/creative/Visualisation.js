/*global Hammer TweenMax THREE Back Quad Linear Elastic trackMe $ */

import {EventEmitter} from 'events';
import ThreeSetup from './Three.Setup';
import Sprites from "./Sprites";
import * as $ from "jquery";
import { trackMe, tracked_events } from "./Tracking";

let three, sprites, paused;
let scene, object, stats, camera, renderer;
let INTERSECTED, raycaster, mouse, frustrum, cameraViewProjectionMatrix, intersect_timeout, hiding;
let groups;
let count = 0;
let hiya, hiya_timeout, end_timeout, auto_timeout, animating;
let auto_timeout_duration = 15000;
let hiya_timeout_duration = 2000;
let radius_pug = 3000;
let multiples = 4;
let saved_position;
let cameraEnabled;
let notifications = {
  intro: 'Look around to find Puggerfly.',
  selfie: 'Selfie time!'
};
let arr_assets = [
    {json: 'anim/rainbow.json', id: 'rainbow'},
    {json: 'anim/kiss.json', id: 'kiss'},
    {json: 'anim/peeing_pug.json', id: 'peeing_pug'},
    {json: 'anim/dance.json', id: 'dance'},
    {json: 'anim/butt_notype.json', id: 'butt_notype'},
    {json: 'anim/skipping.json', id: 'skipping'},
    {json: 'anim/star.json', id: 'star'},
    {json: 'anim/star.json', id: 'star2'},
    {json: 'anim/butt.json', id: 'butt'},
    {json: 'anim/twerk_small.json', id: 'twerk'}
];
let arr_images = [
    {img: require('../img/heart-blue.png'), id: 'heart-blue'},
    {img: require('../img/heart-red.png'), id: 'heart-red'},
    {img: require('../img/heart-yellow.png'), id: 'heart-yellow'},
    {img: require('../img/heart-green.png'), id: 'heart-green'},
    {img: require('../img/heart-purple.png'), id: 'heart-purple'}
];


let scene_sprites;
class Experience extends EventEmitter {

    constructor(config) {
        super();
        this.config = config;
        this.init()
    }
    start(camera_enabled) {
        this.showNotification(notifications.intro, 1);
        if (!camera_enabled) {
            three.noCamera();
            cameraEnabled = false;
        } else {
            cameraEnabled = true;
        }
        console.log('START');
        three.setControlsActive(true);
    }
    enableAutoTimeout() {
        console.log('enable autotimeout');
        let self = this;
        clearTimeout(auto_timeout);
        auto_timeout = setTimeout(()=> {
            self.endTimeout();
        }, auto_timeout_duration);
    }
    init() {
        three = new ThreeSetup(this.config);
        scene = three.getScene();
        object = three.getCrate();
        stats = three.getStats();
        camera = three.getCamera();
        renderer = three.getRenderer();

        scene.add(object);

        // on-screen stuff
        mouse = new THREE.Vector2();
        raycaster = new THREE.Raycaster();
        frustrum = new THREE.Frustum();
        cameraViewProjectionMatrix = new THREE.Matrix4();

        this.createSprites();
    }
    createSprites() {
        sprites = new Sprites();
        sprites.initPixi();
        sprites.loadSprites(arr_assets).then(() => {
            this.addSprites();
            this.animate();
        });
    }
    addSprites() {
        /**
         * These are the animated sprites
         */
        scene_sprites = [];
        // create a sprite

        let scene_max = [
            {id: 'rainbow1', canvas: 'rainbow'},
            {id: 'rainbow2', canvas: 'rainbow'},
            {id: 'rainbow3', canvas: 'rainbow'},
            {id: 'rainbow4', canvas: 'rainbow'},
            {id: 'kiss1', canvas: 'kiss'},
            {id: 'kiss2', canvas: 'kiss'},
            {id: 'kiss3', canvas: 'kiss'},
            {id: 'kiss4', canvas: 'kiss'},
            {id: 'peeing_pug1', canvas: 'peeing_pug'},
            {id: 'peeing_pug2', canvas: 'peeing_pug'},
            {id: 'peeing_pug3', canvas: 'peeing_pug'},
            {id: 'dance1', canvas: 'dance'},
            {id: 'dance2', canvas: 'dance'},
            {id: 'dance3', canvas: 'dance'},
            {id: 'dance4', canvas: 'dance'},
            {id: 'butt_notype1', canvas: 'butt_notype'},
            {id: 'butt_notype2', canvas: 'butt_notype'},
            {id: 'butt1', canvas: 'butt'},
            {id: 'butt2', canvas: 'butt'},
            {id: 'skipping1', canvas: 'skipping'},
            {id: 'twerk1', canvas: 'twerk'},
            {id: 'star', canvas: 'star'},
        ];
        groups = [];
        for (let i=0; i<scene_max.length; i++) {
            let s = three.getAnimatedSprite(sprites.getCanvas(scene_max[i].canvas), scene_max[i].id);
            scene_sprites.push({sprite: s, id: scene_max[i].id, canvas: scene_max[i].canvas});

            let angle = Math.random()*Math.PI*2;
            let radius = (Math.random() * 2000) + 3000;
            let xpos = Math.cos(angle) *radius;
            let zpos = Math.sin(angle)*radius;

            let zpos_pug = Math.sin(angle)*radius_pug;
            let xpos_pug = Math.cos(angle)*radius_pug;
            let group = new THREE.Object3D();
            group.add(s);
            scene.add(group);

            groups.push({canvas: scene_max[i].canvas, group: group, id: scene_max[i].id, spr: s, disappear: 10 + (Math.floor(Math.random() * 200))});
            s.scale.set(800, 800, 1.0);

            switch (scene_max[i].id) {
                case 'skipping1':
                    group.rotationspeed = 0.002;
                    s.position.set(xpos, 0,  zpos);
                case 'skipping2':
                    group.rotationspeed = 0.002;
                    s.position.set(xpos, 0,  zpos);
                    break;
                case 'skipping3':
                    group.rotationspeed = 0.002;
                    s.position.set(xpos, 0,  zpos);
                    break;
                case 'rainbow1':
                    group.rotationspeed = 0.01;
                    s.position.set(0, 3000,  0);
                    break;
                case 'peeing_pug1':
                    group.rotationspeed = 0.002;
                    s.position.set(0, 3000,  0);
                    break;
                case 'twerk1':
                    group.rotationspeed = 0;
                    s.position.set(xpos_pug, 0,  zpos_pug);
                    break;
                case 'star':
                    scene.remove(s);
                    break;
                default:
                    group.rotationspeed = 0.001;
                    s.position.set(xpos, Math.random() * 3000,  zpos);
            }

        }

        for (let i=0; i<20; i++) {
            for (let i = 0; i < arr_images.length; i++) {
                let imgTexture = THREE.ImageUtils.loadTexture( arr_images[i]['img']);
                let imgMaterial = new THREE.SpriteMaterial({map: imgTexture, useScreenCoordinates: true});
                let sprite = new THREE.Sprite(imgMaterial);
                let angle = Math.random() * Math.PI * 2;
                let radius = (Math.random() * 5000) + 3000;
                let xpos = Math.cos(angle) * radius;
                let zpos = Math.sin(angle) * radius;
                sprite.position.set(xpos, Math.random() * 4000, zpos);
                sprite.scale.set(128, 128, 1.0);
                let group = new THREE.Object3D();
                group.add(sprite);
                scene.add(group);

                group.rotationspeed = Math.random() > 0.5 ? 0.003 : -0.003;
                groups[arr_images[i].id] = group;
            }
        }
        let imgTexture = THREE.ImageUtils.loadTexture(require('../img/hiya.png'));
        let imgMaterial = new THREE.SpriteMaterial({map: imgTexture, useScreenCoordinates: true});
        hiya = new THREE.Sprite(imgMaterial);
        scene.add(hiya);
        hiya.scale.set(2560, 2560, 1.0);
    }
    /*putOverPug(obj) {
        var pos =  three.getObject('twerk1').position;
        TweenMax.to(obj.position, 0.5, {x: pos.x, y:pos.y+100, z:pos.z, ease:Elastic.easeOut})
    }*/
    putOverPug(obj) {
        let vec = new THREE.Vector3( 0, camera.position.y, -700 );
        vec.applyQuaternion( camera.quaternion );
        console.log('', vec);
        let pos =  three.getObject('twerk1').position;
        TweenMax.set(obj.position, {x: 0, y:vec.y, z:0, ease:Elastic.easeOut})
        TweenMax.to(obj.position, 0.5, {x: pos.x, y:camera.position.y+100, z:pos.z, ease:Elastic.easeOut});
        TweenMax.to(obj.position, 1, {y:camera.position.y+70, yoyo:true, repeat: -1, ease:Quad.easeInOut});
        TweenMax.to(obj.material, 0.2, {opacity: 1});
    }
    putInFrontOfCamera(obj) {
        var vec = new THREE.Vector3( 0, camera.position.y, -700 );
        vec.applyQuaternion( camera.quaternion );
        console.log('', vec);
        TweenMax.set(obj.position, {x: 0, y:vec.y, z:0, ease:Elastic.easeOut})
        TweenMax.to(obj.position, 0.5, {x: vec.x, y:vec.y, z:vec.z, ease:Elastic.easeOut});
        TweenMax.to(obj.position, 2, {y:camera.position.y-40, yoyo:true, repeat: -1, ease:Elastic.easeOut});
        // obj.scale.set(obj.scale.x /2 , obj.scale.y /2, obj.scale.z /2);
    }
    hideHiya(obj) {
        TweenMax.to(obj.position, 0.2, {x: 0, y:camera.position.y+140, z:0, ease:Quad.easeIn});
        TweenMax.to(obj.material, 0.2, {opacity: 0});
    }
    getPosition() {
        let angle = Math.random()*Math.PI*2;
        let radius = (Math.random() * 3000) + 1000;
        let xpos = Math.cos(angle) *radius;
        let zpos = Math.sin(angle)*radius;
        return {x: xpos, z: zpos};
    }
    repos() {
        console.log('repos');
        scene.updateMatrixWorld(true);
        var position = new THREE.Vector3();
        camera.lookAt(position);
        let angle = Math.random()*Math.PI*2;
        let zpos_pug = Math.sin(angle)*radius_pug;
        let xpos_pug = Math.cos(angle) * radius_pug;
        three.getObject('twerk1').position.set(xpos_pug, 0,  zpos_pug);
        three.setControlsActive(true);
    }
    enable() {
        animating = true;
        this.enableAutoTimeout();
        hiya_timeout_duration = 2000;
    }
    disable() {
        animating = false;
    }
    animate() {
        stats.begin();
        three.animate();
        sprites.drawCanvas();
        requestAnimationFrame( this.animate.bind(this) );
        if (!animating) return;
        // camera.position.y += 1
        count++;

        for (let i=0; i<groups.length; i++) {
             groups[i].group.rotation.y += groups[i].group['rotationspeed'];

            switch(groups[i].id) {
                case 'rainbow2':
                    groups[i].group.position.z = (Math.cos(count/40) * 1300) + 0;
                    groups[i].group.position.y = (Math.sin(count/40) * 800) + 100;
                    break;
                case 'rainbow3':
                    groups[i].group.position.z = (Math.cos(count/40) * 1300) + 0;
                    groups[i].group.position.y = (Math.sin(count/40) * 800) + 100;
                    break;
                case 'peeing_pug1':
                    groups[i].group.position.y = (Math.sin(count/40) * 1300) + 0;
                    break;
                case 'peeing_pug2':
                    groups[i].group.position.y = (Math.sin(count/100) * 160) + 220;
                    break;
                case 'peeing_pug3':
                    groups[i].group.position.y = (Math.sin(count/100) * 160) + 320;
                    break;
                case 'butt':
                    groups[i].group.position.y = (Math.sin(count/80) * 120) + 70;
                    break;
                case 'dance1':
                    groups[i].group.position.z = (Math.cos(count/40) * 1300) + 0;
                    groups[i].group.position.y = (Math.sin(count/40) * 800) + 100;
                    break;
                case 'dance2':
                    groups[i].group.position.z = (Math.cos(count/40) * 1300) + 0;
                    groups[i].group.position.y = (Math.sin(count/40) * 800) + 100;
                    break;
            }
        }

        /**
         * Is sprite on screen
         */
        camera.updateMatrixWorld();
        camera.matrixWorldInverse.getInverse( camera.matrixWorld );
        cameraViewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
        frustrum.setFromMatrix( cameraViewProjectionMatrix );

        if (frustrum.intersectsSprite( three.getObject('twerk1'))) {
            if (!INTERSECTED) {
                INTERSECTED = true;
                clearTimeout(auto_timeout);
                hiya_timeout = setTimeout(()=> {
                    this.putOverPug(hiya);
                    if (cameraEnabled) this.showNotification(notifications.selfie, 0);
                    console.log('intersecting puggerfly');
                    end_timeout = setTimeout(()=> {
                        this.foundPuggerfly();
                        this.hideHiya(hiya);
                    }, 1700);
                }, hiya_timeout_duration);
            }
        } else {
            INTERSECTED = false;
            this.hideHiya(hiya);
            clearTimeout(hiya_timeout);
        }

        // for every sprite on the screen {sprite, id}
        let obj_onscreen = {};
        for (let i=0; i<scene_sprites.length; i++) {

            switch (scene_sprites[i].id) {
                case 'twerk1':
                    if (hiya) {
                        // this.putOverPug(hiya);
                    }
                    break;
                default:
                    if (count % groups[i].disappear == 0) {
                        if (!hiding) {
                            hiding = true;
                            three.hideObject(scene_sprites[i].id);
                            setTimeout(()=> {
                                hiding = false;
                                if (scene_sprites[i].canvas == 'skipping') {
                                    groups[i].spr.position.set(this.getPosition().x, 0,  this.getPosition().z);
                                } else {
                                    groups[i].spr.position.set(this.getPosition().x, Math.random() * 3000,  this.getPosition().z);
                                }
                            }, 1300);
                        }
                    }
            }

            sprites.getSprite(scene_sprites[i].canvas).render = false;
            if (frustrum.intersectsSprite( three.getObject(scene_sprites[i].id)) ) {
                obj_onscreen[scene_sprites[i].canvas] = sprites.getSprite(scene_sprites[i].canvas);
            }
        }
        for (const [key] of Object.entries(obj_onscreen)) {
                   let obj = obj_onscreen[key];
                   obj.render = true;
                }
        stats.end();
    }
    endTimeout() {
        console.log('END TIMEOUT');
        trackMe(tracked_events.PUGGERFLY_TIMEOUT);
        hiya_timeout_duration = 1000;
        three.setControlsActive(false);
        scene.updateMatrixWorld(true);
        var position = new THREE.Vector3();
        position.getPositionFromMatrix( three.getObject('twerk1').matrixWorld );
        console.log(position.x + ',' + position.y + ',' + position.z);
        camera.lookAt(position);
    }
    foundPuggerfly() {
        clearTimeout(auto_timeout);
        trackMe(cameraEnabled ? tracked_events.FOUND_PUGGERFLY : tracked_events.FOUND_PUGGERFLY_FALLBACK);
        if (!cameraEnabled) {
            return;
        }
        this.emit('selfie_time');
        this.disable();
    }
    showNotification(s, delay) {
        TweenMax.set('.experience__notification', {y: -100, alpha: 0});
        $('.experience__notification div').text(s);
        $('.experience__notification').show();
        TweenMax.to('.experience__notification', 1, {y: 0, alpha:1, ease:Back.easeOut, delay: delay});
    }

}

export default Experience;