import {addTabSet} from "./script.js";

let indexedDB = window.indexedDB;
// indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;


function saveTabSet(tabSet) {

    let request = window.indexedDB.open('SaveTabsDB', 1),
        db,
        tx,
        store,
        index;

    request.onupgradeneeded = function(e) {
        let db = request.result,
            store = db.createObjectStore('TabSetsStore', {autoIncrement: true}),
            index = store.createIndex('tabSetName', 'tabSetName', {unique: true});
    };

    request.onerror = function (e) {
        console.log('There was an error: ' + e.target);
    };

    request.onsuccess = function (e) {
        db = request.result;
        tx = db.transaction('TabSetsStore', 'readwrite');
        store = tx.objectStore('TabSetsStore');
        index = store.index('tabSetName');

        db.onerror = function (e) {
            console.log('ERROR' + e.target.error);
        };

        let tabSetName = tabSet.name;
        let checkIfExistsRequest = index.getKey(tabSetName);

        checkIfExistsRequest.onsuccess = function (e) {
            let recordKey = checkIfExistsRequest.result;
            if (recordKey !== undefined) {
                store.delete(recordKey);
            }
            store.add({tabSetName: tabSetName, tabs: tabSet});
        };

        tx.oncomplete = function () {
            db.close();
        };
    };
}


function renderTabSets() {

    let request = window.indexedDB.open('SaveTabsDB', 1),
        db,
        tx,
        store,
        index;

    request.onupgradeneeded = function(e) {
        let db = request.result,
            store = db.createObjectStore('TabSetsStore', {autoIncrement: true}),
            index = store.createIndex('tabSetName', 'tabSetName', {unique: true});
    };

    request.onerror = function (e) {
        console.log('There was an error: ' + e.target.error);
    };

    request.onsuccess = function (e) {
        db = request.result;
        tx = db.transaction('TabSetsStore', 'readwrite');
        store = tx.objectStore('TabSetsStore');
        index = store.index('tabSetName');

        db.onerror = function (e) {
            console.log('ERROR' + e.target.error);
        };

        let allRecords = store.getAll();
        allRecords.onsuccess = function() {

            let allTabSets = allRecords.result;
            let allTabSetsKeys = Object.keys(allTabSets);

            allTabSetsKeys.forEach(function (key) {
                let tabSetLi = addTabSet(allTabSets[key].tabSetName);
                document.getElementById('tabset_list').appendChild(tabSetLi);
            });
        };

        tx.oncomplete = function () {
            db.close();
        };
    };
}


function openTabSets(tabSetsNames, inSepWindows) {
    let request = window.indexedDB.open('SaveTabsDB', 1),
        db,
        tx,
        store,
        index;

    request.onsuccess = function (e) {
        db = request.result;
        tx = db.transaction('TabSetsStore', 'readonly');
        store = tx.objectStore('TabSetsStore');
        index = store.index('tabSetName');

        db.onerror = function (e) {
            console.log('ERROR' + e.target.error);
        };

        let getCursorRequest = store.openCursor();

        getCursorRequest.onsuccess = function (e) {
            let cursor = e.target.result;

            if (cursor) {
                let tabSet = cursor.value;
                if (tabSetsNames.indexOf(tabSet.tabSetName) !== -1) {

                    let urls = tabSet.tabs.urls;

                    if (tabSetsNames.length > 1 && inSepWindows) {
                        chrome.windows.create({url: urls});
                    } else {
                        urls.forEach(function (url) {
                            // console.log(url);
                            chrome.tabs.create({url: url});
                        });
                    }
                }
                cursor.continue();
            }
        };

        tx.oncomplete = function () {
            db.close();
        };
    };
}


function deleteTabSets(tabSetsNames) {
    let request = window.indexedDB.open('SaveTabsDB', 1),
        db,
        tx,
        store,
        index;

    request.onsuccess = function (e) {
        db = request.result;
        tx = db.transaction('TabSetsStore', 'readwrite');
        store = tx.objectStore('TabSetsStore');
        index = store.index('tabSetName');

        db.onerror = function (e) {
            console.log('ERROR' + e.target.error);
        };

        let getCursorRequest = store.openCursor();

        getCursorRequest.onsuccess = function (e) {
            let cursor = e.target.result;

            if (cursor) {
                let tabSet = cursor.value;
                if (tabSetsNames.indexOf(tabSet.tabSetName) !== -1) {
                    store.delete(cursor.key);
                }
                cursor.continue();
            }
        };

        tx.oncomplete = function () {
            db.close();
        };
    };
}

export { saveTabSet , renderTabSets, openTabSets, deleteTabSets };
