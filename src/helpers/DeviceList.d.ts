import { TuyaDevice } from '../TuyaWebApi';
export declare class DeviceList {
    private idNameMap;
    constructor(devices: TuyaDevice[]);
    /**
   * Returns the device ID belonging to the supplied identifier
   * @param identifier
   */
    find(identifier: string): string | undefined;
    nameForIdentifier(identifier: string): string | undefined;
    /**
     * Returns all device ids in this list
     */
    get all(): string[];
}
//# sourceMappingURL=DeviceList.d.ts.map