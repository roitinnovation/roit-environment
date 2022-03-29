"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotRef = require("dot-object");
const chalk_1 = require("chalk");
const Env_1 = require("./Env");
const fs = require("fs");
const YAML = require("yamljs");
class Environment {
    constructor() {
        this.envEnum = Env_1.Env.DEV;
        this.startup();
    }
    static envOptions(options) {
        this.instance.option = options;
        this.instance.startup();
    }
    static getInstance() {
        return this.instance;
    }
    static addProperty(key, value, setInEnv = true) {
        if (setInEnv) {
            this.getInstance().env[this.getInstance().envEnum] = this.getValueDot(this.getInstance().env[this.getInstance().envEnum], key, value);
        }
        this.getInstance().env = this.getValueDot(this.getInstance().env, key, value);
    }
    static getValueDot(objectRef, key, value) {
        let object = objectRef ? objectRef : {};
        if (key.indexOf(".") == -1) {
            object[key] = value;
            return object;
        }
        return dotRef.str(key, value, object);
    }
    /**
     * Get property from file (env.yaml) create in root path.
     * See more in https://www.npmjs.com/package/roit-environment
     * @param key
     */
    static getProperty(key) {
        const value = this.property(key);
        if (value) {
            return value;
        }
        // Check levels
        const finding = this.finding(key);
        if (finding) {
            return this.getRelativePath(finding.levels, finding.key);
        }
        /*
         * TODO we can type the return of this method as `string | undefined`.
         * But it will be a major (breaking) change for the projects that use this library
         */
        return '';
    }
    /**
     * Get property from OS System Property
     * @param key
     */
    static systemProperty(key) {
        return process.env[key];
    }
    static property(key) {
        try {
            let value = dotRef.pick(key, this.getInstance().env[this.getInstance().envEnum]);
            if (value) {
                return value;
            }
            // Check attr without env
            value = dotRef.pick(key, this.getInstance().env);
            if (value) {
                return value;
            }
            return null;
        }
        catch (e) {
            return null;
        }
    }
    static finding(key) {
        if (!this.getInstance().env) {
            return null;
        }
        const filterCondition = (k) => k.indexOf(key) > -1 && k.indexOf("{") > -1 && k.indexOf("}") > -1;
        const envNum = this.getInstance().env[this.getInstance().envEnum];
        const result = envNum
            ? Object.keys(envNum).filter(filterCondition)
            : [];
        let parts = [];
        if (result.length) {
            parts = result;
        }
        else {
            parts = Object.keys(this.getInstance().env).filter(filterCondition);
        }
        if (parts.length > 0) {
            let partsRef = parts[0].split("{");
            return {
                key: parts[0],
                levels: Number(partsRef[1].replace("}", ""))
            };
        }
        return null;
    }
    /**
     * Verify env current eq
     * @param env
     */
    static acceptedEnv(...args) {
        return args.filter(ar => ar == this.getInstance().envEnum).length > 0;
    }
    /**
     * Get current env
     */
    static currentEnv() {
        return this.getInstance().envEnum;
    }
    /**
     * Get property with relative path
     * @param subs
     * @param key
     */
    static getRelativePath(subs, key) {
        let property = this.property(key);
        if (!property) {
            return property;
        }
        let stringBuilder = '';
        if (subs == 0) {
            stringBuilder = './';
        }
        else {
            for (let i = 0; i < subs; i++) {
                stringBuilder = `${stringBuilder}../`;
            }
        }
        return `${stringBuilder}${property}`;
    }
    static reload() {
        this.instance.startup();
    }
    startup() {
        if (this.option) {
            console.log(chalk_1.default.grey(`Environment options detected..`));
        }
        if (this.option && this.option.manuallyEnv) {
            this.envEnum = this.option.manuallyEnv;
        }
        else {
            const envName = this.option && this.option.keyPropertyEnv
                ? process.env[this.option.keyPropertyEnv]
                : process.env.ENV;
            this.envEnum = envName
                ? envName
                : Env_1.Env.DEV;
        }
        console.log(chalk_1.default.green(`Environment ${chalk_1.default.magentaBright(this.envEnum)} selected!`));
        const yamlFileName = this.option && this.option.fileYamlName
            ? this.option.fileYamlName
            : 'env.yaml';
        try {
            this.env = YAML.parse(fs.readFileSync(yamlFileName.toString()).toString());
        }
        catch (e) {
            if (e.name === "YAMLException") {
                console.log(chalk_1.default.red(`Error in load file yaml (${yamlFileName})`));
                console.log(chalk_1.default.red(`Reason ${e.reason}`));
                console.log(chalk_1.default.red(`Message: ${e.message}`));
            }
            else if (e.code === 'ENOENT') {
                console.log(chalk_1.default.red(`File (${yamlFileName}) not found error`));
                console.log(chalk_1.default.red(`Path ${e.path}`));
            }
            else {
                console.log(chalk_1.default.red(`Error in load file yaml`));
                console.log(chalk_1.default.red(e));
            }
        }
        if (process.env.PROPERTY) {
            const propert = process.env.PROPERTY.split(":");
            if (propert.length == 2) {
                console.log(`Seting node env PROPERTY`);
                this.env[propert[0]] = propert[1];
            }
        }
    }
}
exports.Environment = Environment;
Environment.instance = new Environment;
