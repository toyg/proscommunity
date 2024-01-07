/* add back a small banner, to be consistent with other reskinned pages */
let topBar = document.querySelector("div.lia-quilt-row-header-bottom")
topBar.classList.remove("pros_banner_forum");
topBar.classList.add("pros_banner_home");
let newWelcome = document.createElement("div");
newWelcome.classList.add("pros_newWelcome");
newWelcome.appendChild(document.createTextNode("Welcome Back to OneCommunity!"));
topBar.appendChild(newWelcome);
