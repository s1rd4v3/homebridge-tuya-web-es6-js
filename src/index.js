import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { TuyaWebPlatform } from './platform';

/**
 * This method registers the platform with Homebridge
 */
export default (api) => {
  api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, TuyaWebPlatform);
}