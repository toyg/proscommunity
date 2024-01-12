
const userLinkTpl = "https://community.onestreamsoftware.com/t5/forums/searchpage/tab/user?q="

/* reskin the notification list */
function reskin(){
    let feedItems = document.querySelectorAll("li.lia-notification-feed-item");

    feedItems.forEach( item => {
        // get stuff we'll need
        let classList = item.classList;
        let commenters = item.querySelectorAll("span.lia-user-login");
        let link = item.querySelector("a");
        let time = item.querySelector("span.DateTime");
        let textArea = item.querySelector("div.lia-quilt-column-alley-right");
        let anchorNode  = item.querySelector("div.lia-quilt-column-right");

        // set up some defaults
        let conjText = " reply by ";
        let newClass = "pros-reply";

        // change options depending on notification type
        if (classList.contains("lia-notification-kudos")){
            newClass = "pros-kudos";
            conjText = " kudos by ";
        } else if (classList.contains("lia-notification-mentions")) {
            // @ mentions
                newClass = "pros-mentions";
                conjText = " mention by ";
        } else if(classList.contains("lia-notification-solutions")) {
                newClass = "pros-solutions";
                conjText = " solved by ";
        } else if( classList.contains("lia-notification-topic")){
            // replies look similar for both forums and ideas...
            if( item.querySelector("span.lia-fa-idea") ) {
                // idea
                newClass = "pros-idea";
                conjText = " comment by ";
            }
        }

        // apply changes
        item.classList.add(newClass);
        textArea.childNodes.forEach(c => {textArea.removeChild(c)});
        textArea.appendChild(time);
        textArea.appendChild(link);
        textArea.appendChild(document.createTextNode(conjText));
        commenters.forEach(commenter => {
            if(commenter.textContent == "Your reply") {
                commenter.textContent = "YOU!";
            } else {
                let userLink = document.createElement("a");
                userLink.setAttribute("href", userLinkTpl + encodeURIComponent(commenter.textContent));
                userLink.textContent = commenter.textContent;
                commenter.textContent = "";
                commenter.appendChild(userLink);
            }
            textArea.appendChild(commenter);
            textArea.appendChild(document.createTextNode(", "));
        });
        // remove the last ", "
        if(commenters.length > 0) {
            textArea.removeChild(textArea.lastChild);
        }
        anchorNode.appendChild(textArea);

        // some nodes have extra rubbish, some don't...
        try {
            textArea.removeChild(item.querySelector("div.lia-notification-feed-timestamp"));
            textArea.removeChild(item.querySelector("br"));
        } catch(e){}
    })
    // delete the silly loader
    try {
        document.querySelector(".lia-lazy-load").remove();
    } catch(e){}
}
reskin();

/* repeat skinning if more notifications are loaded */

// Select the node that will be observed for mutations
const targetNodeNote = document.querySelector("#notificationList");

if(targetNodeNote) {
    // Options for the observer (which mutations to observe)
    const config = { attributes: false, childList: true, subtree: false };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === "childList") {
                // do the biz
                reskin();
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNodeNote, config);

    // Later, you can stop observing
    //observer.disconnect();
}
