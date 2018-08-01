/*global $ Quad Back Elastic WebARCamera Linear*/
import TweenMax from 'gsap';
import $ from 'jquery';

export function flashIn(domElement) {
    var brightObj = {val:500};
    TweenMax.set(domElement, {
        '-webkit-filter': 'brightness(' + 500 + '%)',
        'filter': 'brightness(' + 500 + '%)'
    });
    TweenMax.to(brightObj, 0.7, {
        val: 100,
        onUpdate: flashIn,
        delay: 0
    });
    function flashIn() {
        TweenMax.set(domElement, {
            transformOrigin: '50% 50%',
            '-webkit-filter': 'brightness(' + brightObj.val + '%)',
            'filter': 'brightness(' + brightObj.val + '%)'
        });
    }
}
export function blur(domElement, value) {
    TweenMax.set(domElement, {webkitFilter:"blur(" + value + "px)"});
}
export function grey(domElement, value) {
    TweenMax.set(domElement, {webkitFilter:"grayscale(" + value + "%)"});
}