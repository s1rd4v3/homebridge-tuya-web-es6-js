import { Categories } from 'homebridge';
import { BrightnessCharacteristic, ColorTemperatureCharacteristic, HueCharacteristic, OnCharacteristic, SaturationCharacteristic } from './characteristics';
import { ColorAccessory } from './ColorAccessory';
const COLOR_MODES = ['color', 'colour'];
export class LightAccessory extends ColorAccessory {
  constructor(platform, homebridgeAccessory, deviceConfig) {
    super(platform, homebridgeAccessory, deviceConfig, Categories.LIGHTBULB);
    new OnCharacteristic(this);
    new BrightnessCharacteristic(this);
    new ColorTemperatureCharacteristic(this);
    new HueCharacteristic(this);
    new SaturationCharacteristic(this);
  }
}
