url          = require 'url'
rewire       = require 'rewire'
coppereggApi = rewire '../lib/copperegg'

describe "Node CopperEgg API Tests", ->
    makeUrl = ->
        decodeURIComponent(
            url.format
                protocol: 'http:'
                hostname: 'localhost'
                port: 80)

    userApiToken = 'user-api-token'


    beforeEach ->
        @ceApi = new coppereggApi.CopperEggApi 'http://localhost:8080/', userApiToken
        spyOn @ceApi, 'request'
        @cb = jasmine.createSpy 'callback'

    it "Sets basic auth if oauth is not passed in", ->
        options =
            auth =
              user: userApiToken
              pass: 'U'
        @ceApi.doRequest options, @cb
        expect(@ceApi.request)
            .toHaveBeenCalledWith(options, jasmine.any(Function))
