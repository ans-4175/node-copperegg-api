# JavaScript CopperEgg API for Node.js

[![Build Status](https://travis-ci.org/denyago/node-copperegg-api.svg?branch=master)](https://travis-ci.org/denyago/node-copperegg-api)


A node.js module, which provides an object oriented wrapper for the JIRA REST API.

CopperEgg REST API documentation can be found [here](http://dev.copperegg.com/)

## Installation

  Install with the node package manager [npm](http://npmjs.org):

    $ npm install node-copperegg-api


## Example

  ```js
  ce = require('./lib/copperegg');
  ceClient = new ce.CopperEggApi('user-api-token');

  ceClient.getAlerts(function(error, issues) {
    console.log(issues);
  })
  ```
