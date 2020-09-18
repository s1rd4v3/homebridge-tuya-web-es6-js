import {TuyaDevice, TuyaDeviceState} from '../../TuyaWebApi';
import {CharacteristicGetCallback, CharacteristicSetCallback, CharacteristicValue} from 'homebridge';
import {COLOR_MODES, ColorModes} from './index';
import {XOR} from 'ts-xor';
import {inspect} from 'util';
import {TuyaWebCharacteristic} from './base';
import {BaseAccessory} from '../BaseAccessory';

export type BrightnessCharacteristicData =
    XOR<{ brightness: string }, { color: { brightness?: string }, color_mode: ColorModes }>
type DeviceWithBrightnessCharacteristic = TuyaDevice<TuyaDeviceState & BrightnessCharacteristicData>

export class BrightnessCharacteristic extends TuyaWebCharacteristic {
  public static Title = 'Characteristic.Brightness'

  public static HomekitCharacteristic(accessory: BaseAccessory) {
    return accessory.platform.Characteristic.Brightness;
  }

  public static DEFAULT_VALUE = 100;

  public static isSupportedByAccessory(accessory): boolean {
    const configData = accessory.deviceConfig.data;
    return configData.brightness !== undefined || configData.color?.brightness !== undefined;
  }

  public getRemoteValue(callback: CharacteristicGetCallback): void {
    this.accessory.getDeviceState<BrightnessCharacteristicData>().then((data) => {
      this.debug('[GET] %s', data?.brightness || data?.color?.brightness);
      this.updateValue(data, callback);
    }).catch(this.accessory.handleError('GET', callback));
  }

  public setRemoteValue(homekitValue: CharacteristicValue, callback: CharacteristicSetCallback): void {
    // Set device state in Tuya Web API
    const value = homekitValue as number / 10 * 9 + 10;

    this.accessory.setDeviceState('brightnessSet', {value}, {brightness: homekitValue}).then(() => {
      this.debug('[SET] %s', value);
      callback();
    }).catch(this.accessory.handleError('SET', callback));
  }

  updateValue(data: DeviceWithBrightnessCharacteristic['data'] | undefined, callback?: CharacteristicGetCallback): void {
    // data.brightness only valid for color_mode != color > https://github.com/PaulAnnekov/tuyaha/blob/master/tuyaha/devices/light.py
    // however, according to local tuya app, calculation for color_mode=color is still incorrect (even more so in lower range)
    let stateValue: number | undefined;
    if (data?.color_mode !== undefined && data?.color_mode in COLOR_MODES && data?.color.brightness !== undefined) {
      stateValue = Number(data.color.brightness);
    } else if (data?.brightness) {
      stateValue = Math.round(Number(data.brightness) / 255 * 100);
    }

    if (stateValue) {
      this.accessory.setCharacteristic(this.homekitCharacteristic, stateValue, !callback);
      callback && callback(null, stateValue);
      return;
    }

    this.error('Tried to set brightness but failed to parse data. \n %s', inspect(data));
  }
}
