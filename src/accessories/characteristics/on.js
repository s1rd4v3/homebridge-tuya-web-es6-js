import { TuyaWebCharacteristic } from './base';
export class OnCharacteristic extends TuyaWebCharacteristic {
  static HomekitCharacteristic(accessory) {
    return accessory.platform.Characteristic.On;
  }

  static isSupportedByAccessory(accessory) {
    return accessory.deviceConfig.data.state !== undefined;
  }

  getRemoteValue(callback) {
    this.accessory.getDeviceState().then((data) => {
      this.debug('[GET] %s', data === null || data === void 0 ? void 0 : data.state);
      this.updateValue(data, callback);
    }).catch(this.accessory.handleError('GET', callback));
  }

  setRemoteValue(homekitValue, callback) {
    // Set device state in Tuya Web API
    const value = homekitValue ? 1 : 0;
    this.accessory.setDeviceState('turnOnOff', { value }, { state: homekitValue }).then(() => {
      this.debug('[SET] %s %s', homekitValue, value);
      callback();
    }).catch(this.accessory.handleError('SET', callback));
  }

  updateValue(data, callback) {
    if ((data === null || data === void 0 ? void 0 : data.state) !== undefined) {
      const stateValue = (String(data.state).toLowerCase() === 'true');
      this.accessory.setCharacteristic(this.homekitCharacteristic, stateValue, !callback);
      callback && callback(null, stateValue);
    }
  }
}
OnCharacteristic.Title = 'Characteristic.On';
