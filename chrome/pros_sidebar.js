let navbar = document.querySelector("div.custom-tiled-node-navigation");
let column = document.querySelector("div.lia-quilt-column-alley-right");

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

let newBox = makeSideBarBox();
newBox.querySelector("div.lia-decoration-border-content").firstChild.appendChild(navbar);
column.insertBefore(newBox, column.firstChild);
document.querySelector("div.lia-quilt-row-main-top").remove();