import {BaseAccessory} from './BaseAccessory';
import {TuyaDevice, TuyaDeviceState} from '../TuyaWebApi';
import {HomebridgeAccessory, TuyaWebPlatform} from '../platform';
import {Categories} from 'homebridge';
import {OnCharacteristic, OnCharacteristicData} from './characteristics';

type CoverAccessoryConfig = TuyaDevice & {
  data: TuyaDeviceState & OnCharacteristicData
}

export class CoverAccessory extends BaseAccessory<CoverAccessoryConfig> {

  constructor(
    platform: TuyaWebPlatform,
    homebridgeAccessory: HomebridgeAccessory<CoverAccessoryConfig>,
    deviceConfig: CoverAccessoryConfig) {
    super(platform, homebridgeAccessory, deviceConfig, Categories.WINDOW_COVERING);

    new OnCharacteristic(this as BaseAccessory);
  }
}
