"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "axios", "querystring", "./errors"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("axios"), require("querystring"), require("./errors"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.axios, global.querystring, global.errors);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _axios, _querystring, _errors) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TuyaWebApi = exports.TuyaPlatforms = exports.TuyaDeviceTypes = undefined;

  var _axios2 = _interopRequireDefault(_axios);

  var querystring = _interopRequireWildcard(_querystring);

  function _getRequireWildcardCache() {
    if (typeof WeakMap !== "function") return null;
    var cache = new WeakMap();

    _getRequireWildcardCache = function () {
      return cache;
    };

    return cache;
  }

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    }

    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
      return {
        default: obj
      };
    }

    var cache = _getRequireWildcardCache();

    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }

    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }

    newObj.default = obj;

    if (cache) {
      cache.set(obj, newObj);
    }

    return newObj;
  }

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  var TuyaDeviceTypes = exports.TuyaDeviceTypes = ['light', 'fan', 'dimmer', 'switch', 'outlet', 'scene', 'cover'];
  var TuyaPlatforms = exports.TuyaPlatforms = ['tuya', 'smart_life', 'jinvoo_smart'];

  class Session {
    constructor(_accessToken, _refreshToken, expiresIn, _areaCode) {
      this._accessToken = _accessToken;
      this._refreshToken = _refreshToken;
      this.expiresIn = expiresIn;
      this._areaCode = _areaCode;
      this.areaCode = _areaCode;
      this.resetToken(_accessToken, _refreshToken, expiresIn);
    }

    get accessToken() {
      return this._accessToken;
    }

    get areaBaseUrl() {
      return this._areaBaseUrl;
    }

    get refreshToken() {
      return this._refreshToken;
    }

    set areaCode(newAreaCode) {
      var areaCodeLookup = {
        'AY': 'https://px1.tuyacn.com',
        'EU': 'https://px1.tuyaeu.com',
        'US': 'https://px1.tuyaus.com'
      };
      this._areaCode = newAreaCode;
      this._areaBaseUrl = areaCodeLookup[newAreaCode] || areaCodeLookup['US'];
    }

    resetToken(accessToken, refreshToken, expiresIn) {
      this._accessToken = accessToken;
      this._refreshToken = refreshToken;
      this.expiresOn = Session.getCurrentEpoch() + expiresIn - 100; // subtract 100 ticks to expire token before it actually does
    }

    hasToken() {
      return !!this._accessToken;
    }

    isTokenExpired() {
      return this.expiresOn < Session.getCurrentEpoch();
    }

    hasValidToken() {
      return this.hasToken() && !this.isTokenExpired();
    }

    static getCurrentEpoch() {
      return Math.round(new Date().getTime() / 1000);
    }

  }

  class TuyaWebApi {
    constructor(username, password, countryCode) {
      var tuyaPlatform = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'tuya';
      var log = arguments.length > 4 ? arguments[4] : undefined;
      this.username = username;
      this.password = password;
      this.countryCode = countryCode;
      this.tuyaPlatform = tuyaPlatform;
      this.log = log;
      this.authBaseUrl = 'https://px1.tuyaeu.com';
    }

    getAllDeviceStates() {
      var _this = this;

      return _asyncToGenerator(function* () {
        return _this.discoverDevices();
      })();
    }

    discoverDevices() {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var _a;

        if (!((_a = _this2.session) === null || _a === void 0 ? void 0 : _a.hasValidToken())) {
          throw new Error('No valid token');
        }

        var {
          data
        } = yield _this2.sendRequest('/homeassistant/skill', {
          header: {
            name: 'Discovery',
            namespace: 'discovery',
            payloadVersion: 1
          },
          payload: {
            accessToken: _this2.session.accessToken
          }
        }, 'GET');

        if (data.header && data.header.code === 'SUCCESS') {
          return data.payload.devices;
        } else {
          if (data.header && data.header.code === 'FrequentlyInvoke') {
            throw new _errors.RatelimitError('Requesting too quickly.', data.header.msg);
          } else {
            throw new Error("No valid response from API: ".concat(JSON.stringify(data)));
          }
        }
      })();
    }

    getDeviceState(deviceId) {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        var _a;

        if (!((_a = _this3.session) === null || _a === void 0 ? void 0 : _a.hasValidToken())) {
          throw new Error('No valid token');
        }

        var {
          data
        } = yield _this3.sendRequest('/homeassistant/skill', {
          header: {
            name: 'QueryDevice',
            namespace: 'query',
            payloadVersion: 1
          },
          payload: {
            accessToken: _this3.session.accessToken,
            devId: deviceId,
            value: 1
          }
        }, 'GET');

        if (data.header && data.header.code === 'SUCCESS') {
          return data.payload.data;
        } else {
          if (data.header && data.header.code === 'FrequentlyInvoke') {
            throw new _errors.RatelimitError('Requesting too quickly.', data.header.msg);
          } else {
            throw new Error("No valid response from API: ".concat(JSON.stringify(data)));
          }
        }
      })();
    }

    setDeviceState(deviceId, method, payload) {
      var _this4 = this;

      return _asyncToGenerator(function* () {
        var _a, _b;

        if (!((_a = _this4.session) === null || _a === void 0 ? void 0 : _a.hasValidToken())) {
          throw new Error('No valid token');
        }

        var {
          data
        } = yield _this4.sendRequest('/homeassistant/skill', {
          header: {
            name: method,
            namespace: 'control',
            payloadVersion: 1
          },
          payload: _objectSpread(_objectSpread({}, payload), {}, {
            accessToken: (_b = _this4.session) === null || _b === void 0 ? void 0 : _b.accessToken,
            devId: deviceId
          })
        }, 'POST');

        if (data.header && data.header.code === 'SUCCESS') {
          return;
        } else if (data.header && data.header.code === 'FrequentlyInvoke') {
          throw new _errors.RatelimitError('Requesting too quickly.', data.header.msg);
        } else {
          throw new Error("Invalid payload in response: ".concat(JSON.stringify(data)));
        }
      })();
    }

    getOrRefreshToken() {
      var _this5 = this;

      return _asyncToGenerator(function* () {
        var _a, _b, _c;

        if (!((_a = _this5.session) === null || _a === void 0 ? void 0 : _a.hasToken())) {
          (_b = _this5.log) === null || _b === void 0 ? void 0 : _b.debug('Requesting new token'); // No token, lets get a token from the Tuya Web API

          if (!_this5.username) {
            throw new _errors.AuthenticationError('No username configured');
          }

          if (!_this5.password) {
            throw new _errors.AuthenticationError('No password configured');
          }

          if (!_this5.countryCode) {
            throw new _errors.AuthenticationError('No country code configured');
          }

          var form = {
            userName: _this5.username,
            password: _this5.password,
            countryCode: _this5.countryCode,
            bizType: _this5.tuyaPlatform,
            from: 'tuya'
          };
          var formData = querystring.stringify(form);
          var contentLength = formData.length;
          var {
            data
          } = yield (0, _axios2.default)({
            headers: {
              'Content-Length': contentLength,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            url: '/homeassistant/auth.do',
            baseURL: _this5.authBaseUrl,
            data: formData,
            method: 'POST'
          });

          if (data.responseStatus === 'error') {
            throw new _errors.AuthenticationError(data.errorMsg);
          } else {
            _this5.session = new Session(data.access_token, data.refresh_token, data.expires_in, data.access_token.substr(0, 2));
            return _this5.session;
          }
        } else {
          (_c = _this5.log) === null || _c === void 0 ? void 0 : _c.debug('Refreshing token');

          if (_this5.session.isTokenExpired()) {
            // Refresh token
            var {
              data: _data
            } = yield _this5.sendRequest('/homeassistant/access.do?grant_type=refresh_token&refresh_token=' + _this5.session.refreshToken, {}, 'GET'); // Received token

            _this5.session.resetToken(_data.access_token, _data.refresh_token, _data.expires_in);

            return _this5.session;
          }
        }
      })();
    }
    /*
         * --------------------------------------
         * HTTP methods
        */


    sendRequest(url, data, method) {
      var _this6 = this;

      return _asyncToGenerator(function* () {
        var _a, _b;

        (_a = _this6.log) === null || _a === void 0 ? void 0 : _a.debug('Sending HTTP %s request to %s - Header: %s.', method, url, JSON.stringify(data.header));
        var response = yield (0, _axios2.default)({
          baseURL: (_b = _this6.session) === null || _b === void 0 ? void 0 : _b.areaBaseUrl,
          url,
          data,
          method
        });
        return {
          data: response.data
        };
      })();
    }

  }

  exports.TuyaWebApi = TuyaWebApi;
});