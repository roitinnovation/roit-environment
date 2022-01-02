import { Env } from "."

export class EnvOptions {

    // Default is DEV
    manuallyEnv?: Env

    // Default is env.yml
    fileYamlName?: string

    // Default is process.env.ENV
    keyPropertyEnv?: string

}