import { TuyaWebCharacteristic } from './base';
import { MapRange } from '../../helpers/MapRange';
// Homekit uses mired light units, Tuya uses kelvin
// Mired = 1.000.000/Kelvin
export class ColorTemperatureCharacteristic extends TuyaWebCharacteristic {
  constructor() {
    super(...arguments);
    this.rangeMapper = MapRange.from(1000000 / 140, 1000000 / 500).to(10000, 1000);
  }

  static HomekitCharacteristic(accessory) {
    return accessory.platform.Characteristic.ColorTemperature;
  }

  static isSupportedByAccessory(accessory) {
    return accessory.deviceConfig.data.color_temp !== undefined;
  }

  getRemoteValue(callback) {
    this.accessory.getDeviceState().then((data) => {
      this.debug('[GET] %s', data === null || data === void 0 ? void 0 : data.color_temp);
      this.updateValue(data, callback);
    }).catch(this.accessory.handleError('GET', callback));
  }

  setRemoteValue(homekitValue, callback) {
    if (typeof homekitValue !== 'number') {
      const errorMsg = `Received unexpected temperature value "${homekitValue}" of type ${typeof homekitValue}`;
      this.warn(errorMsg);
      callback(new Error(errorMsg));
      return;
    }
    // Set device state in Tuya Web API
    const value = Math.round(this.rangeMapper.map(1000000 / homekitValue));
    this.accessory.setDeviceState('colorTemperatureSet', { value }, { color_temp: homekitValue }).then(() => {
      this.debug('[SET] %s %s', homekitValue, value);
      callback();
    }).catch(this.accessory.handleError('SET', callback));
  }

  updateValue(data, callback) {
    if ((data === null || data === void 0 ? void 0 : data.color_temp) !== undefined) {
      const homekitColorTemp = Math.round(this.rangeMapper.inverseMap(1000000 / data.color_temp));
      this.accessory.setCharacteristic(this.homekitCharacteristic, homekitColorTemp, !callback);
      callback && callback(null, homekitColorTemp);
    }
  }
}
ColorTemperatureCharacteristic.Title = 'Characteristic.ColorTemperature';
