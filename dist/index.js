"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./settings", "./platform"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./settings"), require("./platform"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.settings, global.platform);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _settings, _platform) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = api => {
    api.registerPlatform(_settings.PLUGIN_NAME, _settings.PLATFORM_NAME, _platform.TuyaWebPlatform);
  };

  module.exports = exports.default;
});