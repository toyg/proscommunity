// Saves options to chrome.storage
const saveOptions = function() {
  let autologinValue = document.getElementById('pros-autologin').checked;
  browser.storage.sync.set({ autologin: autologinValue }).then(
    function() {
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
    { autologin: false },
    function(items) {
      document.getElementById('pros-autologin').checked = items.autologin;
    }
  );
};
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('pros-autologin').addEventListener('click', saveOptions);
