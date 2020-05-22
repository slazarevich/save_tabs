window.onload = function() {
    document.getElementById('save').onclick = function() {
        let tab = chrome.tabs.query({currentWindow: true}, function(tabs) {
            let urls = [];
            tabs.forEach(function (tab) {
                urls.push(tab.url)
            });
            chrome.storage.sync.set({'savedTabs': urls}, function () {
                console.log('Saved urls are: ' + urls);
            });
        })
    };

    document.getElementById('reload').onclick = function () {
        chrome.storage.sync.get(['savedTabs'], function (urls) {
            urls.savedTabs.forEach(function (url) {
                chrome.tabs.create({url: url})
            })
        })
    }
};