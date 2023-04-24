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
    elaborate();
}

function disable(){
    enableFilterReplied = false;
    elaborate();
}

let headerSelector = document.querySelector("header > div");

if(headerSelector != null){
    let cpNode = document.createElement('div');
    let controlPanelHtml = '<input type="checkbox" id="noRepliedToggle"> <label for="noRepliedToggle" class="pros-alwaysOn">Hide Replied</label>';
    controlPanelHtml += ' Hidden posts: <label id="hiddenScore" class="pros-alwaysOn">0</label>';
    cpNode.innerHTML = '<div style="position: relative; display: block; left: 50%;">' + controlPanelHtml + '</div>';
    headerSelector.appendChild(cpNode);
}

function modNode(n) {
    if(n.querySelector("li.custom-tile-replies > b").innerText === "0"){
        n.classList.add("pros-zeroreply");
    } else {
        if(enableFilterReplied == true){
            n.style.display = "none";
            hiddenScore++;
        } else {
            n.style.display = "flex";
        };
    };
    if(n.querySelector("i.custom-thread-solved")) {
        n.classList.add("pros-solved");
    };
    if(Number.parseInt(n.querySelector("li.custom-tile-replies > b").innerText) >=5 ){
        n.classList.add("pros-hot");
    };
    if(n.querySelector("aside > div > strong > a").href.includes("idb-p")){
        n.classList.add("pros-ideas");
    };
};


function elaborate() {
    let selector = "div.message-list > article";
    if(!window.location.href.includes("/Forums/") && !window.location.href.endsWith("onestreamsoftware.com/")){
        selector = "div.custom-message-list > section > article";
    }
    let articles = document.querySelectorAll(selector);
    let hiddenScore = 0;
    articles.forEach(n => {
        modNode(n);
    });
    document.getElementById("hiddenScore").innerText = hiddenScore;
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
    // first run
    elaborate();
};

// Select the node that will be observed for mutations
const targetNode = document.querySelector("div.message-list");

if(targetNode) {
    // Options for the observer (which mutations to observe)
    const config = { attributes: false, childList: true, subtree: false };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach(n => {
                    if(n.nodeName.toLowerCase() == "article") {
                        modNode(n);
                    }
                })
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    // Later, you can stop observing
    //observer.disconnect();
}
