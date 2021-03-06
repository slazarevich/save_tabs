import Sortable from './libraries/sortable.esm.js';
import {deleteTabSets, openTabSets, renderTabSets, saveTabSet} from "./db_wrapper.js";


function addTabSet(name) {
    let tabSetInput = document.createElement('input');
    tabSetInput.id = name;
    tabSetInput.value = name;
    tabSetInput.type = 'checkbox';
    tabSetInput.name = 'tabset';
    tabSetInput.classList.add("tabBlocks");

    let tabSetLabel = document.createElement('label');
    tabSetLabel.htmlFor = name;
    tabSetLabel.classList.add("tabBlockLabels");
    tabSetLabel.innerHTML = name;

    let tabSetLi = document.createElement('li');
    tabSetLi.innerHTML += tabSetInput.outerHTML + tabSetLabel.outerHTML;
    tabSetLi.onclick = showOnMultiple;

    return tabSetLi;
}

export { addTabSet };

function showOnMultiple() {
    let blocksToShow = [];
    $('#tabset_list li input:checked').each(function() {
        blocksToShow.push($(this));
    });
    if (blocksToShow.length > 1) {
        $(".display_on_multiple").show();
    } else {
        $(".display_on_multiple").hide();
    }
}


function showNameField() {
    let nameField = document.createElement('input');
    nameField.id = 'nameField';
    nameField.type = 'text';
    nameField.placeholder = 'Enter name of the tab set';
    return nameField;
}


function hideNameField(nameFieldId) {
    let nameField = document.getElementById(nameFieldId);
    nameField.remove();
}


function updateTabSets() {
    let tabSetList = document.getElementById('tabset_list');
    tabSetList.innerHTML = '';
    renderTabSets();
    showOnMultiple();
    return tabSetList;
}


function openTabs(tabSetsElements) {
    let tabSetsNames = [];
    tabSetsElements.forEach(function (element) {
        tabSetsNames.push(element.value);
    });

    let inSepWindows = $("#sep_windows").is(':checked');

    openTabSets(tabSetsNames, inSepWindows);
}


function createUnorderedList(list, bulletChar) {
  let result = "";
  for (let i = 0; i<list.length; ++i) {
    result += bulletChar + " " + list[i] + "\n";
  }
  return result;
}


function removeTabs(tabSetsElements) {
    let tabSetsNames = [];
    tabSetsElements.forEach(function (element) {
        tabSetsNames.push(element.value);
    });
    let removeTabs = confirm('Do you want to remove these tabsets? \n' + createUnorderedList(tabSetsNames, '-'));
    if (removeTabs) {
        deleteTabSets(tabSetsNames);
        updateTabSets();
    }
}


window.onload = function () {

    let tabSetList = updateTabSets();
    Sortable.create(tabSetList, {animation: 150});

    document.getElementById('save').onclick = function () {

        chrome.tabs.query({currentWindow: true}, function (tabs) {
            let urls = [];
            tabs.forEach(function (tab) {
                urls.push(tab.url);
            });

            let nameField;

            if (!document.getElementById('nameField')) {
                nameField = showNameField();
            }
            document.getElementById('checkboxes').appendChild(nameField);
            let tabSetName;
            let tabSet;

            nameField.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    tabSetName = this.value;
                    let existingElements = document.getElementsByName('tabset');
                    let existingNames = [];
                    existingElements.forEach(function (element) {
                        existingNames.push(element.value);
                    });

                    let overwrite;

                    if (existingNames.includes(tabSetName)) {
                        overwrite = confirm('The tab set with this name already exists. ' +
                            'Would you like to overwrite it?');
                    }

                    if (overwrite || !existingNames.includes(tabSetName)) {

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
                }
            });
        })
    };

    document.getElementById('reload').onclick = function () {

        let tabsets = document.getElementsByName('tabset');
        tabsets = Array.from(tabsets);
        let checkedTabsets = tabsets.filter(tabset => tabset.checked === true);
        openTabs(checkedTabsets);
    };

    document.getElementById('remove').onclick = function () {

        let tabsets = document.getElementsByName('tabset');
        tabsets = Array.from(tabsets);
        let checkedTabsets = tabsets.filter(tabset => tabset.checked === true);
        if (checkedTabsets.length > 0) {
            removeTabs(checkedTabsets);
        }
    };
};