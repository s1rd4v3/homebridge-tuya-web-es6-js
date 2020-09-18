"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.RatelimitError = void 0;
var RatelimitError = /** @class */ (function (_super) {
    __extends(RatelimitError, _super);
    function RatelimitError(message, reason) {
        var _this = this;
        if (reason) {
            message += " - " + reason;
        }
        _this = _super.call(this, message) || this;
        return _this;
    }
    return RatelimitError;
}(Error));
exports.RatelimitError = RatelimitError;
