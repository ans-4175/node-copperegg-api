var path = require('path'),
  url = require('url'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  sugar = require('sugar'),
  format = require('util').format,
  logger = console;

var CopperEggApi = exports.CopperEggApi = function(apiToken, verbose) {
  'use strict';

  this.baseUrl = url.parse('https://api.copperegg.com/v2');
  this.apiToken = apiToken;
  // This is so we can fake during unit tests
  this.request = require('request');
  if (verbose !== true) {
    logger = {
      log: function() {
        return null;
      }
    };
  };

  this.makeUri = function(pathname) {
    var uri = url.format({
      protocol: this.baseUrl.protocol,
      hostname: this.baseUrl.hostname,
      port: this.baseUrl.port,
      pathname: path.join(this.baseUrl.pathname, pathname)
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
  this.getAlerts = function(callback) {
    var options = {
      uri: this.makeUri('alerts/issues.json'),
      method: 'GET'
    };

    this.doRequest(options, function(error, response, body) {
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
  //list all servers under your API
  this.getServers = function(callback) {
    var options = {
      uri: this.makeUri('revealcloud/systems.json'),
      method: 'GET'
    };

    this.doRequest(options, function(error, response, body) {
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
  //list server under your API with specific hostname
  this.getServer = function(hostname, callback) {
    var options = {
      uri: this.makeUri('revealcloud/systems.json'),
      method: 'GET'
    };

    this.doRequest(options, function(error, response, body) {
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

      var parsed = JSON.parse(body);
      var id = _.findIndex(parsed, function(server) {
        return server.a.n == hostname;
      });
      var ret = (id >= 0) ? parsed[id] : {};
      callback(null, ret);
    });
  };
  //list all servers health under your API
  this.getServersHealth = function(startTime, endTime, callback) {
    var that = this;
    var options = {
      uri: this.makeUri('revealcloud/systems.json'),
      method: 'GET'
    };

    this.doRequest(options, function(error, response, body) {
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
      var parsed = JSON.parse(body);
      var chunked = _.chunk(parsed, 20);
      var promises = [];
      _.each(chunked, function(chunk) {
        promises.push(that.getBulkHealths(chunk, startTime, endTime));
      })
      Promise.all(promises)
        .then(function(healths) {
          callback(null, _.flatten(healths));
        })
        .catch(function(e) {
          callback(e, null);
        })
    });
  };
  this.getBulkHealths = function(batch, startTime, endTime) {
    var that = this;
    var mapped = _.map(batch, function(el) {
      return el.uuid
    })
    var url = this.makeUri("revealcloud/samples.json?uuids=" + mapped.join(',') + "&sample_size=60&keys=c,m,i,d,l,l_u,r,s_f,h");
    if (startTime) url = format("%s&starttime=%s", url, startTime);
    if (endTime) url = format("%s&endtime=%s", url, endTime);
    var options = {
      uri: url,
      method: 'GET'
    };
    return new Promise(function(resolve, reject) {
      that.doRequest(options, function(error, response, body) {
        if (error) {
          reject(error);
          return;
        }

        if (response.statusCode !== 200) {
          reject(response.statusCode + ': ' + body);
          return;
        }

        if (body === undefined) {
          reject('Response body was undefined.');
          return;
        }
        var parsed = JSON.parse(body);
        _.each(parsed, function(info, n) {
          parsed[n].hostname = batch[n].a.n;
          parsed[n].label = batch[n].a.l;
        })
        resolve(parsed);
      });
    });
  };
  //list all servers health under your API
  this.getServerHealth = function(startTime, endTime, hostname, callback) {
    var that = this;
    var options = {
      uri: this.makeUri('revealcloud/systems.json'),
      method: 'GET'
    };

    this.doRequest(options, function(error, response, body) {
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
      var parsed = JSON.parse(body);
      var idx = _.findIndex(parsed, function(server) {
        return server.a.n == hostname;
      });
      if (idx >= 0) {
        that.getHealth(parsed[idx].uuid, startTime, endTime)
          .then(function(result) {
            callback(null, result);
          })
          .catch(function(e) {

          })
      } else {
        callback(null, {});
      }
    });
  };
  this.getHealth = function(uuid, startTime, endTime) {
    var that = this;
    var url = this.makeUri("revealcloud/samples.json?uuids=" + uuid + "&sample_size=60&keys=c,m,i,d,l,l_u,r,s_f,h");
    if (startTime) url = format("%s&starttime=%s", url, startTime);
    if (endTime) url = format("%s&endtime=%s", url, endTime);
    var options = {
      uri: url,
      method: 'GET'
    };
    return new Promise(function(resolve, reject) {
      that.doRequest(options, function(error, response, body) {
        if (error) {
          reject(error);
          return;
        }

        if (response.statusCode !== 200) {
          reject(response.statusCode + ': ' + body);
          return;
        }

        if (body === undefined) {
          reject('Response body was undefined.');
          return;
        }
        var parsed = JSON.parse(body);
        resolve(parsed);
      });
    });
  };
}).call(CopperEggApi.prototype);