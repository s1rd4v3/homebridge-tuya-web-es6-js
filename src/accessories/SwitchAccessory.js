import { BaseAccessory } from './BaseAccessory';
import { Categories } from 'homebridge';
import { OnCharacteristic } from './characteristics';
export class SwitchAccessory extends BaseAccessory {
  constructor(platform, homebridgeAccessory, deviceConfig) {
    super(platform, homebridgeAccessory, deviceConfig, Categories.SWITCH);
    new OnCharacteristic(this);
  }
}
