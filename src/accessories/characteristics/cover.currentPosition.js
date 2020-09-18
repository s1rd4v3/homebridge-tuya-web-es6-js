import { Formats, Units } from 'homebridge';
import { TuyaWebCharacteristic } from './base';
export class CoverCurrentPositionCharacteristic extends TuyaWebCharacteristic {
  static HomekitCharacteristic(accessory) {
    return accessory.platform.Characteristic.CurrentPosition;
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
    this.accessory.log.debug('Triggered GET CurrentPosition');
    this.debug('[GET] %s', this.accessory.homebridgeAccessory.context.lastValue);
    this.updateValue(this.accessory.homebridgeAccessory.context.lastValue, callback);
  }

  updateValue(value, callback) {
    this.debug('[UPDATE]', value, this.accessory.homebridgeAccessory.context);
    this.accessory.setCharacteristic(this.homekitCharacteristic, value, true);
    callback && callback(null, value);
  }
}
CoverCurrentPositionCharacteristic.Title = 'Characteristic.Cover.CurrentPosition';
