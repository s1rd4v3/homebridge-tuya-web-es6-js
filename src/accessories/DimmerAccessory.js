import { BaseAccessory } from './BaseAccessory';
import { Categories } from 'homebridge';
import { OnCharacteristic } from './characteristics';
export class DimmerAccessory extends BaseAccessory {
  constructor(platform, homebridgeAccessory, deviceConfig) {
    super(platform, homebridgeAccessory, deviceConfig, Categories.LIGHTBULB);
    new OnCharacteristic(this);
  }
}
