const prjCode = "PrOSCommunity";

console.log(`[${prjCode}] Booting...`);

// setup offscreen page to use DOM Parser (screw you, Google)
chrome.offscreen.createDocument({
    url: chrome.runtime.getURL('offscreen.html'),
    reasons: [chrome.offscreen.Reason.DOM_PARSER],
    justification: 'fetching rss to check for new posts',
}).catch((err) => {} ) // if we have it already, skip

// keep a ping going every 25 seconds to keep the service up
setInterval(() => {
    chrome.runtime.sendMessage(JSON.stringify({"action": "PING"}));
}, 25000);

// wrap all flow in an async function to satisfy Chrome developer's wankery
async function run() {

var lastChecked = null;
var isMonitorEnabled = false;
var subsList = [];

const baseUrl = "https://community.onestreamsoftware.com/t5/"
const rssUrl = "https://community.onestreamsoftware.com/otqon28567/rss/Category?category.id=your-community&interaction.style=forum"

// DEBUG uncomment this to test notifications
//chrome.storage.sync.set({lastChecked: "2022-10-16T17:39:10Z"});
// END DEBUG

// retrieve last-checked timestamp
const initLastChecked = chrome.storage.sync.get(["lastChecked"]).then((options) => {
    try{
        let lcTimestamp = new Date(Date.parse(options.lastChecked));
        if(lcTimestamp.toString() != "Invalid Date") lastChecked = lcTimestamp;
    }catch(error){}
    }
);

// retrieve options
function refreshOptions(options){
    isMonitorEnabled = options.monitorEnabled;
    try {
        let subsObj = JSON.parse(options.subs);
        // subsObj -> {"Rules": true, ...}
        // looping through properties with .entries returns arrays: [ ["Rules", true], ...]
        // so we filter the enabled ones, then retrieve their names and attach each of them to baseUrl
        subsList = Object.entries(subsObj).filter(x => {return x[1]}).map(x => {return baseUrl + x[0]});
   } catch(err){

   }
}
const initMonitor = chrome.storage.sync.get(["monitorEnabled", "subs"]).then((options) => {
   refreshOptions(options);
});

// init
await initLastChecked;
await initMonitor;

/* create an alarm, then attach our recurring action to it */

// Check every x minutes
chrome.alarms.create({delayInMinutes: 1, periodInMinutes: 30});
console.log(`[${prjCode}] monitor enabled: ${isMonitorEnabled}`);
console.log(`[${prjCode}] monitor last checked: ${lastChecked}`);

//if(isMonitorEnabled == true) {
    chrome.alarms.onAlarm.addListener(() => {
        // we always refresh options before actually fetching and filtering
        chrome.storage.sync.get(["monitorEnabled", "subs"]).then((options) => {
            refreshOptions(options);
            console.log(`[${prjCode}] monitor enabled: ${isMonitorEnabled}`);
            console.log(`[${prjCode}] monitor last checked: ${lastChecked}`);
            if(isMonitorEnabled){
                // send message to offscreen page to trigger fetching
                chrome.runtime.sendMessage(JSON.stringify(
                    {"action": "RUN",
                    "lastChecked": lastChecked.toString(),
                    "subs": subsList}
                ));
                // update lastChecked
                chrome.storage.sync.set({lastChecked: Date().toString()});
            }
        })
    });
//}

}

// if receiving a message, fire a notification
chrome.runtime.onMessage.addListener((msg) => {
    let options = {}
    try{
        options = JSON.parse(msg);
    }catch(err) {

    }
    switch(options.action){
        case "PONG":
            // ignore
            break;
        case "NEW_POSTS":
            // notification firing
            chrome.notifications.create("newposts", {
              type: "basic",
              iconUrl: chrome.runtime.getURL("images/pros48.png"),
              title: "New OS threads",
              message: "There are new posts on your OneCommunity boards!"
            });
            // when clicking on the popup, user must be sent to forums
            chrome.notifications.onClicked.addListener(function(notificationId) {
                chrome.tabs.create({url: options.data});
                chrome.notifications.clear(notificationId);
            });
            break;
        default:
            console.log("weird message", msg);
    };

})

run();