import {BaseAccessory} from './BaseAccessory';
import {TuyaDevice} from '../TuyaWebApi';
import debounce from 'lodash.debounce';
import {DebouncedPromise} from '../helpers/DebouncedPromise';
import {
  BrightnessCharacteristic,
  BrightnessCharacteristicData,
  COLOR_MODES,
  HueCharacteristic,
  SaturationCharacteristic,
} from './characteristics';


export abstract class ColorAccessory<DeviceConfig extends TuyaDevice = TuyaDevice> extends BaseAccessory<DeviceConfig> {
  private async setRemoteColor(color: { hue: number, saturation: number }): Promise<void> {
    const cachedValue = this.cachedValue<BrightnessCharacteristicData>(true);
    const brightness = Number(cachedValue ? cachedValue.brightness : BrightnessCharacteristic.DEFAULT_VALUE);
    const tuyaData = {
      hue: color.hue,
      saturation: color.saturation / 100,
      brightness,
    };

    await this.setDeviceState('colorSet', {color: tuyaData}, {color, color_mode: COLOR_MODES[0]});

  }

  private setColorDebounced = debounce(() => {
    const {resolve, reject} = this.debouncePromise!;
    this.debouncePromise = undefined;
    const hue = Number(this.hue !== undefined ? this.hue : HueCharacteristic.DEFAULT_VALUE);
    const saturation = Number(this.saturation !== undefined ? this.saturation : SaturationCharacteristic.DEFAULT_VALUE);
    this.setRemoteColor({hue, saturation}).then(resolve).catch(reject);
  }, 100, {maxWait: 500});


  private debouncePromise?: DebouncedPromise<void>
  private hue?: number;
  private saturation?: number;

  public setColor(color: Partial<{ hue: number, saturation: number }>): Promise<void> {
    if (!this.debouncePromise) {
      this.debouncePromise = new DebouncedPromise<void>();
    }

    this.hue = color.hue !== undefined ? color.hue : this.hue;
    this.saturation = color.saturation !== undefined ? color.saturation : this.saturation;

    this.setColorDebounced();

    return this.debouncePromise.promise;
  }
}
