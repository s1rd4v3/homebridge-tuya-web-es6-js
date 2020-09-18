// eslint-disable-next-line
const packageJson = require('../package.json');
/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
export const PLATFORM_NAME = packageJson.displayName;
/**
 * This must match the name of your plugin as defined the package.json
 */
export const PLUGIN_NAME = packageJson.name;
/**
 * The version the package is currently on as defined in package.json
 */
export const VERSION = packageJson.version;
/**
 * The standard timeout for Tuya discovery requests
 */
export const TUYA_DISCOVERY_TIMEOUT = 300;
/**
 * The standard timeout for Tuya device requests.
 */
export const TUYA_DEVICE_TIMEOUT = 60;
