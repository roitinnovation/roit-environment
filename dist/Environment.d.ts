import { Env } from "./Env";
import { EnvOptions } from "./EnvOptions";
export declare class Environment {
    private static instance;
    private envEnum;
    private env;
    private option?;
    private constructor();
    static envOptions(options?: EnvOptions): void;
    private static getInstance;
    static addProperty(key: string, value: any, setInEnv?: boolean): void;
    private static getValueDot;
    /**
     * Get property from file (env.yaml) create in root path.
     * See more in https://www.npmjs.com/package/roit-environment
     * @param key
     */
    static getProperty(key: string): string;
    /**
     * Get property from OS System Property
     * @param key
     */
    static systemProperty(key: string): string | undefined;
    private static property;
    private static finding;
    /**
     * Verify env current eq
     * @param env
     */
    static acceptedEnv(...args: Env[]): boolean;
    /**
     * Get current env
     */
    static currentEnv(): Env;
    /**
     * Get property with relative path
     * @param subs
     * @param key
     */
    static getRelativePath(subs: number, key: string): string;
    static reload(): void;
    private startup;
}
