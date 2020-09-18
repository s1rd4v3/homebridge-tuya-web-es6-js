import { BaseAccessory } from './BaseAccessory';
import { Categories } from 'homebridge';
import { MomentaryOnCharacteristic } from './characteristics/momentaryOn';
export class SceneAccessory extends BaseAccessory {
  constructor(platform, homebridgeAccessory, deviceConfig) {
    super(platform, homebridgeAccessory, deviceConfig, Categories.SWITCH);
    new MomentaryOnCharacteristic(this);
  }
}
