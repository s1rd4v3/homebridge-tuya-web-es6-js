import { BaseAccessory } from './BaseAccessory';
import { Categories } from 'homebridge';
import { CoverCurrentPositionCharacteristic, CoverTargetPositionCharacteristic } from './characteristics';
export class CoverAccessory extends BaseAccessory {
  constructor(platform, homebridgeAccessory, deviceConfig) {
    super(platform, homebridgeAccessory, deviceConfig, Categories.WINDOW_COVERING);
    homebridgeAccessory.context.lastValue = homebridgeAccessory.context.lastValue || 0;
    new CoverCurrentPositionCharacteristic(this);
    new CoverTargetPositionCharacteristic(this);
  }
}
