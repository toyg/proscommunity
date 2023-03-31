const prjCode = "PrOSCommunity";

var enableFilterSolved = false;

let cpNode = document.createElement('div');
let controlPanelHtml = '<input type="checkbox" id="noRepliedToggle"> <label for="noRepliedToggle" class="pros-alwaysOn">Hide Replied</label>';
controlPanelHtml += ' Hidden posts: <label id="hiddenScore" class="pros-alwaysOn">0</label>';
cpNode.innerHTML = '<div style="position: relative; display: block; left: 50%;">' + controlPanelHtml + '</div>';
document.querySelector("header > div").appendChild(cpNode);

function enable(){
    enableFilterSolved = true;
}

function disable(){
    enableFilterSolved = false;
}

function elaborate() {
    let articles = document.querySelectorAll("div.message-list > article");
    let hiddenScore = 0;
    articles.forEach(n => {
        if(n.querySelector("li.custom-tile-replies > b").innerText === "0"){
            n.classList.add("pros-zeroreply");
        } else {
            if(enableFilterSolved == true){
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

document.getElementById('noRepliedToggle').addEventListener('change', function() {
  if (this.checked) {
    console.log(`[${prjCode}]: Hiding replied posts`);
    enable();
  } else {
    console.log(`[${prjCode}]: Showing replied posts`);
    disable();
  }
});

window.setInterval(elaborate, 1000);