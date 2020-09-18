import {TuyaDeviceType, TuyaPlatform} from './TuyaWebApi';
import {PlatformConfig} from 'homebridge';

export type TuyaDeviceDefaults = { id: string, device_type: TuyaDeviceType }

type Config = {
  options?: {
    username?: string,
    password?: string,
    countryCode?: string,
    platform?: TuyaPlatform,
    pollingInterval?: number
  },
  defaults?: Partial<TuyaDeviceDefaults>[],
  scenes?: boolean | string[]
}

export type TuyaWebConfig = PlatformConfig & Config;
