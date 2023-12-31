const prjCode = "PrOSCommunity";

const baseUrl = "https://community.onestreamsoftware.com";
const filteredBaseUrl = baseUrl + "/t5/forums/filteredbylabelpage/board-id/"

//browser.storage.local.clear();

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

function getMappedClassForBoard(msgUrl){
    let board = msgUrl.split("/")[2];
    switch(board){
        case "Application-Build":
            return "appbuild";
        case "Workflow-and-Data-Integration":
            return "wfdi";
        case "Rules":
            return "rules";
        case "Reporting":
            return "reporting";
        case "French-Language-Forum":
            return "french";
        case "MarketPlace":
            return "marketplace";
        case "OpenPlace":
            return "openplace";
        case "PartnerPlace":
            return "partnerplace";
        case "Financial-Close-Consolidation":
            return "ideaplatform";
            //return "ideafcc";
        case "Planning-Analysis":
            return "ideaplatform";
            //return "ideaplan";
        case "Advanced-Analytics":
            return "ideaplatform";
            //return "ideaadv";
        case "Productivity":
            return "ideaplatform";
            //return "ideaprod";
        case "Platform":
            return "ideaplatform";
        default:
            return "posticondefault";
    }
    
}

// labels downloader
var postFetchMap = {};
var fetchQueue = [];
var fetchQueueWait = 4000; // rate-limiter
function enqueue(url, node){
    let obj = {"url": arguments[0], "node": arguments[1]};
    if(!alreadyInQueue(url)){
        fetchQueue.push(obj);
    }
}
function dequeue(obj){
    var index = fetchQueue.indexOf(obj);
    if (index > -1) {
        fetchQueue.splice(index, 1);
    }
}
function alreadyInQueue(url){
    for(let i = 0; i <= fetchQueue.length; i++){
        if(fetchQueue[i] != undefined){
            if(fetchQueue[i].url == url) return true;
        }
    }
    return false;
}
// hashcode to keep track of stuff already downloaded
function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

var parser = new DOMParser();
function fetchLabels(job){
    let url = job.url;
    let targetNode = job.node;
    // define cache key and look it up
    let cacheId = "cache_" + hashCode(job.url);
    browser.storage.local.get(cacheId).then(
        (items) => {
            // returned "items" is always an object,
            // but without properties if key not found
            if(items.hasOwnProperty(cacheId)){
                // found values in cache
                addLabels(targetNode, JSON.parse(items[cacheId]));
            } else {
                // fetch remotely
                fetch(url).then((t) => {
                    if(t.status != 200){
                        throw new Error(t.status.toString());
                    }
                    return t.text()
                }).then(html => {
                    let doc = parser.parseFromString(html, "text/html");
                    let lls = doc.querySelectorAll("li.label");
                    let values = [].map.call(lls, (node) => {
                        return node.innerText.trim();});
                    // set in page cache (this could be in storage.session maybe...)
                    postFetchMap[hashCode(url)] = values;
                    // set in local storage to use on page reload
                    browser.storage.local.set(
                        {[`${cacheId}`]: JSON.stringify(values)});
                    dequeue(job);
                    addLabels(targetNode, values);
                }).catch(err => {
                    if(err == 429){
                        // rate limited, try again
                       setTimeout(fetchLabels, fetchQueueWait, job);
                    } else {
                       console.log(`[${prjCode}] Http error fetching labels`, err);
                    }
                });
            }
        },
        (error) => {
            console.log(`[${prjCode}] ERROR accessing local storage`, error);
        }
    )

}

function addLabels(node, labels){
    // remove loader
    let loader = node.querySelector("aside > img.pros-loader");
    if(loader != undefined) loader.remove();

    // check if we have labels at all
    if((typeof(labels) == "undefined") || labels.length == 0) return;

    // avoid doing the work again
    if(node.querySelector("ul.pros-labels") != undefined) return;

    // get URL of board, to be used later
    let boardUrl = node.querySelector("div.custom-tile-category > strong > a").getAttribute("href");
    let boardName = boardUrl.split("/").pop();

    // create the list
    let labelList = document.createElement("ul");
    labelList.classList.add("pros-labels");
    for(label in labels){
        let li = document.createElement("li");
        let a = document.createElement("a");
        a.setAttribute("href", filteredBaseUrl + boardName + "/label-name/" + encodeURIComponent(labels[label]))
        a.appendChild(document.createTextNode(labels[label]));
        li.appendChild(a);
        labelList.appendChild(li);
    }
    let sep = document.createTextNode(" | ");
    // at end of line

    let prevDiv = node.querySelector("div.custom-tile-category");
    prevDiv.insertAdjacentElement('afterend', labelList);
    prevDiv.parentNode.insertBefore(sep, labelList);

    // at beginning of line
//    let timeDiv = node.querySelector("div.custom-tile-date");
//    timeDiv.parentNode.insertBefore(sep, timeDiv);
//    timeDiv.parentNode.insertBefore(labelList, sep);

}

// loader for label-fetching
function createLoader(){
        let loader = document.createElement("img");
        loader.setAttribute("src", chrome.runtime.getURL("/images/loading.gif"));
        loader.classList.add("pros-loader");
        loader.setAttribute("height", "12");
        return loader;
}

// manipulate node to add our classes and/or hide it
function modNode(n) {
    let postLink = n.querySelector("div > h3 > a").getAttribute("href");
    if(postLink.startsWith("/")) postLink = baseUrl + postLink;
    let urlHash = hashCode(postLink);
    // if we have labels, place them
    if(urlHash in postFetchMap) {
        // add labels
        addLabels(n, postFetchMap[urlHash].labels);
    } else if(!alreadyInQueue(postLink)){
        // we don't have labels, so we queue a fetch request
        enqueue(postLink, n);
        n.querySelector("aside").insertBefore(
            createLoader(),
            n.querySelector("div.custom-tile-date")
        );
    }

    // icon stuff
    let postUrl = n.querySelector("h3 > a").getAttribute("href");
    n.classList.add(getMappedClassForBoard(postUrl));

    // general highlighting
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
     processQueue();
 }

 // process queue of label-fetching jobs
 function processQueue(){
    let delay = 1000;
    fetchQueue.forEach(job => {
        setTimeout(fetchLabels, delay, job);
        delay += 1000;
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
    if(!listNode) return;
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
        processQueue();
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    // Later, you can stop observing
    //observer.disconnect();
}

/* generic changes to all pages */

// compact top banner
let topLogo = document.querySelector("div.logo-icons-left");
topLogo.remove();
let target = document.querySelector("div.logo-icons-top-header");
target.insertBefore(topLogo, target.firstChild);

// move burger menu when collapsed already
function compactTopBar (e){
    let burger = document.querySelector("button.lia-slide-menu-trigger");
    let topBurger = document.querySelector("div.lia-slide-out-nav-menu");
    // first, move the burger icon
    burger.remove();
    document.querySelector("div.logo-icons-right").appendChild(burger);
    // then, check if it has to be visible or not
    if(topBurger.checkVisibility()){
        burger.style.display = "inline-block";
    } else {
        burger.style.display = "none";
    }
}
compactTopBar();
addEventListener("resize", compactTopBar);