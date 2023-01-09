/// <reference path="d/obs.d.ts" />
/// <reference path="d/map_interactive.d.ts" />

/**
 * Add the custom styles
 */
function appendStyle(): void {

    let styles = `
#published-languages i { color: #1a1a1a; font-size: 19px; width: 20px; } 
`;

    let css = document.createElement('style');
    css.type = 'text/css';

    if (css['styleSheet'])
        css['styleSheet']['cssText'] = styles;
    else
        css.appendChild(document.createTextNode(styles));

    document.getElementsByTagName("head")[0].appendChild(css);

    let lnk: HTMLLinkElement = document.createElement('link');
    lnk.rel = 'stylesheet';
    lnk.type = 'text/css';
    lnk.media = 'all';
    lnk.href = 'https://cdn.unfoldingword.org/obs/js/map-style.min.css';
    document.getElementsByTagName("head")[0].appendChild(lnk);
}

document.addEventListener("DOMContentLoaded", function() {
    appendStyle();
    const urlParams = new URLSearchParams(window.location.search);

    let dcs_domain = urlParams.get('dcs');
    if (! dcs_domain) {
        if (window.location.hostname == "door43.org" || window.location.hostname == "door43-library.netlify.app") {
            dcs_domain = 'git.door43.org';
        } else {
            dcs_domain = 'qa.door43.org';
        }
    }

    let tracker_url = urlParams.get('tracker');
    if (! tracker_url) {
        tracker_url = 'https://track.door43.org/track';
    }

    let my_mt_id = urlParams.get('mt_id');
    if (! my_mt_id && window.hasOwnProperty('mt_id') && window.mt_id) {
        my_mt_id = window.mt_id;
    }

    // load D43 now
    const d43 = new D43(dcs_domain, tracker_url, my_mt_id, function(error: string) {
        if (error)
            d43.displayError(error);
        else if (typeof initMap === 'function')
            d43.buildDiv(initMap);
        else
            d43.buildDiv();
    });
});
