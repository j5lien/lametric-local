# LaMetric Local 1.0.1

An asynchronous client library for the [API of LaMetric Time](http://lametric-documentation.readthedocs.io/en/latest/reference-docs/lametric-time-reference.html) devices in local network. 

```javascript
const LaMetricLocal = require('lametric-local');

const client = new LaMetricLocal({
  base_url: '',
  basic_authorization: ''
});

client.getWifiState()
  .then(console.log)
  .catch(console.error);
```

## Installation

`npm install lametric-local`

You will need to retrieve your basic authorization and internal ip (port is `8080`). You can follow instructions [here](http://lametric-documentation.readthedocs.io/en/latest/reference-docs/device-authorization.html). 

```javascript
const LaMetricLocal = require('lametric-local');

const client = new LaMetricLocal({
  base_url: 'http://<internal ip>:8080',
  basic_authorization: '<basic authorization>'
});
```

## Requests

### With endpoints

You now have the ability to make GET, POST, PUT and DELETE requests against the API via the convenience methods.

```javascript
client.get(path, params);
client.post(path, params);
client.put(path, params);
client.delete(path, params);
```

You simply need to pass the endpoint and parameters to one of convenience methods. Take a look at the [documentation site](http://lametric-documentation.readthedocs.io/en/latest/reference-docs/device-endpoints.html) to reference available endpoints.

```javascript
client.get('device');
```

### With client methods

You can use the defined client methods to call endpoints.

```javascript
client.getDeviceState();
```

## Promises

The request will return Promise.


```javascript
client.getDeviceState()
  .then(function (data) {
    console.log(data)
  })
  .catch(function (e) {
    throw e;
  });
```
