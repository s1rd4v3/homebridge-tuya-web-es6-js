import { Formats } from 'homebridge';
import { TuyaWebCharacteristic } from './base';
export class CoverPositionStateCharacteristic extends TuyaWebCharacteristic {
  static HomekitCharacteristic(accessory) {
    return accessory.platform.Characteristic.PositionState;
  }

  setProps(char) {
    return char?.setProps({
      format: Formats.UINT8,
      minValue: 0,
      maxValue: 2,
    });
  }

  static isSupportedByAccessory(accessory) {
    return accessory.deviceConfig.dev_type === 'cover';
  }

  getRemoteValue(callback) {
    this.accessory.log.debug('Triggered GET PositionState');
    this.accessory.getDeviceState().then((data) => {
      this.debug('[GET] %s', data);
      this.updateValue(0, callback);
    }).catch(this.accessory.handleError('GET', callback));
  }

  updateValue(value, callback) {
    this.debug('[UPDATE]', value, this.homekitCharacteristic);
    this.accessory.service.setCharacteristic(this.homekitCharacteristic, value);
    callback && callback(null, value);
  }
}
CoverPositionStateCharacteristic.Title = 'Characteristic.Cover.PositionState';
