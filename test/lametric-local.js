'use strict';

const assert = require('assert');
const nock = require('nock');
const LaMetricLocal = require('../lib/lametric');
const VERSION = require('../package.json').version;

describe('LaMetricLocal', function() {

  describe('Constructor', function() {
    let defaults = {};
    before(function() {
      defaults = {
        base_url: null,
        basic_authorization: null,
        api_version: 'v2',
        request_options: {
          headers: {
            Accept: '*/*',
            Connection: 'close',
            'Content-Type': 'application/json',
            'User-Agent': 'lametric-local/' + VERSION
          }
        }
      };
    });

    it('create new instance', function() {
      const client = new LaMetricLocal();
      assert(client instanceof LaMetricLocal);
    });

    it('auto constructs', function() {
      // eslint-disable-next-line new-cap
      const client = LaMetricLocal();
      assert(client instanceof LaMetricLocal);
    });

    it('has default options', function() {
      const client = new LaMetricLocal();
      assert.deepEqual(
        Object.keys(defaults),
        Object.keys(client.options)
      );
    });

    it('accepts and overrides options', function() {
      const options = {
        base_url: 'http://127.0.0.1:8080',
        power: 'Max',
        request_options: {
          headers: {
            'User-Agent': 'test'
          }
        }
      };

      const client = new LaMetricLocal(options);

      assert(client.options.hasOwnProperty('power'));
      assert.equal(client.options.power, options.power);

      assert.equal(client.options.base_url, options.base_url);

      assert.equal(
        client.options.request_options.headers['User-Agent'],
        options.request_options.headers['User-Agent']
      );
    });

    it('has pre-configured request object', function(next) {
      const client = new LaMetricLocal({
        base_url: 'http://127.0.0.1:8080',
        basic_authorization: '12345',
        request_options: {
          headers: {
            foo: 'bar'
          }
        }
      });

      assert(client.hasOwnProperty('request'));

      nock('http://127.0.0.1:8080').get('/').reply(200);
      client.request.get('http://127.0.0.1:8080/', function(error, response) {

        const headers = response.request.headers;

        assert(headers.hasOwnProperty('foo'));
        assert(headers.foo, 'bar');

        assert.equal(headers['User-Agent'], 'lametric-local/' + VERSION);
        assert(headers.hasOwnProperty('Authorization'));
        assert.equal(headers.Authorization, 'Basic 12345');

        next();
      });
    });
  });

  describe('Methods', function() {
    describe('__buildEndpoint()', function() {
      let client;
      const apiVersion = 'v1';

      before(function() {
        client = new LaMetricLocal({
          base_url: 'http://127.0.0.1:8080',
          api_version: apiVersion
        });
      });

      it('method exists', function() {
        assert.equal(typeof client.__buildEndpoint, 'function');
      });

      it('build url', function() {
        const path = 'device';

        assert.throws(
          client.__buildEndpoint,
          Error
        );

        assert.equal(
          client.__buildEndpoint(path),
          client.options.base_url + `/api/${apiVersion}/` + path
        );

        assert.equal(
          client.__buildEndpoint('/' + path),
          client.options.base_url + `/api/${apiVersion}/` + path
        );

        assert.equal(
          client.__buildEndpoint(path + '/'),
          client.options.base_url + `/api/${apiVersion}/` + path + '/'
        );

        assert.equal(
          client.__buildEndpoint(path),
          'http://127.0.0.1:8080/api/v1/device'
        );
      });
    });

    describe('__request()', function(){
      before(function(){
        this.nock = nock('http://127.0.0.1:8080');
        this.twitter = new LaMetricLocal({
          base_url: 'http://127.0.0.1:8080',
        });
      });

      it('accepts any 2xx response', function(done) {
        var jsonResponse = {id: 1, name: 'lametric'};
        this.nock.get(/.*/).reply(201, jsonResponse);
        this.twitter.__request('get', '/device')
          .then(data => {
            assert.deepEqual(data, jsonResponse);
            done();
          });
      });

      it('errors when there is an error object', function(done){
        var jsonResponse = {errors: ['nope']};
        this.nock.get(/.*/).reply(203, jsonResponse);
        this.twitter.__request('get', '/device')
          .catch(error => {
            assert.deepEqual(error, ['nope']);
            done();
          });
      });

      it('errors on bad json', function(done) {
        this.nock.get(/.*/).reply(200, 'fail whale');
        this.twitter.__request('get', '/device')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });

      it('allows an empty response', function(done){
        this.nock.get(/.*/).reply(201, '');
        this.twitter.__request('get', '/device')
          .then(data => {
            assert.deepEqual(data, {});
            done();
          });
      });

      it('errors when there is a bad http status code', function(done) {
        this.nock.get(/.*/).reply(500, '{}');
        this.twitter.__request('get', '/device')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });

      it('errors on a request or network error', function(done) {
        this.nock.get(/.*/).replyWithError('something bad happened');
        this.twitter.__request('get', '/device')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });
    });

    describe('get()', function() {
    });

    describe('post()', function() {
    });

    describe('put()', function() {
    });

    describe('delete()', function() {
    });
  });
});
