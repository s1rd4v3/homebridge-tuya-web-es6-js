export class MapRange {
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
            },
        };
    }
    map(input) {
        return (input - this.fromStart) * (this.toEnd - this.toStart) / (this.fromEnd - this.fromStart) + this.toStart;
    }
    inverseMap(input) {
        return (input - this.toStart) * (this.fromEnd - this.fromStart) / (this.toEnd - this.toStart) + this.fromStart;
    }
}
