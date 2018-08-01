import {EventEmitter} from 'events';
import * as PIXI from 'pixi.js';
import * as $ from "jquery";
let app, arr_sprites;
let canDraw;
let count = 0;
class Sprites extends EventEmitter {
    constructor(config) {
        super();
        console.log('sprites::');

    }
    initPixi() {
        app = new PIXI.Application(1024, 4000, {
            transparent: true,
            backgroundColor: 0x1099bb,
            forceCanvas: true
        });
        document.querySelector('#test-canvas').appendChild(app.view);
    }
    loadSprites(sprites) {
        return new Promise(((resolve, reject) => {
            console.log('sprites', sprites);
            for (let i=0; i<sprites.length; i++) {
                PIXI.loader.add(sprites[i].id, sprites[i].json)
            }

            PIXI.loader.load(onAssetsLoaded);

            function onAssetsLoaded() {
                PIXI.loader.add('anim/pug_selfie.json');
                /**
                 * Loop over each spritesheet and create an animated sprite
                 * and position them on the canvas.
                 * We are expecting same size for now 128x128
                 */
                arr_sprites = {};
                let ypos = -1;
                for (let i=0; i<sprites.length; i++) {
                    let resource = PIXI.loader.resources[sprites[i].id];
                    let frames = [];
                    let width, height, res;

                    for (const [key, value] of Object.entries(resource.textures)) {
                        frames.push(PIXI.Texture.fromFrame(`${key}`));
                        // console.log('', value.orig.width, value.orig.height);
                        width = value.orig.width;
                        height = value.orig.height;
                        res = value.baseTexture.resolution;
                    }
                    let animsprite = new PIXI.extras.AnimatedSprite(frames);
                    arr_sprites[sprites[i].id] = {};
                    arr_sprites[sprites[i].id]['sprite'] = animsprite;
                    if (i % 2 == 0) {
                        animsprite.x = 0;
                        ypos++;
                    } else {
                        animsprite.x = 128;
                    }
                    animsprite.y = ypos * 128;
                    for (const [key, value] of Object.entries(resource)) {

                    }
                    animsprite.width = 128;
                    animsprite.height = 128;

                    animsprite.anchor.set(0);

                    if (sprites[i].id == 'twerk') {
                        animsprite.animationSpeed = 0.1;
                    } else {
                        animsprite.animationSpeed = 0.5;
                    }

                    animsprite.play();
                    app.stage.addChild(animsprite);

                    /**
                     * Now create a separate standard canvas for each sprite
                     */
                    let canvas = document.createElement('canvas');
                    canvas.setAttribute("width", "128");
                    canvas.setAttribute("height", "128");
                    canvas.setAttribute("id", sprites[i].id);
                    canvas.setAttribute("class", 'hide');
                    document.body.appendChild(canvas);
                    arr_sprites[sprites[i].id]['canvas'] = canvas;
                }
                //arr_sprites['star'].render = true;
                canDraw = true;
                console.log('created sprites and canvas', arr_sprites);
                resolve();
            }
        }));
    }
    drawCanvas() {
        /**
         * Draw sprites to individual canvases
         */
        if (!canDraw) return;
        let pixicanvas = $('#test-canvas > canvas').get(0);
        for (const [key] of Object.entries(arr_sprites)) {
            let ccanvas = arr_sprites[key]['canvas'];
            let ccontext = ccanvas.getContext('2d');
            let sprite = arr_sprites[key]['sprite'];
            /**
             * Drawing is CPU heavy so throttle this
             */
            if (count % 3 == 0) {
                // check if relevant Three.Sprite is on-screen (set in visualisation.js)

                if (arr_sprites[key].render) {
                    ccontext.clearRect(0, 0, ccanvas.width, ccanvas.height);
                    ccontext.drawImage(pixicanvas, -(sprite.transform.position._x), -sprite.transform.position._y);
                }
            }
            count++;
        }
    }
    getCanvas(id) {
        return arr_sprites[id]['canvas'];
    }
    getSprite(id) {
        return arr_sprites[id];
    }
    hide(id) {
       // console.log('hiding', id);
    }
}

export default Sprites;