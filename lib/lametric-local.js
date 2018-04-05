'use strict';

/**
 * Module dependencies
 */

const request = require('request');
const extend = require('deep-extend');

// Package version
const VERSION = require('../package.json').version;

function LaMetricLocal(options) {
  if (!(this instanceof LaMetricLocal)) {
    return new LaMetricLocal(options);
  }

  this.VERSION = VERSION;

  // Merge the default options with the client submitted options
  this.options = extend({
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
  }, options);

  let authentication_options = {};
  if (this.options.basic_authorization) {
    authentication_options = {
      headers: {
        Authorization: `Basic ${this.options.basic_authorization}`
      }
    };
  }

  // Configure default request options
  this.request = request.defaults(
    extend(
      this.options.request_options,
      authentication_options
    )
  );
}

LaMetricLocal.prototype.__buildEndpoint = function(path) {
  return this.options.base_url + '/api/' + this.options.api_version + ('/' === path.charAt(0) ? path : '/' + path);
};

LaMetricLocal.prototype.__request = function(method, path, params) {

  // Build the options to pass to our custom request object
  const options = {
    method: method.toLowerCase(),  // Request method - get || post
    url: this.__buildEndpoint(path) // Generate url
  };

  // Pass url parameters if get
  if ('get' === method) {
    options.qs = params;
  } else {
    options.body = JSON.stringify(params);
  }

  var _this = this;
  return new Promise(function(resolve, reject) {
    _this.request(options, function(error, response, data) {
      // request error
      if (error) {
        return reject(error);
      }

      // JSON parse error or empty strings
      try {
        // An empty string is a valid response
        data = '' === data ? {} : JSON.parse(data);
      } catch(parseError) {
        return reject(new Error('JSON parseError with HTTP Status: ' + response.statusCode + ' ' + response.statusMessage));
      }

      // response object errors
      // This should return an error object not an array of errors
      if (data.errors !== undefined) {
        return reject(data.errors);
      }

      // status code errors
      if(response.statusCode < 200 || response.statusCode > 299) {
        return reject(new Error('HTTP Error: ' + response.statusCode + ' ' + response.statusMessage));
      }

      // no errors
      resolve(data);
    });
  });
};

/**
 * GET
 */
LaMetricLocal.prototype.get = function(url, params) {
  return this.__request('get', url, params);
};

/**
 * POST
 */
LaMetricLocal.prototype.post = function(url, params) {
  return this.__request('post', url, params);
};

/**
 * POST
 */
LaMetricLocal.prototype.put = function(url, params) {
  return this.__request('put', url, params);
};

/**
 * DELETE
 */
LaMetricLocal.prototype.delete = function(url, params) {
  return this.__request('delete', url, params);
};

/**
 * Get API Version
 */
LaMetricLocal.prototype.getApiVersion = function() {
  return this.get('');
};

/**
 * Get Device State
 */
LaMetricLocal.prototype.getDeviceState = function(fields) {
  const params = {};
  if (fields) {
    params.fields = fields.join(',');
  }

  return this.get('device', params);
};

/**
 * Get List Of Apps
 */
LaMetricLocal.prototype.getApps = function() {
  return this.get('device/apps');
};

/**
 * Get Specific App Details
 */
LaMetricLocal.prototype.getApp = function(appPackage) {
  return this.get(`device/apps/${appPackage}`);
};

/**
 * Switch To Next App
 */
LaMetricLocal.prototype.switchToNextApp = function() {
  return this.put('device/apps/next');
};

/**
 * Switch To Previous App
 */
LaMetricLocal.prototype.switchToPreviousApp = function() {
  return this.put('device/apps/prev');
};

/**
 * Activate widget
 */
LaMetricLocal.prototype.activateWidget = function(appPackage, widgetId) {
  return this.put(`device/apps/${appPackage}/widgets/${widgetId}/activate`);
};

/**
 * Interact With Running Widget
 */
LaMetricLocal.prototype.interactWithWidget = function(appPackage, widgetId, actionId, params) {
  return this.post(`device/apps/${appPackage}/widgets/${widgetId}/actions`, {
    id: actionId,
    params: params || {}
  });
};

/**
 * Get Notification Queue
 */
LaMetricLocal.prototype.getNotificationQueue = function() {
  return this.get('device/notifications');
};

/**
 * Display Notification
 */
LaMetricLocal.prototype.pushNotification = function(model, priority, iconType, lifetime) {
  const params = {
    model
  };
  if (priority) {
    params.priority = priority;
  }
  if (iconType) {
    params.icon_type = iconType;
  }
  if (lifetime) {
    params.lifetime = lifetime;
  }

  return this.post('device/notifications', params);
};

/**
 * Cancel or Dismiss a Notification
 */
LaMetricLocal.prototype.cancelNotification = function(notificationId) {
  return this.delete(`device/notifications/${notificationId}`);
};

/**
 * Get Display State
 */
LaMetricLocal.prototype.getDisplayState = function() {
  return this.get('device/display');
};

/**
 * Update Display State
 */
LaMetricLocal.prototype.updateDisplayState = function(brightness, brightnessMode, screensaver) {
  const params = {};
  if (brightness) {
    params.brightness = brightness;
  }
  if (brightnessMode) {
    params.brightness_mode = brightnessMode;
  }
  if (screensaver) {
    params.screensaver = screensaver;
  }
  return this.put('device/display', params);
};

/**
 * Get Audio
 */
LaMetricLocal.prototype.getAudioState = function() {
  return this.get('device/audio');
};

/**
 * Update Audio
 */
LaMetricLocal.prototype.updateAudioState = function(volume) {
  return this.put('device/audio', {volume});
};

/**
 * Get Bluetooth State
 */
LaMetricLocal.prototype.getBluetoothState = function() {
  return this.get('device/bluetooth');
};

/**
 * Update Audio
 */
LaMetricLocal.prototype.updateBluetoothState = function(active, name) {
  return this.put('device/bluetooth', {
    active,
    name: name || 'lametric-local'
  });
};

/**
 * Get Wifi State
 */
LaMetricLocal.prototype.getWifiState = function() {
  return this.get('device/wifi');
};

module.exports = LaMetricLocal;
