/* add back a small banner, to be consistent with other reskinned pages */
let topBar = document.querySelector("div.lia-quilt-row-header-bottom")
topBar.classList.remove("pros_banner_forum");
topBar.classList.add("pros_banner_home");
let newWelcome = document.createElement("div");
newWelcome.classList.add("pros_newWelcome");
newWelcome.appendChild(document.createTextNode("Welcome Back to OneCommunity!"));
topBar.appendChild(newWelcome);

let navbar = document.querySelector("div.lia-quilt-column-side-content");
let newBox = makeSideBarBox();

let div1 = document.createElement("div")
let div2 = document.createElement("div")
let spanTitle = document.createElement("span")
div1.classList.add("lia-panel-heading-bar-wrapper")
div2.classList.add("lia-panel-heading-bar")
spanTitle.classList.add("lia-panel-heading-bar-title")
spanTitle.innerText = "Quick Links"
div2.appendChild(spanTitle);
div1.appendChild(div2);
newBox.appendChild(div1);

let ul = document.createElement("ul");
ul.classList.add("pros-homeul");
links = [
    ["Forums", "https://community.onestreamsoftware.com/t5/Forums/ct-p/your-community"],
    ["Partners", "https://community.onestreamsoftware.com/t5/Partners/ct-p/Partner"],
    ["News", "https://community.onestreamsoftware.com/t5/News-Views/ct-p/NewsAndViews"],
    ["Groups", "https://community.onestreamsoftware.com/t5/Groups/ct-p/Advanced"],
    ["Resources", "https://community.onestreamsoftware.com/t5/Resources/ct-p/Bulletins"]
]
links.forEach(link => {
    let newLi = document.createElement("li");
    newLi.classList.add("pros-homelink");
    let newA = makeLink(link[0], link[1]);
    newA.classList.add("pros-link-" + link[0].toLowerCase());
    newLi.appendChild(newA);
    ul.appendChild(newLi);
})
newBox.appendChild(ul);
navbar.insertBefore(newBox, navbar.firstChild);


