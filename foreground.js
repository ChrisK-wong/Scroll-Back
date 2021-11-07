// Injected script to track user scroll
'use strict';

// Init script
var SCROLL_BACK = true
update_scroll()

function update_scroll() {
    if (SCROLL_BACK) {
        // Save new scrow position to storage.
        chrome.storage.local.get(['saved_pages'], function(result) {
            result.saved_pages[window.location.href] = window.scrollY
            chrome.storage.local.set({'saved_pages': result.saved_pages})
        })
    }
}

if (SCROLL_BACK) {
    // Listen for message to disable script if user switches mode from green.
    chrome.runtime.onMessage.addListener(function(request) {
        if (request.scroll_back == 'SCROLL BACK DISABLED') {
            SCROLL_BACK = false;
        }
    })

    // Listen for user scroll.
    window.addEventListener('scroll', update_scroll)
}
