'use strict';

const icon = {
    default: 'icon/default-48.png',     // Default icon
    green: 'icon/green-48.png',         // Green icon when tracker is on
    red: 'icon/red-48.png'              // Red icon when scroll reset is on
}

// Check if storage exists, initiate if not.
chrome.storage.local.get(['saved_pages', 'setting'], function(result) {
    if (!result.saved_pages) {
        chrome.storage.local.set({'saved_pages': {}});
    }
    if (!result.setting) {
        chrome.storage.local.set({'setting': '0'});
    }
})

function set_scroll(scroll_pos) {
    // Set scroll position to given int.
    window.scrollTo(0, scroll_pos)
}

function reset_scroll(tab_id) {
    // Reset scroll to top of page.
    chrome.scripting.executeScript({target: {tabId:tab_id}, func: set_scroll, args: [0]}, function() {
        if (!chrome.runtime.lastError) {
            chrome.action.setIcon({path: icon.red, tabId:tab_id});
        }
    });
}

function init_tracker(tab_id, scroll_pos=null) {
    // This function injects the content script into the given tab id.
    if (scroll_pos) {
        chrome.scripting.executeScript({target: {tabId:tab_id}, func: set_scroll, args: [scroll_pos]});
    }
    chrome.scripting.executeScript({target: {tabId:tab_id}, files: ['foreground.js']}, function() {
        // Check if script was properly injected. This also catches exceptions thrown.
        if (!chrome.runtime.lastError) {
            chrome.action.setIcon({path: icon.green, tabId:tab_id})
        }
    });
}

// Listen for url updates/changes, and check if url page is being tracked.
// This also checks for when user switches tabs.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // If url is found in storage, read settings. If number is stored to url, inject content script
    // into page to track scroll. If null is stored to url, set scroll of page to 0. Else, do nothing.
    // Icon needs to be updated to display the mode of the current web page.
    if (changeInfo.status != 'complete') {
        return;
    }
    // Get saved_pages and setting from local storage.
    chrome.storage.local.get(['saved_pages', 'setting'], function(result) {
        // If url is already saved, prioritize saved settings
        if (tab.url in result.saved_pages) {
            if (result.saved_pages[tab.url] === null) {
                reset_scroll(tabId)
            }
            else {
                init_tracker(tabId, result.saved_pages[tab.url]);
            }
        }
        // Use default mode if url is not already saved.
        else {
            switch (result.setting) {
                case "1":
                    init_tracker(tabId);
                    break;
                case "2":
                    reset_scroll(tabId)
                    break;
                default:
                    chrome.action.setIcon({path: icon.default, tabId:tabId})
            }
        }
    })
})

 // Listen for icon to be clicked
chrome.action.onClicked.addListener(function(tab) {
    // Change mode accordingly: default -> green -> red -> default...
    chrome.storage.local.get(['saved_pages', 'setting'], function(result) {
        if (tab.url in result.saved_pages) {
            // If icon is currently red
            if (result.saved_pages[tab.url] === null) {
                // If mode track scroll or reset scroll is on: red -> green
                if (result.setting == "1" || result.setting == "2") {
                    init_tracker(tab.id);
                    return;
                }
                // red -> default
                delete result.saved_pages[tab.url];
                chrome.storage.local.set({'saved_pages': result.saved_pages});
                chrome.action.setIcon({path: icon.default, tabId: tab.id});
            }
            // If icon is currently green
            else {
                // green -> red
                delete result.saved_pages[tab.url];
                if (result.setting != "2") {
                    result.saved_pages[tab.url] = null; // save this page when mode is not scroll reset
                }
                chrome.storage.local.set({'saved_pages': result.saved_pages})
                chrome.action.setIcon({path: icon.red, tabId: tab.id})
                chrome.tabs.sendMessage(tab.id, {message: 'SCROLL BACK DISABLED'})
            }
        }
        // If icon is currently default
        else {
            // default -> green
            init_tracker(tab.id);
        }
    })
})
