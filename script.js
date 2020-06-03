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
    renderTabSets();
}


function openTabs(tabSetsElements) {
    let tabSetsNames = [];
    tabSetsElements.forEach(function (element) {
        tabSetsNames.push(element.value)
    });
    openTabSets(tabSetsNames);
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

                    saveTabSet(tabSet);
                    console.log('Saved tabs are: ' + tabSet.urls);
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
        openTabs(checkedTabsets);
    }
};