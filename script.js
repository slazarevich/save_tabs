function addTabSet(name) {
    let tabSetInput = document.createElement('input');
    tabSetInput.id = name;
    tabSetInput.value = name;
    tabSetInput.type = 'checkbox';
    tabSetInput.name = 'tabset';

    let tabSetLabel = document.createElement('label');
    tabSetLabel.htmlFor = name;
    tabSetLabel.classList.add("tabBlockLabels");
    tabSetLabel.innerHTML = name;

    return [tabSetInput, tabSetLabel]
}

function showNameField() {
    let nameField = document.createElement('input');
    nameField.id = 'nameField';
    nameField.type = 'text';
    nameField.placeholder = 'Enter name of the tab set';
    return nameField
}

function hideNameField(nameFieldId) {
    let nameField = document.getElementById(nameFieldId);
    nameField.remove();
}

function updateTabSets() {
    document.getElementById('checkboxes').innerHTML = '';
    chrome.storage.sync.get(null, function (items) {
        let allTabSetKeys = Object.keys(items);
        allTabSetKeys.forEach(function (key) {
            chrome.storage.sync.get([key], function (tabSet) {
                let tabSetResult = addTabSet(tabSet[key].name);
                let tabSetInput = tabSetResult[0];
                let tabSetLabel = tabSetResult[1];
                document.getElementById('checkboxes').appendChild(tabSetInput);
                document.getElementById('checkboxes').appendChild(tabSetLabel);
            })
        });
    });
}

window.onload = function () {

    updateTabSets();

    document.getElementById('save').onclick = function () {

        chrome.tabs.query({currentWindow: true}, function (tabs) {
            let urls = [];
            tabs.forEach(function (tab) {
                urls.push(tab.url)
            });

            let nameField = showNameField();
            let tabSetName;
            let tabSet;

            nameField.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    tabSetName = this.value;
                    hideNameField('nameField');

                    tabSet = {
                        name: tabSetName,
                        created_at: new Date().toLocaleString(),
                        urls: urls
                    };

                    chrome.storage.sync.set({[tabSetName]: tabSet}, function () {
                        console.log('Saved urls are: ' + tabSet);
                    });
                    updateTabSets();
                }
            });

            document.getElementById('checkboxes').appendChild(nameField);
        })
    };

    document.getElementById('reload').onclick = function () {

        let tabsets = document.getElementsByName('tabset');
        tabsets = Array.from(tabsets);
        let checkedTabsets = tabsets.filter(tabset => tabset.checked === true);

        checkedTabsets.forEach(function (tabset) {
           let tabSetName = tabset.value;
           chrome.storage.sync.get([tabSetName], function (result) {
                result[tabSetName].urls.forEach(function (url) {
                chrome.tabs.create({url: url})
                })
            })
        });
    }
};