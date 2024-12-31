import { expect } from 'chai';
import 'mocha';
import { Environment, Env } from '../src/';

describe('Environment tests', () => {

  it('Option set manually env PROD test', async () => {

    Environment.envOptions({ manuallyEnv: Env.PROD })

    const portProd = process.env.PORT

    expect(portProd).to.equal("80")
    expect(Environment.currentEnv()).to.equal(Env.PROD)

    Environment.reload()

  });


  it('Option set manually env HOM test', async () => {

    Environment.envOptions({ manuallyEnv: Env.HOM })

    const portProd = process.env.PORT

    expect(portProd).to.equal("9001")
    expect(Environment.getProperty('port')).to.equal(9001)
    expect(Environment.currentEnv()).to.equal(Env.HOM)

    Environment.envOptions()
    Environment.reload()
  });

  it('Get attributes with children test', async () => {

    const passInner = process.env.PG_PASS_INNER
    const user = process.env.PG_USER
    const host = process.env.PG_HOST

    expect(passInner).to.equal('mysafepass')
    expect(user).to.equal('myuserpg')
    expect(host).to.equal('172.1.2.208')

    expect(Environment.getProperty('pg.pass.inner')).to.equal('mysafepass')
    expect(Environment.getProperty('pg.user')).to.equal('myuserpg')
    expect(Environment.getProperty('pg.host')).to.equal('172.1.2.208')
  });

  it('File not found test', async () => {

    Environment.reload()

    Environment.envOptions({ fileYamlName: 'erro.yaml' })
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

    expect(process.env.SERVICENAME).to.equal("Service A")
    expect(process.env.SERVICEINFO_VERSION).to.equal("1.0")
    expect(Environment.getProperty('serviceName')).to.equal("Service A")
    expect(Environment.getProperty('serviceInfo.version')).to.equal("1.0")
  });


  it('Attr levels', async () => {
    Environment.envOptions()
    Environment.reload()
    expect(process.env.CREDENTIALLEVEL).to.equal("../../../foobar.json")
  });

  it('Add property', async () => {

    Environment.envOptions()
    Environment.reload()

    Environment.addProperty('aaaaa', 456)
    Environment.addProperty('bbbbb', 'AAA', false)


    expect(process.env.AAAAA).to.equal('456')
    expect(process.env.BBBBB).to.equal('AAA')
    expect(Environment.getProperty('aaaaa')).to.equal(456)
    expect(Environment.getProperty('bbbbb')).to.equal('AAA')
  });

  it('Add property objct', async () => {

    Environment.envOptions()
    Environment.reload()

    Environment.addProperty('userInfo.user', 456)
    Environment.addProperty('userInfo.name', 'Jhon')
    Environment.addProperty('userInfo.pass', 'AAA', false)

    expect(process.env.USERINFO_USER).to.equal('456')
    expect(process.env.USERINFO_NAME).to.equal('Jhon')
    expect(process.env.USERINFO_PASS).to.equal('AAA')

    expect(Environment.getProperty('userInfo.user')).to.equal(456)
    expect(Environment.getProperty('userInfo.name')).to.equal('Jhon')
    expect(Environment.getProperty('userInfo.pass')).to.equal('AAA')
  });

  it('should handle nested objects correctly', async () => {
    Environment.envOptions()
    Environment.reload()

    Environment.addProperty('database.credentials.user', 'admin')
    Environment.addProperty('database.credentials.password', 'secret')
    Environment.addProperty('database.host', 'localhost')

    expect(Environment.getProperty('database.credentials.user')).to.equal('admin')
    expect(Environment.getProperty('database.credentials.password')).to.equal('secret')
    expect(Environment.getProperty('database.host')).to.equal('localhost')

    expect(process.env.DATABASE_CREDENTIALS_USER).to.equal('admin')
    expect(process.env.DATABASE_CREDENTIALS_PASSWORD).to.equal('secret')
    expect(process.env.DATABASE_HOST).to.equal('localhost')
  })

  it('should handle multiple level indicators in environment', async () => {
    Environment.envOptions()
    Environment.reload()

    Environment.addProperty('config{0}', 'local.json')
    Environment.addProperty('assets{1}', 'images')
    Environment.addProperty('libs{2}', 'external')

    expect(Environment.getProperty('config')).to.equal('./local.json')
    expect(Environment.getProperty('assets')).to.equal('../images')
    expect(Environment.getProperty('libs')).to.equal('../../external')

    expect(process.env.CONFIG).to.equal('./local.json')
    expect(process.env.ASSETS).to.equal('../images')
    expect(process.env.LIBS).to.equal('../../external')
  })

  it('should override environment specific variables with global ones', async () => {
    Environment.envOptions({ manuallyEnv: Env.DEV })
    Environment.reload()

    Environment.addProperty('api.url', 'http://dev-api.com', true)
    
    Environment.addProperty('api.url', 'http://global-api.com', true)

    expect(process.env.API_URL).to.equal('http://global-api.com')
    expect(Environment.getProperty('api.url')).to.equal('http://global-api.com')
  })

  it('should handle type conversions correctly', async () => {
    Environment.envOptions()
    Environment.reload()

    Environment.addProperty('server.port', 3000)
    Environment.addProperty('features.enabled', true)
    Environment.addProperty('app.version', 1.5)

    expect(process.env.SERVER_PORT).to.equal('3000')
    expect(process.env.FEATURES_ENABLED).to.equal('true')
    expect(process.env.APP_VERSION).to.equal('1.5')

    expect(Environment.getProperty('server.port')).to.equal(3000)
    expect(Environment.getProperty('features.enabled')).to.equal(true)
    expect(Environment.getProperty('app.version')).to.equal(1.5)
  })

});