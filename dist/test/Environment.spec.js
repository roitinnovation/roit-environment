"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const _1 = require("../src/");
describe('Environment tests', () => {
    it('Option set manually env PROD test', () => __awaiter(this, void 0, void 0, function* () {
        _1.Environment.envOptions({ manuallyEnv: _1.Env.PROD });
        const portProd = _1.Environment.getProperty("port");
        chai_1.expect(portProd).to.equal(80);
        chai_1.expect(_1.Environment.currentEnv()).to.equal(_1.Env.PROD);
        _1.Environment.reload();
    }));
    it('Option set manually env HOM test', () => __awaiter(this, void 0, void 0, function* () {
        _1.Environment.envOptions({ manuallyEnv: _1.Env.HOM });
        const portProd = _1.Environment.getProperty("port");
        chai_1.expect(portProd).to.equal(9001);
        chai_1.expect(_1.Environment.currentEnv()).to.equal(_1.Env.HOM);
        _1.Environment.envOptions();
        _1.Environment.reload();
    }));
    it('Get attributes with children test', () => __awaiter(this, void 0, void 0, function* () {
        const passInner = _1.Environment.getProperty("pg.pass.inner");
        const user = _1.Environment.getProperty("pg.user");
        const host = _1.Environment.getProperty("pg.host");
        chai_1.expect(passInner).to.equal('mysafepass');
        chai_1.expect(user).to.equal('myuserpg');
        chai_1.expect(host).to.equal('172.1.2.208');
    }));
    it('File not found test', () => __awaiter(this, void 0, void 0, function* () {
        _1.Environment.reload();
        _1.Environment.envOptions({ fileYamlName: 'erro.yaml' });
        _1.Environment.getProperty("env");
        try {
        }
        catch (e) {
        }
    }));
    it('Accepted env test', () => __awaiter(this, void 0, void 0, function* () {
        _1.Environment.reload();
        _1.Environment.envOptions({ manuallyEnv: _1.Env.PROD });
        chai_1.expect(_1.Environment.acceptedEnv(_1.Env.PROD, _1.Env.HOM)).to.equal(true);
        chai_1.expect(_1.Environment.acceptedEnv(_1.Env.HOM)).to.equal(false);
    }));
    it('Attr without env', () => __awaiter(this, void 0, void 0, function* () {
        _1.Environment.reload();
        chai_1.expect(_1.Environment.getProperty("serviceName")).to.equal("Service A");
        chai_1.expect(_1.Environment.getProperty("serviceInfo.version")).to.equal("1.0");
    }));
    it('Attr levels', () => __awaiter(this, void 0, void 0, function* () {
        _1.Environment.envOptions();
        _1.Environment.reload();
        chai_1.expect(_1.Environment.getProperty("credentialLevel")).to.equal("../../../foobar.json");
    }));
    it('Add property', () => __awaiter(this, void 0, void 0, function* () {
        _1.Environment.envOptions();
        _1.Environment.reload();
        _1.Environment.addProperty('aaaaa', 456);
        _1.Environment.addProperty('bbbbb', 'AAA', false);
        chai_1.expect(_1.Environment.getProperty("aaaaa")).to.equal(456);
        chai_1.expect(_1.Environment.getProperty("bbbbb")).to.equal('AAA');
    }));
    it('Add property objct', () => __awaiter(this, void 0, void 0, function* () {
        _1.Environment.envOptions();
        _1.Environment.reload();
        _1.Environment.addProperty('userInfo.user', 456);
        _1.Environment.addProperty('userInfo.name', 'Jhon');
        _1.Environment.addProperty('userInfo.pass', 'AAA', false);
        chai_1.expect(_1.Environment.getProperty("userInfo.user")).to.equal(456);
        chai_1.expect(_1.Environment.getProperty("userInfo.name")).to.equal('Jhon');
        chai_1.expect(_1.Environment.getProperty("userInfo.pass")).to.equal('AAA');
    }));
});
