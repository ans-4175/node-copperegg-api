url          = require 'url'
path         = require 'path'
rewire       = require 'rewire'
coppereggApi = rewire '../lib/copperegg'

describe "Node CopperEgg API Tests", ->
    makeUrl = (pathname) ->
        decodeURIComponent(
            url.format
                protocol: 'http:'
                hostname: 'localhost'
                port: 8080
                pathname: path.join 'api/v99', pathname)

    userApiToken = 'user-api-token'


    beforeEach ->
        @ceApi = new coppereggApi.CopperEggApi 'http://localhost:8080/api/v99', userApiToken
        spyOn @ceApi, 'request'
        @cb = jasmine.createSpy 'callback'

    it "Sets basic authentication", ->
        options =
            auth =
              user: userApiToken
              pass: 'U'
        @ceApi.doRequest options, @cb
        expect(@ceApi.request)
            .toHaveBeenCalledWith(options, jasmine.any(Function))

    it "Gets alerts list", ->
        options =
            uri: makeUrl "alerts/issues.json"
            method: 'GET'
            auth:
              user: userApiToken
              pass: 'U'

        @ceApi.getAlerts @cb
        expect(@ceApi.request)
            .toHaveBeenCalledWith(options, jasmine.any(Function))

        # Unauthenticated
        @ceApi.request.mostRecentCall.args[1] null, statusCode: 401, 'HTTP Basic: Access denied.'
        expect(@cb).toHaveBeenCalledWith(
            '401: HTTP Basic: Access denied.')

        # Successful Request
        @ceApi.request.mostRecentCall.args[1] null, statusCode: 200, '{"hello":"world"}'
        expect(@cb).toHaveBeenCalledWith(null, hello: 'world')
