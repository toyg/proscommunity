var lastChecked = null;
var isMonitorEnabled = false;
var subsList = [];

const baseUrl = "https://community.onestreamsoftware.com/t5/"
const rssUrl = "https://community.onestreamsoftware.com/otqon28567/rss/Category?category.id=your-community&interaction.style=forum"

//// DEBUG to force notifications
//browser.storage.sync.set({lastChecked: new Date(Date.parse("2022-10-16T17:39:10Z"))});
//// END DEBUG

// retrieve last-checked timestamp
const initLastChecked = browser.storage.sync.get(["lastChecked"]).then((options) => {
try{
  let lcTimestamp = new Date(Date.parse(options.lastChecked));
  if(lcTimestamp.toString() != "Invalid Date") lastChecked = lcTimestamp;
  }catch(error){}
});

// retrieve options
function refreshOptions(options){
    isMonitorEnabled = options.monitorEnabled;
    let subsObj = JSON.parse(options.subs);
    // subsObj -> {"Rules": true, ...}
    // looping through properties with .entries returns arrays: [ ["Rules", true], ...]
    // so we filter the enabled ones, then retrieve their names and attach each of them to baseUrl
    subsList = Object.entries(subsObj).filter(x => {return x[1]}).map(x => {return baseUrl + x[0]});
}
const initMonitor = browser.storage.sync.get(["monitorEnabled", "subs"]).then((options) => {
   refreshOptions(options);
});

// init
await initLastChecked;
await initMonitor;

/* create an alarm, then attach our recurring action to it */

// Check every 30 minutes
browser.alarms.create({periodInMinutes: 30});
console.log("[PROSCommunity] monitor enabled: " + isMonitorEnabled);
console.log("[PROSCommunity] monitor last checked: " + lastChecked);

if(isMonitorEnabled == true) {
 browser.alarms.onAlarm.addListener(() => {
    // we always refresh options before actually fetching and filtering
    browser.storage.sync.get(["monitorEnabled", "subs"]).then((options) => {
     refreshOptions(options);
     if(isMonitorEnabled){
        fetch(rssUrl).then(
            r => r.text()
        ).then(xml => {
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
                        // fire alarm
                        browser.notifications.create("newposts", {
                          type: "basic",
                          iconUrl: browser.extension.getURL("images/pros48.png"),
                          title: "New OS threads",
                          message: "There are new posts on your OneCommunity boards!"
                        });
                        browser.notifications.onClicked.addListener(function(notificationId) {
                            //Open a new tab with the desired URL:
                            browser.tabs.create({url: forumLink});
                        });
                        // break
                        break;
                    }
                }
            }
            browser.storage.sync.set({lastChecked: Date().toString()})
        })
        .catch(function(err) {
            console.log('Failed to fetch page: ', err);
        });
     }
    })
 });
}