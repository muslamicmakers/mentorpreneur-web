function AnalyticsController() {
  this.trackingId = 'UA-150096879-1';
  this.initGA();
}

AnalyticsController.prototype.initGA = function() {
  var GA_LOCAL_STORAGE_KEY = 'ga:clientId';
  ga('create', this.trackingId, {
    'storage': 'none',
    'clientId': localStorage.getItem(GA_LOCAL_STORAGE_KEY)
  });
  ga(function(tracker) {
    localStorage.setItem(GA_LOCAL_STORAGE_KEY, tracker.get('clientId'));
  });
  this.trackPageView();
};

AnalyticsController.prototype.trackPageView = function() {
  ga('send', 'pageview');
};

AnalyticsController.prototype.trackEvent = function(eventCategory, eventAction, eventLabel) {
  ga('send', {
    hitType: 'event',
    transport: 'beacon',
    eventCategory: eventCategory,
    eventAction: eventAction,
    eventLabel: eventLabel
  });
};

/************************
 *      INIT
 ************************/
(function(){
  if (window.localStorage) {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    window._analytics = new AnalyticsController();
  }
})();
