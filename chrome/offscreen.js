/* DOMParser is not available in service workers,
so we use the offscreen page to use it.
This script will execute when triggered by a message.
*/

const rssUrl = "https://community.onestreamsoftware.com/otqon28567/rss/Category?category.id=your-community&interaction.style=forum";
const baseUrl = "https://community.onestreamsoftware.com/t5/"

async function main(options) {

    let lastChecked = Date.parse(options.lastChecked);
    let subsList = options.subs;
    const v = await fetch(rssUrl).then((t) => t.text()).then(xml => {
        // parse XML
        var parser = new DOMParser();
        var doc = parser.parseFromString(xml, "text/xml");
        // we don't check on first run, no point
        if(lastChecked !== null){
            // namespace machinery for xpath
            const nsResolver = doc.createNSResolver(
                doc.ownerDocument === null
                    ? doc.documentElement
                    : doc.ownerDocument.documentElement,
            );

            // prep forum link for notification
            let forumLinkNode = doc.evaluate("/rss/channel/link", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE);
            let forumLink = forumLinkNode.singleNodeValue.textContent;
            // check if posts exist after the recorded timestamp
            let posts = doc.evaluate("/rss/channel/item", doc, nsResolver, XPathResult.UNORDERED_NODE_ITERATOR_TYPE);
            let post = null;
            while(post = posts.iterateNext()){
                let postLink = post.getElementsByTagName("link")[0].textContent;
                let postDate = new Date( Date.parse(post.getElementsByTagName("pubDate")[0].textContent));
                if((postDate >= lastChecked) && subsList.some(boardUrl => postLink.startsWith(boardUrl))) {
                    chrome.runtime.sendMessage(
                        JSON.stringify(
                            {"action": "NEW_POSTS",
                            "data": forumLink}
                        )
                    );
                    break;
                }
            }
        }
    })
    .catch(function(err) {
        console.log('Failed to fetch page: ', err);
    });
}

// hook execution to receiving messages
chrome.runtime.onMessage.addListener(async (msg) => {
    let options = JSON.parse(msg);
    switch(options.action){
        case "PING":
            chrome.runtime.sendMessage(JSON.stringify({"action": "PONG"}));
            break;
        case "RUN":
            main(options);
            break;
        default:
            console.log("weird message", msg);
    };
});