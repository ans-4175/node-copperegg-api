var path  = require('path'),
  url     = require('url'),
  logger  = console;

var CopperEggApi = exports.CopperEggApi = function (baseUrl, apiToken, verbose) {
  'use strict';

  this.baseUrl  = url.parse(baseUrl);
  this.apiToken = apiToken;
  // This is so we can fake during unit tests
  this.request  = require('request');
  if (verbose !== true) {
    logger = {
      log: function () { return null; }
    };
  };

  this.makeUri = function (pathname) {
    var uri = url.format({
        protocol: this.baseUrl.protocol,
        hostname: this.baseUrl.hostname,
        port:     this.baseUrl.port,
        pathname: path.join(this.baseUrl.pathname, pathname)
      });
    return decodeURIComponent(uri);
  };

  this.doRequest = function (options, callback) {
    options.auth = {
      'user': this.apiToken,
      'pass': 'U'
    };
    this.request(options, callback);
  };
};

(function () {
  'use strict';

  // ## Get list of issues on Alerts ##
  // ### Takes ###
  //
  // *  callback: for when it's done
  //
  // ### Returns ###
  //
  // *  error: string of the error
  // *  issue: an object of the issue
  //
  // [CopperEgg Doc](http://dev.copperegg.com/alerts/issues.html)
  this.getAlerts = function (callback) {
    var options = {
      uri: this.makeUri('alerts/issues.json'),
      method: 'GET'
    };

    this.doRequest(options, function (error, response, body) {
      if (error) {
        callback(error, null);
        return;
      }

      if (response.statusCode !== 200) {
        callback(response.statusCode + ': ' + body);
        return;
      }

      if (body === undefined) {
        callback('Response body was undefined.');
        return;
      }

      callback(null, JSON.parse(body));
    });
  };
}).call(CopperEggApi.prototype);
