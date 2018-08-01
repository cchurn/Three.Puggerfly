/*global WebARCamera Back Elastic Quad main mask Popcorn Bounce*/
import Visualisation from './creative/Visualisation';
import Layout from './core/layout';
import loadJS from 'load-js';
import * as $ from "jquery";
import * as PIXI from 'pixi.js';
import { flashIn, blur } from './creative/Effects';
import { trackMe, tracked_events } from "./creative/Tracking";
import Hammer from 'hammerjs';
import TweenMax from 'gsap';
import Sharing from './creative/Sharing';
const sharing = new Sharing();
let visualisation;
let camera_permission_granted, camera_position_requested;
let overlay_index = 0;
let app;
let started;
let shortenedShareURL;
let pug1 = require('./img/pug1.png');
let pug2 = require('./img/pug2.png');
let pug3 = require('./img/pug3.png');
let pugs = [pug1, pug2, pug3];
let filter1 = require('./img/filter1.png');
let filter2 = require('./img/filter2.png');
let filter3 = require('./img/filter3.png');
let filter4 = require('./img/filter4.png');
let filters = [filter1, filter2, filter3, filter4];
let touch_screen_timeout;
let selfie_shown;
let screens = {
    intro: {
        container: '.intro'
    },
    experience: {
        container: '.experience'
    },
    selfie: {
        container: '.selfie'
    }
}

