# ROIT environment lib
Facilitate environment management in node applications

## Usage
-----------

### Declaring variables in a file:

```
root-path/env.yaml
```

```yaml

serviceName: Service A
serviceInfo:
  version: '1.0'

# Development-specific settings. 
dev:
  port: 3000
  dropDatabase: true
  credential: config/dev/foobar.json
  credentialLevel{3}: foobar.json
  pg:
    host: 172.1.2.208
    user: myuserpg
    pass:
      inner: mysafepass
# Homologation-specific settings. 
hom:
  port: 9001
  dropDatabase: false
  credential: config/hom/foobar.json
# Production-specific settings. 
prod:
  port: 80
  dropDatabase: false
  credential: config/prod/foobar.json
```
### Example for importing and invoking method:

```javascript

import { Environment, Env } from 'roit-environment';

Environment.getProperty("port") // output: 3000

// Verify env is accepted
Environment.acceptedEnv(Env.HOM) // output: false
Environment.acceptedEnv(Env.DEV) // output: true

Environment.currentEnv() // return enum Env

// Relative path example
root
  -config
   --dev
    ---foobar.json
// Param 1: subs level number (3)
// Param 2: key property
Environment.getRelativePath(3, 'credential') // output: ../../../config/dev/foobar.json

// Childrens property 
Environment.getProperty("pg.host") // output: 172.1.2.208
Environment.getProperty("pg.pass.inner") // output: mysafepass

```
### Env Options:

```javascript

// Attributes:
// manuallyEnv: set manual env
// fileYamlName: especify file name for internal loading

import { Environment } from 'roit-environment';

Environment.envOptions({ manuallyEnv: Env.PROD, fileYamlName: 'foo.yaml' })

Environment.getProperty("port") // output: 80 (port from env prod)

```

## Activate environment

Node param

```
ENV=dev node index.js
```

Google function example (--set-env-vars)

```shell
# hom example
gcloud functions deploy FUNCTION_NAME --runtime RUNTIME_PARAM --trigger-http --project PROJECT --set-env-vars ENV=hom
# prod example
gcloud functions deploy FUNCTION_NAME --runtime RUNTIME_PARAM --trigger-http --project PROJECT --set-env-vars ENV=prod
```
