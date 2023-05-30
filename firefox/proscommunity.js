const prjCode = "PrOSCommunity";

// autologin support

browser.storage.sync.get({ autologin: false },
    function(items) {
        if(items.autologin == true){
            let loginNodes = document.getElementsByClassName("login-link");
            if(loginNodes[0] != null) loginNodes[0].click();
        }
    });

// filter posts
var hiddenScore = 0;
var to_hide = {
    "replied": false
};

// enable or disable visibility for a category
function enable(quality){
    to_hide[quality] = true;
    elaborate();
}

function disable(quality){
    to_hide[quality] = false;
    elaborate();
}

// modify visibility of a post
function togglePost(node, hideIt){
    if(hideIt){
        if(node.style.display != "none") hiddenScore++;
        node.style.display = "none";
    } else {
        if((node.style.display != "flex") && (hiddenScore > 0)) hiddenScore--;
        node.style.display = "flex";
    }
}

// manipulate node to add our classes and/or hide it
function modNode(n) {
    if(n.querySelector("i.custom-thread-solved")) {
        n.classList.add("pros-solved");
    };
    if(Number.parseInt(n.querySelector("li.custom-tile-replies > b").innerText) >=5 ){
        n.classList.add("pros-hot");
    };
    if(n.querySelector("aside > div > strong > a").href.includes("idb-p")){
        n.classList.add("pros-ideas");
    };
    let postMustBeHidden =  to_hide[getPostCategory(n)];
    if(n.querySelector("li.custom-tile-replies > b").innerText === "0"){
        n.classList.add("pros-zeroreply");
    } else {
        postMustBeHidden |= to_hide['replied'];
    }
    togglePost(n, postMustBeHidden);

    document.getElementById("hiddenScore").innerText = hiddenScore;
};

// detect if page is a "summary" one, which are often treated differently
function isSummaryPage(){
    let pageUrl = new URL(window.location.href);

    return pageUrl.pathname.includes("/Forums/") ||
                pageUrl.pathname.includes("/Partners/") ||
                pageUrl.pathname.includes("/Solution-Exchange/") ||
                pageUrl.pathname === "/";
}

// get all posts on the page
function listPosts(){
    let selector = "div.message-list > article";
    // summary pages have a different structure
    if(!isSummaryPage()){
        selector = "div.custom-message-list > section > article";
    }
    return document.querySelectorAll(selector);
}

// get the category (i.e. board) of a post
function getPostCategory(post){
    return post.querySelector("div.custom-tile-category > strong > a").innerText;
}

// work on all nodes
function elaborate() {
    let articles = listPosts();
    articles.forEach(n => {
        modNode(n);
    });
 }

// build list of hideable categories, by looking at available nodes
function buildHideable(){
    let articles = listPosts();
    let postTypes = new Set();
    articles.forEach(a => {
       postTypes.add( getPostCategory(a) );
    })
    postTypes.forEach(t => {
        to_hide[t] = false;
    })
}

// build control to hide/show a category
function addControl(key, listNode){
    let inputNode = document.getElementById('toggle-' + key);
    if(!inputNode) {
        let liNode = document.createElement("li");
        liNode.className = 'pros-hide-control';
        liNode.innerHTML = '<input type="checkbox" id="toggle-' + key + '">' +
                            ' <label for="toggle-' + key + '" class="pros-alwaysOn">' +key+ '</label>';
        listNode.appendChild(liNode);
        inputNode = liNode.querySelector('input');
    }
    inputNode.addEventListener('change', function() {
        if (this.checked) {
            console.log(`[${prjCode}]: Hiding ${key} posts`);
            enable(key);
        } else {
            console.log(`[${prjCode}]: Showing ${key} posts`);
            disable(key);
        }
    })
}

// main flow
let headerSelector = document.querySelector("header");

if(headerSelector != null){
    let cpNode = document.createElement('section');
    cpNode.className = 'hideControlSection';
    let controlPanelHtml = 'Hidden posts: <label id="hiddenScore" class="pros-alwaysOn">0</label>. Hide more by selecting topics:' +
        '<br/><ul id="hideControls">' +
        '<li class="pros-hide-control"><input type="checkbox" id="toggle-replied">' +
        ' <label for="toggle-replied" class="pros-alwaysOn">Replied</label></li>' +
        '</ul>';
    cpNode.innerHTML = controlPanelHtml;
    headerSelector.insertAdjacentElement("afterend", cpNode);
}
if(isSummaryPage()){
    buildHideable();
}

let hideList = document.getElementById("hideControls")

Object.keys(to_hide).sort().forEach(key => {
    addControl(key, hideList);
});
elaborate();

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
                        let postCat = getPostCategory(n);
                        if(!to_hide.hasOwnProperty(postCat)){
                            to_hide[postCat] = false;
                            addControl(postCat, hideList);
                        }
                        modNode(n);
                    }
                })
                // rearrange sorted list
                let list = document.querySelector('#hideControls');
                [...list.children]
                      .sort((a,b)=>a.innerText>b.innerText?1:-1)
                      .forEach(node=>list.appendChild(node));

                // keep Replied first
                let repl = list.querySelector("#toggle-replied").parentElement;
                list.removeChild(repl);
                list.insertBefore(repl, list.children[0]);
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
