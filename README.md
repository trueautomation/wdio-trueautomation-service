WDIO TrueAutomation.IO Service
=========

This service allows to run TrueAutomation.IO tests with the [WDIO TestRunner](http://webdriver.io/guide/testrunner/gettingstarted.html).

## Installation

The easiest way is to keep `wdio-trueautomation-service` as a devDependency in your `package.json`.

```json
{
  "devDependencies": {
    "wdio-trueautomation-service": "~0.3"
  }
}
```

You can simple do it by:

```bash
npm install wdio-trueautomation-service --save-dev
```

Instructions on how to install `WebdriverIO` can be found [here.](http://webdriver.io/guide/getstarted/install.html)

## Configuration

In order to use the service you need to add `selenium-standalone` to your service array:

```js
// wdio.conf.js
export.config = {
  // ...
  services: ['selenium-standalone'],
  // ...
};
```

## Options

### trueautomationLog
Path to logfile

Type: `String`

Default: `log/trueautomation-${Date.now()}.log`

### trueautomationPort
Port that `truautomation` will be listen to

Type: `Integer`

Default: `9515`

### driver
TrueAutomation.IO driver to use

Type: `String`

Default: `chromedriver`

### driverVersion
TrueAutomation.IO driver version to use

Type: `String`

Default: `latest`
