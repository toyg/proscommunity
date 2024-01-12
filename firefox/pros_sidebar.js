if(isSummaryPage()) {
    let navbar = document.querySelector("div.custom-tiled-node-navigation");
    let column = document.querySelector("div.lia-quilt-column-alley-right");
    let newBox = makeSideBarBox();

    newBox.querySelector("div.lia-decoration-border-content").firstChild.appendChild(navbar);
    column.insertBefore(newBox, column.firstChild);
    document.querySelector("div.lia-quilt-row-main-top").remove();
}