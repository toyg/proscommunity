

browser.alarms.create({periodInMinutes: 1});

browser.alarms.onAlarm.addListener(() => {
    console.log("launching req");
    fetch('https://community.onestreamsoftware.com/t5/notificationfeed/page').then(
        r => r.text()
    ).then(
        html => {
        console.log("inside")

            // Initialize the DOM parser
        var parser = new DOMParser();

        // Parse the text
        var doc = parser.parseFromString(html, "text/html");
        let userImg = doc.querySelector(".lia-user-avatar-message");

        console.log(doc);
    })
    .catch(function(err) {
        console.log('Failed to fetch page: ', err);
    });



});