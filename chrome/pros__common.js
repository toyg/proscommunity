const prjCode = "PrOSCommunity";

const baseUrl = "https://community.onestreamsoftware.com";

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

// cache labels
function buildCacheId(urlHash){
    return `cache_${urlHash}`;
}
function cacheLabels(url, domDocument){
    let urlHash = hashCode(url);
    let thisCacheId = buildCacheId(urlHash);
    let lls = domDocument.querySelectorAll("li.label");
    let values = [].map.call(lls, (node) => {
        return node.innerText.trim();});
    // set in page cache (this could be in storage.session maybe...)
    postFetchMap[urlHash] = values;
    // set in local storage to use on page reload
    chrome.storage.local.set(
        {[`${thisCacheId}`]: JSON.stringify(values)});
    return values;
}

// detect if page is a "summary" one, which are often treated differently
function isSummaryPage(){
    let pageUrl = new URL(window.location.href);

    return pageUrl.pathname.includes("/Forums/") ||
                pageUrl.pathname.includes("/Partners/") ||
                pageUrl.pathname.includes("/Solution-Exchange/") ||
                pageUrl.pathname === "/";
}

// create lateral box
function makeSideBarBox(){
    let top = document.createElement("div");
    classes = "lia-panel lia-panel-standard Chrome".split(" ");
    for(klass in classes) top.classList.add(classes[klass]);
    let mid = document.createElement("div");
    mid.classList.add("lia-decoration-border");
    let klasses = ["lia-decoration-border-top", "lia-decoration-border-content", "lia-decoration-border-bottom"];
    for(k in klasses ){
        let b = document.createElement("div");
        b.classList.add(klasses[k]);
        b.appendChild(document.createElement("div"));
        mid.appendChild(b);
    }
    top.appendChild(mid)
    return top;
}

// create links
function makeLink(text, url){
    let node = document.createElement("a");
    node.setAttribute("href", url);
    node.appendChild(document.createTextNode(text));
    return node;
}

/* because of the late re-layouting, anchor-jumping breaks when the extension is on.
 So we detect anchors in URLs and jump back to it. Use at the end of operations. */
function reJumpToAnchor(){
    let u = new URL(window.location.href);
    if(u.hash){
        location.href = u.hash;
        history.replaceState(null,null,u);
    }
}
// autologin support
chrome.storage.sync.get({ autologin: false },
    function(items) {
        if(items.autologin == true){
            let loginNodes = document.getElementsByClassName("login-link");
            if(loginNodes[0] != null) loginNodes[0].click();
        }
    });

// compact top banner
let topLogo = document.querySelector("div.logo-icons-left");
topLogo.remove();
let target = document.querySelector("div.logo-icons-top-header");
target.insertBefore(topLogo, target.firstChild);
document.querySelector("div.lia-quilt-row-header-bottom").classList.add("pros_banner_forum");

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
reJumpToAnchor();

