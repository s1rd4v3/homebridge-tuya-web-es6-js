import { BaseAccessory } from './BaseAccessory';
import debounce from 'lodash.debounce';
import { DebouncedPromise } from '../helpers/DebouncedPromise';
import { BrightnessCharacteristic, COLOR_MODES, HueCharacteristic, SaturationCharacteristic } from './characteristics';
export class ColorAccessory extends BaseAccessory {
  constructor() {
    super(...arguments);
    this.setColorDebounced = debounce(() => {
      const { resolve, reject } = this.debouncePromise;
      this.debouncePromise = undefined;
      const hue = Number(this.hue !== undefined ? this.hue : HueCharacteristic.DEFAULT_VALUE);
      const saturation = Number(this.saturation !== undefined ? this.saturation : SaturationCharacteristic.DEFAULT_VALUE);
      this.setRemoteColor({ hue, saturation }).then(resolve).catch(reject);
    }, 100, { maxWait: 500 });
  }

  async setRemoteColor(color) {
    const cachedValue = this.cachedValue(true);
    const brightness = Number(cachedValue ? cachedValue.brightness : BrightnessCharacteristic.DEFAULT_VALUE);
    const tuyaData = {
      hue: color.hue,
      saturation: color.saturation / 100,
      brightness,
    };
    await this.setDeviceState('colorSet', { color: tuyaData }, { color, color_mode: COLOR_MODES[0] });
  }

  setColor(color) {
    if (!this.debouncePromise) {
      this.debouncePromise = new DebouncedPromise();
    }
    this.hue = color.hue !== undefined ? color.hue : this.hue;
    this.saturation = color.saturation !== undefined ? color.saturation : this.saturation;
    this.setColorDebounced();
    return this.debouncePromise.promise;
  }
}
