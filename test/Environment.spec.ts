import { expect } from 'chai';
import 'mocha';
import { Environment, Env } from '../src/';

describe('Environment tests', () => {

  it('Option set manually env PROD test', async () => {

    Environment.envOptions({ manuallyEnv: Env.PROD })

    const portProd = Environment.getProperty("port")

    expect(portProd).to.equal(80)
    expect(Environment.currentEnv()).to.equal(Env.PROD)

    Environment.reload()

  });


  it('Option set manually env HOM test', async () => {

    Environment.envOptions({ manuallyEnv: Env.HOM })

    const portProd = Environment.getProperty("port")

    expect(portProd).to.equal(9001)
    expect(Environment.currentEnv()).to.equal(Env.HOM)

    Environment.envOptions()
    Environment.reload()
  });

  it('Get attributes with children test', async () => {

    const passInner = Environment.getProperty("pg.pass.inner")
    const user = Environment.getProperty("pg.user")
    const host = Environment.getProperty("pg.host")

    expect(passInner).to.equal('mysafepass')
    expect(user).to.equal('myuserpg')
    expect(host).to.equal('172.1.2.208')
  });

  it('File not found test', async () => {

    Environment.reload()

    Environment.envOptions({ fileYamlName: 'erro.yaml' })
    Environment.getProperty("env")
    try {

    } catch (e) {

    }
  });

  it('Accepted env test', async () => {

    Environment.reload()

    Environment.envOptions({ manuallyEnv: Env.PROD })

    expect(Environment.acceptedEnv(Env.PROD, Env.HOM)).to.equal(true)
    expect(Environment.acceptedEnv(Env.HOM)).to.equal(false)

  });

  it('Attr without env', async () => {

    Environment.reload()

    expect(Environment.getProperty("serviceName")).to.equal("Service A")
    expect(Environment.getProperty("serviceInfo.version")).to.equal("1.0")
  });


  it('Attr levels', async () => {

    Environment.envOptions()
    Environment.reload()
    expect(Environment.getProperty("credentialLevel")).to.equal("../../../foobar.json")
  });

  it('Add property', async () => {

    Environment.envOptions()
    Environment.reload()

    Environment.addProperty('aaaaa', 456)
    Environment.addProperty('bbbbb', 'AAA', false)


    expect(Environment.getProperty("aaaaa")).to.equal(456)
    expect(Environment.getProperty("bbbbb")).to.equal('AAA')
  });

  it('Add property objct', async () => {

    Environment.envOptions()
    Environment.reload()

    Environment.addProperty('userInfo.user', 456)
    Environment.addProperty('userInfo.name', 'Jhon')
    Environment.addProperty('userInfo.pass', 'AAA', false)

    expect(Environment.getProperty("userInfo.user")).to.equal(456)
    expect(Environment.getProperty("userInfo.name")).to.equal('Jhon')
    expect(Environment.getProperty("userInfo.pass")).to.equal('AAA')
  });

});