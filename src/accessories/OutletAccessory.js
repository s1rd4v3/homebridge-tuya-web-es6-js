import { BaseAccessory } from './BaseAccessory';
import { Categories } from 'homebridge';
import { OnCharacteristic } from './characteristics';
export class OutletAccessory extends BaseAccessory {
  constructor(platform, homebridgeAccessory, deviceConfig) {
    super(platform, homebridgeAccessory, deviceConfig, Categories.OUTLET);
    new OnCharacteristic(this);
  }
}
