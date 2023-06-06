// gets elements in the page that deal with subscriptions
function getSubsItems(){
  return document.querySelectorAll(".subforum");
}

// Saves options to chrome.storage
const saveOptions = function() {
  // retrieve current values
  let autologinValue = document.getElementById('pros-autologin').checked;
  let subs = {};
  getSubsItems().forEach(function(currValue){
      subs[currValue.id] = currValue.checked;
  })
  // trigger saving
  browser.storage.sync.set({
        autologin: autologinValue,
        subs: JSON.stringify(subs)
    }).then( function() {
      // Update status to let user know options were saved.
      let status = document.getElementById('pros-optionstatus');
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
    { autologin: false, subs: "{}" },
    function(items) {
      document.getElementById('pros-autologin').checked = items.autologin;
      let parsedJs = JSON.parse(items.subs);
      getSubsItems().forEach(function(currValue) {
        currValue.checked = parsedJs[currValue.id];
      });
    }
  );
};
// main flow
// restore options
document.addEventListener('DOMContentLoaded', restoreOptions);
// trigger saving on any change
document.getElementById('pros-autologin').addEventListener('click', saveOptions);
getSubsItems().forEach(function(currValue){
    currValue.addEventListener('click', saveOptions);
})
