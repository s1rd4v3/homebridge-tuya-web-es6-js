import axios from 'axios';
import * as querystring from 'querystring';
import { AuthenticationError, RatelimitError } from './errors';
export const TuyaDeviceTypes = ['light', 'fan', 'dimmer', 'switch', 'outlet', 'scene', 'cover'];
export const TuyaPlatforms = ['tuya', 'smart_life', 'jinvoo_smart'];
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
    const areaCodeLookup = {
      'AY': 'https://px1.tuyacn.com',
      'EU': 'https://px1.tuyaeu.com',
      'US': 'https://px1.tuyaus.com',
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
    return Math.round((new Date()).getTime() / 1000);
  }
}
export class TuyaWebApi {
  constructor(username, password, countryCode, tuyaPlatform = 'tuya', log) {
    this.username = username;
    this.password = password;
    this.countryCode = countryCode;
    this.tuyaPlatform = tuyaPlatform;
    this.log = log;
    this.authBaseUrl = 'https://px1.tuyaeu.com';
  }

  async getAllDeviceStates() {
    return this.discoverDevices();
  }

  async discoverDevices() {
    var _a;
    if (!((_a = this.session) === null || _a === void 0 ? void 0 : _a.hasValidToken())) {
      throw new Error('No valid token');
    }
    const { data } = await this.sendRequest('/homeassistant/skill', {
      header: {
        name: 'Discovery',
        namespace: 'discovery',
        payloadVersion: 1,
      },
      payload: {
        accessToken: this.session.accessToken,
      },
    }, 'GET');
    if (data.header && data.header.code === 'SUCCESS') {
      return data.payload.devices;
    } else {
      if (data.header && data.header.code === 'FrequentlyInvoke') {
        throw new RatelimitError('Requesting too quickly.', data.header.msg);
      } else {
        throw new Error(`No valid response from API: ${JSON.stringify(data)}`);
      }
    }
  }

  async getDeviceState(deviceId) {
    var _a;
    if (!((_a = this.session) === null || _a === void 0 ? void 0 : _a.hasValidToken())) {
      throw new Error('No valid token');
    }
    const { data } = await this.sendRequest('/homeassistant/skill', {
      header: {
        name: 'QueryDevice',
        namespace: 'query',
        payloadVersion: 1,
      },
      payload: {
        accessToken: this.session.accessToken,
        devId: deviceId,
        value: 1,
      },
    }, 'GET');
    if (data.header && data.header.code === 'SUCCESS') {
      return data.payload.data;
    } else {
      if (data.header && data.header.code === 'FrequentlyInvoke') {
        throw new RatelimitError('Requesting too quickly.', data.header.msg);
      } else {
        throw new Error(`No valid response from API: ${JSON.stringify(data)}`);
      }
    }
  }

  async setDeviceState(deviceId, method, payload) {
    var _a, _b;
    if (!((_a = this.session) === null || _a === void 0 ? void 0 : _a.hasValidToken())) {
      throw new Error('No valid token');
    }
    const { data } = await this.sendRequest('/homeassistant/skill', {
      header: {
        name: method,
        namespace: 'control',
        payloadVersion: 1,
      },
      payload: {
        ...payload,
        accessToken: (_b = this.session) === null || _b === void 0 ? void 0 : _b.accessToken,
        devId: deviceId,
      },
    }, 'POST');
    if (data.header && data.header.code === 'SUCCESS') {
      return;
    } else if (data.header && data.header.code === 'FrequentlyInvoke') {
      throw new RatelimitError('Requesting too quickly.', data.header.msg);
    } else {
      throw new Error(`Invalid payload in response: ${JSON.stringify(data)}`);
    }
  }

  async getOrRefreshToken() {
    var _a, _b, _c;
    if (!((_a = this.session) === null || _a === void 0 ? void 0 : _a.hasToken())) {
      (_b = this.log) === null || _b === void 0 ? void 0 : _b.debug('Requesting new token');
      // No token, lets get a token from the Tuya Web API
      if (!this.username) {
        throw new AuthenticationError('No username configured');
      }
      if (!this.password) {
        throw new AuthenticationError('No password configured');
      }
      if (!this.countryCode) {
        throw new AuthenticationError('No country code configured');
      }
      const form = {
        userName: this.username,
        password: this.password,
        countryCode: this.countryCode,
        bizType: this.tuyaPlatform,
        from: 'tuya',
      };
      const formData = querystring.stringify(form);
      const contentLength = formData.length;
      const { data } = await axios({
        headers: {
          'Content-Length': contentLength,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        url: '/homeassistant/auth.do',
        baseURL: this.authBaseUrl,
        data: formData,
        method: 'POST',
      });
      if (data.responseStatus === 'error') {
        throw new AuthenticationError(data.errorMsg);
      } else {
        this.session = new Session(data.access_token, data.refresh_token, data.expires_in, data.access_token.substr(0, 2));
        return this.session;
      }
    } else {
      (_c = this.log) === null || _c === void 0 ? void 0 : _c.debug('Refreshing token');
      if (this.session.isTokenExpired()) {
        // Refresh token
        const { data } = await this.sendRequest('/homeassistant/access.do?grant_type=refresh_token&refresh_token=' + this.session.refreshToken, {}, 'GET');
        // Received token
        this.session.resetToken(data.access_token, data.refresh_token, data.expires_in);
        return this.session;
      }
    }
  }

  /*
       * --------------------------------------
       * HTTP methods
      */
  async sendRequest(url, data, method) {
    var _a, _b;
    (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug('Sending HTTP %s request to %s - Header: %s.', method, url, JSON.stringify(data.header));
    const response = await axios({
      baseURL: (_b = this.session) === null || _b === void 0 ? void 0 : _b.areaBaseUrl,
      url,
      data,
      method,
    });
    return { data: response.data };
  }
}
