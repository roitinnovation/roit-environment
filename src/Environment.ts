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
        this.loadEnvironment()
    }

    static envOptions(options?: EnvOptions) {
        this.instance.option = options
        this.instance.loadEnvironment()
    }

    private static getInstance(): Environment {
        return this.instance
    }

    /**
     * Get property from OS System Property
     * @param key
     */
    static systemProperty(key: string) {
        return process.env[key]
    }    

    static addProperty(key: string, value: any, setInEnv: boolean = true): void {
        if (setInEnv) {
            const currentEnvVars = this.getInstance().env[this.getInstance().envEnum]
            this.getInstance().env[this.getInstance().envEnum] = this.createDotNotationObject(currentEnvVars, key, value)
        }

        this.getInstance().env = this.createDotNotationObject(this.getInstance().env, key, value)
        this.getInstance().loadEnvVariables()
    }

    private static createDotNotationObject(objectRef: any, key: string, value: any) {
        const object = objectRef || {}
        if (!key.includes(".")) {
            object[key] = value
            return object
        }
        return dotRef.str(key, value, object)
    }

    private static getEnvValue(key: string) {
        const envValue = this.getValueFromCurrentEnv(key)
        if (envValue) return envValue

        return this.getValueFromGlobalEnv(key)
    }   

    private static getValueFromCurrentEnv(key: string) {
        try {
            return dotRef.pick(key, this.getInstance().env[this.getInstance().envEnum])
        } catch {
            return null
        }
    }

    private static getValueFromGlobalEnv(key: string) {
        try {
            return dotRef.pick(key, this.getInstance().env)
        } catch {
            return null
        }
    }

    static acceptedEnv(...environments: Env[]): boolean {
        return environments.includes(this.getInstance().envEnum)
    }

    static currentEnv(): Env {
        return this.getInstance().envEnum
    }

    private loadEnvironment() {
        this.setEnvironmentType()
        this.loadYamlFile()
        this.handlePropertyOverride()
    }

    private setEnvironmentType() {
        if (this.option?.manuallyEnv) {
            this.envEnum = this.option.manuallyEnv
            return
        }

        const envKey = this.option?.keyPropertyEnv || 'ENV'
        this.envEnum = (process.env[envKey] as Env) || Env.DEV
        
        console.log(chalk.green(`Environment ${chalk.magentaBright(this.envEnum)} selected!`))
    }

    private loadYamlFile() {
        const yamlFileName = this.option?.fileYamlName || 'env.yaml'

        try {
            this.env = YAML.parse(fs.readFileSync(yamlFileName).toString())
            this.loadEnvVariables()
        } catch (error: any) {
            this.handleYamlError(error, yamlFileName)
        }
    }

    private handleYamlError(error: any, fileName: string) {
        if (error.name === "YAMLException") {
            console.log(chalk.red(`Error in load file yaml (${fileName})`))
            console.log(chalk.red(`Reason ${error.reason}`))
            console.log(chalk.red(`Message: ${error.message}`))
            return
        }
        
        if (error.code === 'ENOENT') {
            console.log(chalk.red(`File (${fileName}) not found error`))
            console.log(chalk.red(`Path ${error.path}`))
            return
        }

        console.log(chalk.red(`Error in load file yaml`))
        console.log(chalk.red(error))
    }

    private handlePropertyOverride() {
        if (!process.env.PROPERTY) return

        const [key, value] = process.env.PROPERTY.split(":")
        if (value) {
            this.env[key] = value
            process.env[key] = value
        }
    }

    private loadEnvVariables() {
        const currentEnvVars = this.env[this.envEnum]
        if (currentEnvVars) {
            this.processEnvironmentVariables(currentEnvVars, '')
        }
        
        const globalVars = {...this.env}
        delete globalVars[this.envEnum]
        this.processEnvironmentVariables(globalVars, '')
    }

    private processEnvironmentVariables(obj: any, prefix: string) {
        Object.entries(obj).forEach(([key, value]) => {
            const fullKey = prefix ? `${prefix}.${key}` : key

            if (this.isObject(value)) {
                this.processEnvironmentVariables(value, fullKey)
                return
            }

            if (this.isLeveledKey(key)) {
                this.processLeveledVariable(key, value as string)
                return
            }

            this.setEnvironmentVariable(fullKey, value)
        })
    }

    private isObject(value: any): value is object {
        return typeof value === 'object' && value !== null
    }

    private isLeveledKey(key: string): boolean {
        return key.includes('{') && key.includes('}')
    }

    private processLeveledVariable(key: string, value: string) {
        const [baseName] = key.split('{')
        const levels = Number(key.split('{')[1].replace('}', ''))
        const path = this.buildRelativePath(levels)
        
        process.env[baseName.toUpperCase()] = path + value
    }

    private buildRelativePath(levels: number): string {
        if (levels === 0) return './'
        return '../'.repeat(levels)
    }

    private setEnvironmentVariable(key: string, value: any) {
        const envKey = key.toUpperCase().replace(/\./g, '_')
        if (value) {
            process.env[envKey] = value.toString()
        }
    }

    static getProperty(key: string): string {
        const leveledValue = this.findLeveledValue(key)
        if (leveledValue) {
            return this.getRelativePath(leveledValue.levels, leveledValue.key)
        }
        
        const value = this.getEnvValue(key)
        if (value) {
            return value
        }

        const envKey = key.toUpperCase().replace(/\./g, '_')
        return process.env[envKey] || ''
    }

    private static findLeveledValue(key: string) {
        if (!this.getInstance().env) return null

        const matchingKeys = this.findKeysWithLevel(key)
        if (!matchingKeys.length) return null

        const [keyWithLevel] = matchingKeys
        const [_, levelPart] = keyWithLevel.split('{')
        return {
            key: keyWithLevel,
            levels: Number(levelPart.replace('}', ''))
        }
    }

    private static findKeysWithLevel(key: string): string[] {
        const hasLevel = (k: string) => k.includes(key) && k.includes('{') && k.includes('}')
        
        const currentEnvKeys = Object.keys(this.getInstance().env[this.getInstance().envEnum] || {})
        const matchingCurrentEnvKeys = currentEnvKeys.filter(hasLevel)
        
        if (matchingCurrentEnvKeys.length) return matchingCurrentEnvKeys
        
        return Object.keys(this.getInstance().env).filter(hasLevel)
    }

    static getRelativePath(levels: number, key: string): string {
        const value = this.getEnvValue(key)
        if (!value) return value

        return this.buildRelativePath(levels) + value
    }

    private static buildRelativePath(levels: number): string {
        if (levels === 0) return './'
        return '../'.repeat(levels)
    }

    static reload() {
        this.instance.loadEnvironment()
    }
}
