import * as dotRef from "dot-object"
import chalk from "chalk"
import { Env } from "./Env"
import { EnvOptions } from "./EnvOptions"
import * as fs from "fs"
import * as YAML from "yamljs"

export class Environment {

    private static instance: Environment = new Environment

    private envEnum: Env = Env.DEV

    private env: any

    private option?: EnvOptions

    private constructor() {
        this.startup()
    }

    static envOptions(options?: EnvOptions) {
        this.instance.option = options
        this.instance.startup()
    }

    private static getInstance(): Environment {
        return this.instance;
    }

    static addProperty(key: string, value: any, setInEnv: boolean = true): void {
        if (setInEnv) {
            this.getInstance().env[this.getInstance().envEnum] = this.getValueDot(this.getInstance().env[this.getInstance().envEnum], key, value)
        }

        this.getInstance().env = this.getValueDot(this.getInstance().env, key, value)
    }

    private static getValueDot(objectRef: any, key: string, value: any) {
        let object = objectRef ? objectRef : {}
        if (key.indexOf(".") == -1) {
            object[key] = value
            return object
        }
        return dotRef.str(key, value, object);
    }

    /**
     * Get property from file (env.yaml) create in root path.
     * See more in https://www.npmjs.com/package/roit-environment
     * @param key 
     */
    static getProperty(key: string): string {
        const value = this.property(key)

        if (value) {
            return value
        }

        // Check levels
        const finding = this.finding(key)

        if (finding) {
            return this.getRelativePath(finding.levels, finding.key)
        }

        /* 
         * TODO we can type the return of this method as `string | undefined`.
         * But it will be a major (breaking) change for the projects that use this library
         */
        return ''
    }

    /**
     * Get property from OS System Property
     * @param key
     */
    static systemProperty(key: string) {
        return process.env[key]
    }

    private static property(key: string) {
        try {
            let value = dotRef.pick(key, this.getInstance().env[this.getInstance().envEnum])
            if (value) {
                return value
            }
            // Check attr without env
            value = dotRef.pick(key, this.getInstance().env)
            if (value) {
                return value
            }
            return null
        } catch (e) {
            return null;
        }
    }

    private static finding(key: string) {

        if (!this.getInstance().env) {
            return null
        }

        const filterCondition = (k: any) =>
            k.indexOf(key) > -1 && k.indexOf("{") > -1 && k.indexOf("}") > -1

        const envNum = this.getInstance().env[this.getInstance().envEnum]
        const result = envNum
            ? Object.keys(envNum).filter(filterCondition)
            : []

        let parts = []

        if (result.length) {
            parts = result
        } else {
            parts = Object.keys(this.getInstance().env).filter(filterCondition)
        }

        if (parts.length > 0) {
            let partsRef = parts[0].split("{")
            return {
                key: parts[0],
                levels: Number(partsRef[1].replace("}", ""))
            }
        }

        return null
    }

    /**
     * Verify env current eq
     * @param env 
     */
    static acceptedEnv(...args: Env[]): boolean {
        return args.filter(ar => ar == this.getInstance().envEnum).length > 0

    }

    /**
     * Get current env
     */
    static currentEnv(): Env {
        return this.getInstance().envEnum
    }

    /**
     * Get property with relative path
     * @param subs 
     * @param key 
     */
    static getRelativePath(subs: number, key: string): string {
        let property: string = this.property(key)
        if (!property) {
            return property
        }

        let stringBuilder: string = ''

        if (subs == 0) {
            stringBuilder = './'
        } else {
            for (let i = 0; i < subs; i++) {
                stringBuilder = `${stringBuilder}../`
            }
        }

        return `${stringBuilder}${property}`
    }

    static reload() {
        this.instance.startup()
    }

    private startup() {
        if (this.option) {
            console.log(chalk.grey(`Environment options detected..`))
        }

        if (this.option && this.option.manuallyEnv) {
            this.envEnum = this.option.manuallyEnv
        } else {
            const envName = this.option && this.option.keyPropertyEnv
                ? process.env[this.option.keyPropertyEnv]
                : process.env.ENV
            this.envEnum = envName
                ? envName as Env
                : Env.DEV
        }

        console.log(chalk.green(`Environment ${chalk.magentaBright(this.envEnum)} selected!`))

        const yamlFileName = this.option && this.option.fileYamlName
            ? this.option.fileYamlName
            : 'env.yaml'

        try {
            this.env = YAML.parse(fs.readFileSync(yamlFileName.toString()).toString())
        } catch (e) {
            if (e.name === "YAMLException") {
                console.log(chalk.red(`Error in load file yaml (${yamlFileName})`))
                console.log(chalk.red(`Reason ${e.reason}`))
                console.log(chalk.red(`Message: ${e.message}`))
            } else if (e.code === 'ENOENT') {
                console.log(chalk.red(`File (${yamlFileName}) not found error`))
                console.log(chalk.red(`Path ${e.path}`))
            } else {
                console.log(chalk.red(`Error in load file yaml`))
                console.log(chalk.red(e))
            }
        }

        if (process.env.PROPERTY) {
            const propert = process.env.PROPERTY.split(":")
            if (propert.length == 2) {
                console.log(`Seting node env PROPERTY`)
                this.env[propert[0]] = propert[1]
            }
        }
    }
}