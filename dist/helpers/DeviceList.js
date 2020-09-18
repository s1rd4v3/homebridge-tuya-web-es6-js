"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.undefined = mod.exports;
  }
})(void 0, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  class DeviceList {
    constructor(devices) {
      this.idNameMap = {};
      devices.forEach(device => {
        this.idNameMap[device.id] = device.name;
      });
    }
    /**
    * Returns the device ID belonging to the supplied identifier
    * @param identifier
    */


    find(identifier) {
      if (Object.keys(this.idNameMap).includes(identifier)) {
        return identifier;
      }

      if (Object.values(this.idNameMap).includes(identifier)) {
        return Object.keys(this.idNameMap).find(key => this.idNameMap[key] === identifier);
      }

      return undefined;
    }

    nameForIdentifier(identifier) {
      var id = this.find(identifier);

      if (!id) {
        return undefined;
      }

      return this.idNameMap[id];
    }
    /**
     * Returns all device ids in this list
     */


    get all() {
      return Object.keys(this.idNameMap);
    }

  }

  exports.DeviceList = DeviceList;
});