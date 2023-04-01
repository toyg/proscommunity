// Saves options to chrome.storage
const saveOptions = function() {
  let autologinValue = document.getElementById('autologin').checked;
  chrome.storage.sync.set(
    { autologin: autologinValue },
    function() {
      // Update status to let user know options were saved.
      let status = document.getElementById('status');
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
  chrome.storage.sync.get(
    { autologin: false },
    function(items) {
      document.getElementById('autologin').checked = items.autologin;
    }
  );
};
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('autologin').addEventListener('click', saveOptions);
