"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EnvOptionsSetter {
    constructor() { }
    static getInstance() {
        return this.instance;
    }
    static options(option) {
        this.getInstance().option = option;
    }
    static getOptions() {
        return this.getInstance().option;
    }
    static reset() {
        this.getInstance().option = null;
    }
}
EnvOptionsSetter.instance = new EnvOptionsSetter;
exports.EnvOptionsSetter = EnvOptionsSetter;
