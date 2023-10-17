const enableMonitorNodeId = 'pros-monitorEnabled';
const enableAutologinNodeId = 'pros-autologin';
const inputContainerId = 'pros-subs';
const messageNodeId = 'pros-optionstatus';

// gets elements in the page that deal with subscriptions
function getSubsItems(){
  return document.querySelectorAll(".pros-subs-subforum");
}

// Saves options to chrome.storage
const saveOptions = function() {
  // retrieve current values
  let autologinValue = document.getElementById(enableAutologinNodeId).checked;
  let monitorEnabledValue = document.getElementById(enableMonitorNodeId).checked;
  let subs = {};
  getSubsItems().forEach(function(currValue){
      subs[currValue.id] = currValue.checked;
  })
  // trigger saving
  browser.storage.sync.set({
        autologin: autologinValue,
        monitorEnabled: monitorEnabledValue,
        subs: JSON.stringify(subs)
    }).then( function() {
      // Update status to let user know options were saved.
      let status = document.getElementById(messageNodeId);
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 750);
    }
  );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = function(){
  browser.storage.sync.get(
    { autologin: false, subs: "{}", monitorEnabled: false },
    function(items) {
      document.getElementById(enableAutologinNodeId).checked = items.autologin;
      let monitorInput = document.getElementById(enableMonitorNodeId);
      monitorInput.checked = items.monitorEnabled;
        var event = document.createEvent("HTMLEvents");
        event.initEvent('change', false, true);
        monitorInput.dispatchEvent(event);
      let parsedJs = JSON.parse(items.subs);
      getSubsItems().forEach(function(currValue) {
        currValue.checked = parsedJs[currValue.id];
      });
    }
  );
};

// disable subs UI if global notification option is off
function disableInputs(newState){
    let nodes = document.getElementById(inputContainerId).getElementsByTagName('input');
    for(let i = 0; i < nodes.length; i++){
        nodes[i].disabled = newState;
    }
}
const toggleSubs = function(){
//    let inputContainer = 'pros-subs';
    let disabledClass = 'disabled-opt';
    if(document.getElementById(enableMonitorNodeId).checked){
        document.getElementById(inputContainerId).classList.remove(disabledClass);
        disableInputs(false);
    } else {
        document.getElementById(inputContainerId).classList.add(disabledClass);
        disableInputs(true);
    }
}



// main flow
// restore options
document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener('DOMContentLoaded', toggleSubs);
// trigger saving on any change
document.getElementById(enableAutologinNodeId).addEventListener('click', saveOptions);
document.getElementById(enableMonitorNodeId).addEventListener('click', saveOptions);
document.getElementById(enableMonitorNodeId).addEventListener('change', toggleSubs);

getSubsItems().forEach(function(currValue){
    currValue.addEventListener('click', saveOptions);
});

