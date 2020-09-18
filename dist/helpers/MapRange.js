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

  class MapRange {
    constructor(fromStart, fromEnd, toStart, toEnd) {
      this.fromStart = fromStart;
      this.fromEnd = fromEnd;
      this.toStart = toStart;
      this.toEnd = toEnd;
    }

    static from(start, end) {
      return {
        to: (toStart, toEnd) => {
          return new MapRange(start, end, toStart, toEnd);
        }
      };
    }

    map(input) {
      return (input - this.fromStart) * (this.toEnd - this.toStart) / (this.fromEnd - this.fromStart) + this.toStart;
    }

    inverseMap(input) {
      return (input - this.toStart) * (this.fromEnd - this.fromStart) / (this.toEnd - this.toStart) + this.fromStart;
    }

  }

  exports.MapRange = MapRange;
});