import { COLOR_MODES } from './index';
import { TuyaWebCharacteristic } from './base';
export class HueCharacteristic extends TuyaWebCharacteristic {
  static HomekitCharacteristic(accessory) {
    return accessory.platform.Characteristic.Hue;
  }

  static isSupportedByAccessory(accessory) {
    const configData = accessory.deviceConfig.data;
    return configData.color_mode !== undefined;
  }

  getRemoteValue(callback) {
    this.accessory.getDeviceState().then((data) => {
      var _a;
      this.debug('[GET] %s', (_a = data === null || data === void 0 ? void 0 : data.color) === null || _a === void 0 ? void 0 : _a.hue);
      this.updateValue(data, callback);
    }).catch(this.accessory.handleError('GET', callback));
  }

  setRemoteValue(homekitValue, callback) {
    // Set device state in Tuya Web API
    const value = homekitValue;
    this.accessory.setColor({ hue: value }).then(() => {
      this.debug('[SET] %s', value);
      callback();
    }).catch(this.accessory.handleError('SET', callback));
  }

  updateValue(data, callback) {
    var _a;
    let stateValue = HueCharacteristic.DEFAULT_VALUE;
    if ((data === null || data === void 0 ? void 0 : data.color_mode) !== undefined && (data === null || data === void 0 ? void 0 : data.color_mode) in COLOR_MODES && ((_a = data === null || data === void 0 ? void 0 : data.color) === null || _a === void 0 ? void 0 : _a.hue)) {
      stateValue = Number(data.color.hue);
    }
    this.accessory.setCharacteristic(this.homekitCharacteristic, stateValue, !callback);
    callback && callback(null, stateValue);
  }
}
HueCharacteristic.Title = 'Characteristic.Hue';
HueCharacteristic.DEFAULT_VALUE = 0;
