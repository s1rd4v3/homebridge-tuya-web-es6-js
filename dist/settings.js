"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", '../package.json'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('../package.json'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global._package);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, packageJson) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  /**
   * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
   */
  var PLATFORM_NAME = exports.PLATFORM_NAME = packageJson.displayName;
  /**
   * This must match the name of your plugin as defined the package.json
   */

  var PLUGIN_NAME = exports.PLUGIN_NAME = packageJson.name;
  /**
   * The version the package is currently on as defined in package.json
   */

  var VERSION = exports.VERSION = packageJson.version;
  /**
   * The standard timeout for Tuya discovery requests
   */

  var TUYA_DISCOVERY_TIMEOUT = exports.TUYA_DISCOVERY_TIMEOUT = 300;
  /**
   * The standard timeout for Tuya device requests.
   */

  var TUYA_DEVICE_TIMEOUT = exports.TUYA_DEVICE_TIMEOUT = 60;
});