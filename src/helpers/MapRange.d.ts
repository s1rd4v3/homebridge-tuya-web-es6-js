export declare class MapRange {
    private fromStart;
    private fromEnd;
    private toStart;
    private toEnd;
    private constructor();
    static from(start: any, end: any): {
        to: (start: number, end: number) => MapRange;
    };
    map(input: number): number;
    inverseMap(input: number): number;
}
//# sourceMappingURL=MapRange.d.ts.map