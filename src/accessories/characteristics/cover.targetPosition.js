import { Formats, Units } from 'homebridge';
import { TuyaWebCharacteristic } from './base';
export class CoverTargetPositionCharacteristic extends TuyaWebCharacteristic {
  static HomekitCharacteristic(accessory) {
    return accessory.platform.Characteristic.TargetPosition;
  }

  setProps(char) {
    return char?.setProps({
      unit: Units.PERCENTAGE,
      format: Formats.INT,
      minValue: 0,
      maxValue: 100,
      minStep: 1,
    });
  }

  static isSupportedByAccessory(accessory) {
    return accessory.deviceConfig.dev_type === 'cover';
  }

  getRemoteValue(callback) {
    this.accessory.log.debug('Triggered GET TargetPosition');
    this.debug('[GET] %s', this.accessory.homebridgeAccessory.context.lastValue);
    this.updateValue(this.accessory.homebridgeAccessory.context.lastValue, callback);
  }

  setRemoteValue(homekitValue, callback) {
    this.accessory.log.debug('Triggered SET TargetPosition');
    const value = homekitValue ? 1 : 0;
    this.accessory.setDeviceState('turnOnOff', { value }).then(() => {
      this.debug('[SET] %s %s', homekitValue, value);
      this.accessory.homebridgeAccessory.context.lastValue = homekitValue;
      this.updateValue(homekitValue);
      callback(null);
    }).catch(this.accessory.handleError('SET', callback));
  }

  updateValue(value, callback) {
    this.debug('[UPDATE]', value);
    this.accessory.setCharacteristic(this.homekitCharacteristic, value, !callback);
    this.accessory.setCharacteristic(this.accessory.platform.Characteristic.CurrentPosition, value, !callback);
    callback && callback(null, value);
  }
}
CoverTargetPositionCharacteristic.Title = 'Characteristic.Cover.TargetPosition';
