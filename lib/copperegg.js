var url  = require('url'),
  logger = console;

var CopperEggApi = exports.CopperEggApi = function(baseUrl, apiToken, verbose) {
  this.baseUrl  = url.parse(baseUrl);
  this.apiToken = apiToken;
  // This is so we can fake during unit tests
  this.request  = require('request');
  if (verbose !== true) { logger = { log: function() {} }; };

  this.makeUri = function(pathname) {
    var uri = url.format({
        pathname: pathname
    });
    return decodeURIComponent(uri);
  };

  this.doRequest = function(options, callback) {
    options.auth = {
      'user': this.apiToken,
      'pass': 'U'
    };
    this.request(options, callback);
  };
};

(function() {

  this.getAlerts = function(callback) {
    callback(null, {});
  }
});
