'use strict';

const icon = {
    default: 'icon/default-48.png',     // Default icon
    green: 'icon/green-48.png',         // Green icon when tracker is on
    red: 'icon/red-48.png'              // Red icon when scroll reset is on
}

// Init settings page with current settings
chrome.storage.local.get(['setting'], function(result) {
    console.log(result.setting)
    switch (result.setting) {
        case "1":
            document.getElementById('setting_1').checked = true;
            break;
        case "2":
            document.getElementById('setting_2').checked = true;
            break;
        default:
            document.getElementById('setting_0').checked = true;
    }
    update_icon(result.setting)
})

function update_icon(setting) {
    // Change icon to current setting.
    switch (setting) {
        case "1":
            document.getElementById('icon').src = '/icon/green-48.png'
            break;
        case "2":
            document.getElementById('icon').src = '/icon/red-48.png'
            break;
        default:
            document.getElementById('icon').src = '/icon/default-48.png'
    }
}

function radio_change(radio) {
    // Save setting to storage.
    chrome.storage.local.set({'setting': radio.value});
    update_icon(radio.value);
}

function reset_data() {
    // Delete all tracking data of url pages.
    chrome.storage.local.set({'saved_pages': {}}, function () {
        var status = document.getElementById('status');
        status.textContent = 'All trackers cleared.';
    })
}

// Listen for changes to radio buttons
document.addEventListener('input', function(event) {
    if (event.target.getAttribute('name') == 'setting') {
        radio_change(event.target)
    }
})

// Listen for clear button press
document.getElementById('reset_data').addEventListener('click',
    reset_data);