var creative = {
    defaults: {
        container: '.container'
    },
    options: {},
    config: {container: '', width: 320, height: 568},
    init: function(opts) {

        for(var i in opts){
            this.options[i] = {
                value: opts[i],
                enumerable: true,
                writeable: true,
                configurable: true
            }
        }
        this.config = Object.create(this.defaults, this.options);

        /**
         * Load Three.js scripts here as they aren't well supported on npm
         */
        /*var arr_scripts_cdn = [
            'https://cdnjs.cloudflare.com/ajax/libs/three.js/92/three.min.js',
            'https://threejs.org/examples/js/controls/OrbitControls.js',
            'https://threejs.org/examples/js/controls/DeviceOrientationControls.js',
            'https://cdnjs.cloudflare.com/ajax/libs/stats.js/r16/Stats.min.js'
        ];*/
        var arr_scripts_cdn = [
            'scripts/three.min.js',
            'scripts/OrbitControls.js',
            'scripts/DeviceOrientationControls.js',
            'scripts/Sky.js',
            'scripts/Stats.min.js'
        ];
        var arr_scripts_cdn_ios = [
            'scripts/three.min.js',
            'scripts/OrbitControls.js',
            'scripts/DeviceOrientationControls.js',
            'scripts/Stats.min.js',
            'scripts/popcorn.min.js',
            'scripts/Sky.js',
            'base64images.js'
        ];

        let loadArray = [];
        for (let value of checkIOS() ? arr_scripts_cdn_ios : arr_scripts_cdn) {
            let loadObj = {async: false, url: value};
            loadArray.push(loadObj);
        }

        let layout = new Layout(this.config);
        let hasInit;
        loadJS( loadArray )
            .then(() => {
                console.log("scripts loaded", layout.isPortrait());
                if (layout.isPortrait()) {
                    this.start();
                } else {
                    layout.on('layout_resize', ()=> {
                        if (hasInit) return;
                        if (layout.isPortrait()) {
                            hasInit = true;
                            this.start();
                        }
                    });
                }
            });
    },
    start() {
        this.showPage(screens.intro)
        visualisation = new Visualisation(this.config);

        $('.cta').on('touchend click', (e) => {
            e.preventDefault();
            this.disableCTA();
        });

        $('.intro__cta').on('touchend click', (e)=> {
            trackMe(tracked_events.TRY_IT_NOW);
            e.preventDefault();
            $('.intro__cta').off();
            $('.intro__prompt').fadeIn();
            //this.showPage(screens.experience);
            this.initCamera();
        });
        this.loadAnim();
        visualisation.on('selfie_time', ()=> {
            this.showSelfie();
        });

        $('.selfie__button').on('touchend click', (e)=> {
            e.preventDefault();
            this.takePhoto();
        });

        $('.end_buttons__finish').on('touchend click', (e)=> {
            e.preventDefault();
            this.savePhoto();
        });

        $('.end_buttons__retake').on('touchend click', (e)=> {
            e.preventDefault();
            this.retakePhoto();
        });

        $('.selfie__backtoar').on('touchend click', (e)=> {
            e.preventDefault();
            console.log('back to ar');
            this.backToAR();
        });
    },
    disableCTA() {
        $('.cta').css("pointer-events", "none");
        setTimeout(()=> {
            $('.cta').css("pointer-events", "auto");
        }, 2000)
    },
    showPage(id) {
        $('.log').append('\nshowPage', id);
        for (const [key] of Object.entries(screens)) {
                   $('.page').hide();
                   $(id.container).fadeIn();
                }
        switch(id) {
            case screens.experience:
                if (started) return;
                $('.test').css('opacity', 1);
                started = true;
                visualisation.enable();
                visualisation.start(camera_permission_granted);
                break;
            case screens.selfie:
                $('.experience').hide();
                break;
        }
    },
    initCamera() {
        setTimeout(()=> {
            var self = this;
            try {
                WebARCamera.camera.init({
                    camera: 'environment',
                    domElementID: 'webar_video',
                    debug: false
                });


                WebARCamera.camera.addEventListener("camera_event", function (e) {
                    console.log('%ccamera_event: ' + e.detail, 'background: #222; color: #fff');
                    if (camera_position_requested) return;
                    camera_position_requested = true;
                    switch (e.detail) {
                        case 'NotAllowedError':
                            trackMe(tracked_events.DENY_CAMERA_ACCESS);
                            self.showPage(screens.experience);

                            break;
                        case 'PermissionDeniedError':
                            trackMe(tracked_events.DENY_CAMERA_ACCESS);
                            self.showPage(screens.experience);
                            break;
                        case 'PermissionGranted':
                            trackMe(tracked_events.GRANT_CAMERA_ACCESS);
                            if (!camera_permission_granted) {
                                camera_permission_granted = true
                                self.showPage(screens.experience);
                            }
                            break;
                        case 'NotSupportedError':
                            trackMe(tracked_events.DENY_CAMERA_ACCESS);
                            self.showPage(screens.experience);
                            break;
                        default:
                            trackMe(tracked_events.DENY_CAMERA_ACCESS);
                            self.showPage(screens.experience);
                    }
                });
                // $('.log').append('\nok');
            } catch(e) {
                // $('.log').append('\nerror', e);
                self.showPage(screens.experience);
            }

            /*setTimeout(()=> {
                console.log('checking started', started);
                $('.log').append('\nchecking', started);
                if (!started) {
                    let is_uiwebview = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent);
                    self.showPage(screens.experience);
                }
            }, 1000);*/

        }, 1000);
    },
    showSelfie() {

        this.showPage(screens.selfie);
        visualisation.disable();
        WebARCamera.camera.addCameraStream('user');

        setTimeout(()=> {
            this.hideNotification();
        },3000);

        if (checkIOS() && !selfie_shown) {
            this.iosVideo();
            $('#vid').hide();
        } else {

        }
        selfie_shown = true;
        $('#webar_video').width(window.innerWidth);
        $('#webar_video').height(window.innerWidth * 1.33333);
        $('#webar_video').addClass('centered');

        $('.selfie').width(window.innerWidth);
        $('.selfie').height(window.innerWidth * 1.33333);
        $('.selfie').addClass('centered_selfie');

        $('.overlay').fadeOut();
        $('.selfie__overlay').hide();
    },
    backToAR() {
        trackMe(tracked_events.RETURN_TO_WEBAR);
        $('.experience').show();
        $('.selfie').hide();
        visualisation.enable();
        visualisation.repos();
        WebARCamera.camera.addCameraStream('environment');
    },
    retakePhoto() {

        trackMe(tracked_events.TAKE_A_NEW_SELFIE);
        $('#vid').css('opacity', 1);
        $('#c2').css('opacity', 1);
        $('#webar_video').css('opacity', 1);
        // $('.selfie__overlay').css('background-image', 'none');
        $('.selfie__button').fadeIn();
        $('.selfie__grid').fadeIn();
        $('.selfie__backtoar').fadeIn();
        $('.selfie__overlay').hide();
        $('.selfie__overlay').css('background-image', filter1);
        $('.pixi_container').css('opacity', 1);
        $('#shareimage').hide();
        if (checkIOS()) {
            app._ticker.start();
        }

        clearCanvas('#c');
        clearCanvas('#myCanvas');
        clearCanvas('#sharecanvas');

        TweenMax.to('.selfie', 0.5, {scaleX: 1, scaleY: 1, ease:Back.easeOut});
        $('body').removeClass('white');
        $('.end_buttons').fadeOut();
    },
    takePhoto() {
        let self = this;
        $('.experience__notification').hide();
        setTimeout(()=> {
            $('.selfie__instructions').fadeIn();
        }, 1000);
        setTimeout(()=> {
            $('.selfie__instructions').fadeOut();
        }, 2500);
        trackMe(tracked_events.TAKE_PHOTO);
        WebARCamera.camera.capture().then((data) => {
            $('#webar_video').css('opacity', 0);

            if (checkIOS()) {
                app._ticker.stop();
                $('.pixi_container').css('opacity', 0);
            }
            /**
             * Add camera to canvas
             */
            setTimeout(()=> {
                this.addVideoToCanvas('webar_video', 'c');
            }, 110);
            /**
             * Add pug to canvas
             */
            setTimeout(()=> {
                addImageToCanvas(
                    pug1,
                    document.getElementById('c'),
                    window.innerWidth,
                    (window.innerWidth * 1.3333),
                    0 ,0).then(()=> {
                    self.combineImages();
                });
            }, 120);


            setTimeout(()=> {
                $('#vid').css('opacity', 0);
                $('#c2').css('opacity', 0);
                $('.selfie__backtoar').fadeOut();
                $('.selfie__grid').fadeOut();
                $('.selfie__button').fadeOut();
                flashIn('#c');
            }, 130);
            $('.selfie__overlay').show();

            TweenMax.set('.selfie__overlay', {x: 200, alpha: 0});
            TweenMax.to('.selfie__overlay', 0.4, {alpha:1, x:0, ease: Back.easeOut});

            let mc = new Hammer.Manager($('.selfie__overlay').get(0));
            let pinch = new Hammer.Pinch();
            let swipe = new Hammer.Swipe();
            mc.add([pinch, swipe]);

            mc.on("swipe", function(ev) {
                trackMe(tracked_events.SWIPE_FILTERS);
                if (ev.deltaX > 0) {
                    self.changeProduct(1);
                } else {
                    self.changeProduct(-1);
                }
                setTimeout(()=> {
                    self.combineImages();
                }, 60)
            });
            TweenMax.to('.selfie', 1, {scaleX: 0.88, scaleY: 0.88, delay: 0.3, ease:Back.easeOut});
            $('body').addClass('white');

            $('.end_buttons__finish').show();
            $('.end_buttons__retake').show();

            TweenMax.set('.end_buttons__finish', {y: 30, x:0, alpha: 0});
            TweenMax.to('.end_buttons__finish', 0.5, {y: 0, delay: 1, ease:Bounce.easeOut});
            TweenMax.to('.end_buttons__finish', 0.3, {alpha: 1, delay: 1});
            TweenMax.set('.end_buttons__retake', {y: -30, alpha: 0});
            TweenMax.to('.end_buttons__retake', 0.5, {y: 0, delay: 1, ease:Bounce.easeOut});
            TweenMax.to('.end_buttons__retake', 0.3, {alpha: 1, delay: 1});

            setTimeout(()=> {
                self.combineImages();
            }, 200);


        })
    },
    combineImages() {
        var sharecanvas = document.getElementById("sharecanvas");
        var ctx = sharecanvas.getContext("2d");
        ctx.clearRect(0, 0, sharecanvas.width, sharecanvas.height);
        addCanvasToCanvas(
            document.getElementById('c'),
            sharecanvas,
            sharecanvas.width,
            (sharecanvas.height),
            0 ,0).then(()=> {
            addImageToCanvas(
                filters[this.getCurrentIndex()],
                sharecanvas,
                sharecanvas.width,
                sharecanvas.height,
                0 ,0).then(()=> {
            });
        });
    },
    changeProduct(idx) {
        overlay_index += idx;
        console.log('swipe', this.getCurrentIndex());
        TweenMax.set('.selfie__overlay', {x: (idx > 0 ? -200 : 200), alpha: 0});
        TweenMax.to('.selfie__overlay', 0.4, {alpha:1, x:0, ease: Back.easeOut});
        $('.selfie__overlay').css('background-image', 'url('+filters[overlay_index]+')');
        console.log('', filters[overlay_index]);
    },
    getCurrentIndex() {
        if (overlay_index >= 4) {
            overlay_index = 0;
        } else if (overlay_index < 0) {
            overlay_index = overlay_index = 3;
        }
        return overlay_index;
    },
    addVideoToCanvas(video, canvas) {
        let vid = document.getElementById(video);
        let drawcanvas = document.getElementById(canvas);
        let drawcanvas_ctx = drawcanvas.getContext('2d');
        let domRect = document.getElementById(video).getBoundingClientRect();
        let ypos = drawcanvas.height - domRect.height;
        drawcanvas.width = window.innerWidth;
        drawcanvas.height = window.innerWidth * 1.33333;
        drawcanvas_ctx.drawImage(vid, 0, 0, domRect.width, domRect.height);
    },
    draw(v,c,w,h) {
        if(v.paused || v.ended) return false;
        c.drawImage(v,0,0,w,h);
        setTimeout(this.draw,20,v,c,w,h);
    },
    savePhoto() {
        trackMe(tracked_events.FINISH);
        let imgdata = document.getElementById("sharecanvas").toDataURL("image/jpeg");
        let shareimage = document.getElementById("shareimage");
        $('#shareimage').attr('src', imgdata);
        clearCanvas('#c');
        // $('.selfie__overlay').css('background-image', 'none');
        $(shareimage).show();
        flashIn(shareimage);
        TweenMax.to(shareimage, 0.1, {scaleX: 0.9, scaleY: 0.9, ease:Quad.easeOut})
        TweenMax.to(shareimage, 1, {scaleX: 1, scaleY: 1, delay: 0.1, ease:Elastic.easeOut.config(2, 0.3)})

        /**
         * Show save instructions
         */
        TweenMax.to('.end_buttons__finish', 0.5, {x: -400, alpha: 0, delay: 0.1, ease:Quad.easeOut});
        TweenMax.set('.end_buttons__save', {x: 200, alpha: 0});
        $('.end_buttons__save').show();
        TweenMax.to('.end_buttons__save', 0.5, {x: 0, delay: 0.2, ease:Bounce.easeOut});
        TweenMax.to('.end_buttons__save', 0.3, {alpha: 1, delay: 0.2});

    },
    async uploadImage() {
        let result = await sharing.sendData($('#c').get(0).toDataURL("image/jpeg"));
        console.log(result);
        window.open(result);
        return;
        /**
         * Url vars
         * @type {string}
         */
        let title = 'Oh Snap';
        let description = 'Oh Snap';
        let pic = result;
        let shareurl = encodeURI('http://three-ohsnap.herokuapp.com/?title='+ title +'&pic='+ pic +'&description='+description);
        sharing.getShortURL(shareurl).then((res)=> {
            shortenedShareURL = res.data.url;
            console.log(shortenedShareURL);
            $('.end_buttons').fadeIn();
        });
    },
    loadAnim() {
        //PIXI.loader.add('anim/pug_selfie.json');
    },
    iosVideo() {
        app = new PIXI.Application(window.innerWidth, window.innerWidth/1.333, {
            transparent: true,
            forceCanvas: false
        });
        document.querySelector('.pixi_container').appendChild(app.view);

        onAssetsLoaded();

        function onAssetsLoaded()
        {
            // create an array of textures from an image path
            var frames = [];
            console.log('', PIXI.loader.resources['anim/pug_selfie.json'].data.frames);
            let f = PIXI.loader.resources['anim/pug_selfie.json'].data.frames;
            for (const [key] of Object.entries(f)) {
                       let obj = f[key];
                       frames.push(PIXI.Texture.fromFrame(key));
                    }
            var anim = new PIXI.extras.AnimatedSprite(frames);
            anim.x = 0;
            anim.y = -3;
            anim.width = window.innerWidth;
            anim.height = window.innerWidth / 1.3;
            anim.animationSpeed = 0.2;
            anim.play();
            app.stage.addChild(anim);
            console.log('', app);
        }
    },
    showNotification(s, delay) {
        TweenMax.set('.experience__notification', {y: -100, alpha: 0});
        $('.experience__notification div').text(s);
        $('.experience__notification').show();
        TweenMax.to('.experience__notification', 1, {y: 0, alpha:1, ease:Back.easeOut, delay: delay});
    },
    hideNotification() {
        TweenMax.to('.experience__notification', 1, {y: -100, alpha:0, ease:Back.easeOut});
    }
};
creative.init({container:'#container', width: 320, height: 568, gyro: true});

