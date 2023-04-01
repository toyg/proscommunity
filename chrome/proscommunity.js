const prjCode = "PrOSCommunity";

// autologin support
chrome.storage.sync.get({ autologin: false },
    function(items) {
        if(items.autologin == true){
            let loginNodes = document.getElementsByClassName("login-link");
            if(loginNodes[0] != null) loginNodes[0].click();
        }
    });

// filter answered posts
var enableFilterReplied = false;
function enable(){
    enableFilterReplied = true;
}

function disable(){
    enableFilterReplied = false;
}

function elaborate() {
    let selector = "div.message-list > article";
    if(!window.location.href.includes("/Forums/")) selector = "div.custom-message-list > section > article";

    let articles = document.querySelectorAll(selector);
    let hiddenScore = 0;
    articles.forEach(n => {
        if(n.querySelector("li.custom-tile-replies > b").innerText === "0"){
            n.classList.add("pros-zeroreply");
        } else {
            if(enableFilterReplied == true){
               n.style.display = "none";
               hiddenScore++;
            } else {
                n.style.display = "flex";
            }
        };
        if(n.querySelector("i.custom-thread-solved")) {
            n.classList.add("pros-solved");
        };
        if(Number.parseInt(n.querySelector("li.custom-tile-replies > b").innerText) >=5 ){
            n.classList.add("pros-hot");
        };
    });
    document.getElementById("hiddenScore").innerText = hiddenScore;
 }
let headerSelector = document.querySelector("header > div");

if(headerSelector != null){
    let cpNode = document.createElement('div');
    let controlPanelHtml = '<input type="checkbox" id="noRepliedToggle"> <label for="noRepliedToggle" class="pros-alwaysOn">Hide Replied</label>';
    controlPanelHtml += ' Hidden posts: <label id="hiddenScore" class="pros-alwaysOn">0</label>';
    cpNode.innerHTML = '<div style="position: relative; display: block; left: 50%;">' + controlPanelHtml + '</div>';
    headerSelector.appendChild(cpNode);
}

let noReplied = document.getElementById('noRepliedToggle');
if(noReplied != null){
    noReplied.addEventListener('change', function() {
        if (this.checked) {
            console.log(`[${prjCode}]: Hiding replied posts`);
            enable();
        } else {
            console.log(`[${prjCode}]: Showing replied posts`);
            disable();
        }
    });
    window.setInterval(elaborate, 1000);
};