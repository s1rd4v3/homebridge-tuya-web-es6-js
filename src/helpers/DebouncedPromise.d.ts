export declare class DebouncedPromise<PromiseReturnType> {
    resolve: (value?: PromiseReturnType | undefined) => void;
    reject: (reason?: Error) => void;
    promise: Promise<PromiseReturnType>;
    constructor();
}
//# sourceMappingURL=DebouncedPromise.d.ts.map