import { TuyaWebCharacteristic } from './base';
export class MomentaryOnCharacteristic extends TuyaWebCharacteristic {
    static HomekitCharacteristic(accessory) {
        return accessory.platform.Characteristic.On;
    }
    static isSupportedByAccessory() {
        return true;
    }
    getRemoteValue(callback) {
        const value = 0;
        this.debug('[GET] %s', value);
        this.updateValue(undefined, callback);
    }
    setRemoteValue(homekitValue, callback) {
        // Set device state in Tuya Web API
        const value = homekitValue ? 1 : 0;
        if (value === 0) {
            callback();
            return;
        }
        this.accessory.setDeviceState('turnOnOff', { value }, {}).then(() => {
            this.debug('[SET] %s %s', homekitValue, value);
            callback();
            const reset = () => {
                var _a;
                (_a = this.accessory.service) === null || _a === void 0 ? void 0 : _a.setCharacteristic(this.homekitCharacteristic, 0);
            };
            setTimeout(reset.bind(this), 100);
        }).catch(this.accessory.handleError('SET', callback));
    }
    updateValue(data, callback) {
        callback && callback(null, 0);
    }
}
MomentaryOnCharacteristic.Title = 'Characteristic.MomentaryOn';
