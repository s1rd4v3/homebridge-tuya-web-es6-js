import { BaseAccessory } from './BaseAccessory';
import { Categories } from 'homebridge';
import { ActiveCharacteristic, RotationSpeedCharacteristic } from './characteristics';
export class FanAccessory extends BaseAccessory {
  constructor(platform, homebridgeAccessory, deviceConfig) {
    super(platform, homebridgeAccessory, deviceConfig, Categories.FAN);
    new ActiveCharacteristic(this);
    new RotationSpeedCharacteristic(this);
  }
}