export default creative;


/**
 * Adds an image to a canvas
 * @param imageSrc: path to image
 * @param canvas: canvas
 * @returns {Promise}
 */
function addImageToCanvas(imageSrc, canvas, width, height, top, left) {
    return new Promise(
        function (resolve, reject) {
            var img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imageSrc;
            img.onload = function(){
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img,
                    (typeof left !== 'undefined' ? left : 0),
                    (typeof top !== 'undefined' ? top : 0),
                    (typeof width !== 'undefined' ? width : canvas.width),
                    (typeof height !== 'undefined' ? height : canvas.height));
                resolve();
            };
        });
}

/**
 * Adds one canvas to another
 * @param canvas1: canvas
 * @param canvas2: canvas
 * @param gco: globalCompositeOperation
 * @returns {Promise}
 */
function addCanvasToCanvas(canvas1, canvas2, width, height) {
    return new Promise(
        function (resolve, reject) {
            var canvas2Ctx = canvas2.getContext('2d');
            let domRect = document.querySelector('.selfie').getBoundingClientRect();
            console.log('', width, height);
            console.log('', domRect);

            canvas2Ctx.drawImage(canvas1, 0, 0, width, height);
            resolve();
        });
}
function addCanvasToCanvas2(canvas1, canvas2, width, height, left, top) {
    return new Promise(
        function (resolve, reject) {
            var canvas2Ctx = canvas2.getContext('2d');
            let domRect = document.querySelector('.selfie').getBoundingClientRect();
            console.log('', canvas1.width, canvas1.height);
            console.log('', canvas2.width, canvas2.height);
            console.log('', domRect);

            canvas2Ctx.drawImage(canvas1, 0, 0, width, height);
            resolve();
        });
}

/**
 * Clear a pre-existing canvas
 * @param canvas
 */
function clearCanvas(canvas) {
    let c =document.querySelector(canvas);
    let ctx = c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height);
}


function checkIOS() {
    var iOS = parseFloat(
        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
            .replace('undefined', '3_2').replace('_', '.').replace('_', '')
    ) || false;
    return iOS;
}
function getRandom(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}