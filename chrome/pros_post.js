// cache labels, so they will display correctly on summary pages
let url = location.href.split('#')[0];
if(!isSummaryPage()) cacheLabels(url, window.document);