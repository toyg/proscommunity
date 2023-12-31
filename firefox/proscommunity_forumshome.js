let navbar = document.querySelector("div.custom-tiled-node-navigation");
let column = document.querySelector("div.lia-quilt-column-alley-right");
let newBox = column.querySelector("div.KudoedAuthorsLeaderboardTaplet").cloneNode(true);
newBox.querySelector("div.lia-panel-heading-bar-wrapper").remove();
newBox.querySelector("div.lia-panel-content-wrapper").remove();
newBox.querySelector("div.lia-decoration-border-content").firstChild.appendChild(navbar);
column.insertBefore(newBox, column.firstChild);
document.querySelector("div.lia-quilt-row-main-top").remove();