/* global*/
export let tracked_events = {
    TRY_IT_NOW: 'try it now',
    GRANT_CAMERA_ACCESS: 'Grant camera access',
    DENY_CAMERA_ACCESS: 'Deny camera access',
    FOUND_PUGGERFLY: 'Found Puggerfly',
    FOUND_PUGGERFLY_FALLBACK: 'Found Puggerfly Fallback',
    PUGGERFLY_TIMEOUT: 'Puggerfly timeout',
    TAKE_PHOTO: 'Take photo',
    RETURN_TO_WEBAR: 'Return to webAR',
    TAKE_A_NEW_SELFIE: 'Take a new selfie',
    SWIPE_FILTERS: 'Swipe filters',
    SAVE_PHOTO: 'Save photo',
    FINISH: 'Finish',
};

/**
 * One Creative tracking bridge
 * @param name
 */
export function trackMe(name) {
    console.log('%c Tracking: '+name+' ', 'background: #ffcc00; color: #000000');
    try {
        var event = new CustomEvent("tracking", {
            detail: {
                label: name
            }
        });
        window.dispatchEvent(event);
    } catch(e) {
        console.log('Failed to track', name, e);
    }
}