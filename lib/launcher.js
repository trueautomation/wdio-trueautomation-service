const fetch = require('node-fetch')
const which = require('which')
const fs = require('fs')
const path = require('path')
const os = require('os')
const childProcess = require('child_process')
const isPortReachable = require('is-port-reachable')

export default class TrueautomationLauncher {
  constructor () {
    this.trueautomationLog = null
    this.trueautomationPort = null
  }

  onPrepare (config, capabilities) {
    this.trueautomationLog = config.trueautomationLog || `log/trueautomation-${Date.now()}.log`

    var args = []

    if (config.remote) {
      const hostname = config.hostname ? config.hostname : config.host

      const updateCapabilities = (cap) => {
        const taRemoteUrl = `http://${hostname}:${config.port}`
        cap.taRemoteUrl = taRemoteUrl.replace(/\/$/, '')
      }

      if (Array.isArray(capabilities)) {
        capabilities.forEach((capability) => updateCapabilities(capability))
      } else {
        updateCapabilities(capabilities)
      }

      config.hostname = '127.0.0.1'
      config.port = 9151

      args.push('--remote')
    }

    this.trueautomationPort = config.port || 3000
    args.push('--port', this.trueautomationPort)

    if (config.driver) {
      args.push('--driver', config.driver)

      if (config.driverVersion) {
        args.push('--driver-version', config.driverVersion)
      }
    }

    if (this.trueautomationLog) {
      args.push('--log-file', this.trueautomationLog)
    }

    const executable = config.trueautomationExecutable || process.env.TRUEAUTOMATION_EXEC || path.join(os.homedir(), '.trueautomation/bin/trueautomation')

    const resolvedExecutable = which.sync(executable, { nothrow: true })

    if (!resolvedExecutable) {
      console.error(`${executable} not found. Can not find TrueAutomation.IO client.`)
      process.exit(-10)
    }

    if (!fs.existsSync('log')) {
      fs.mkdirSync('log')
    }

    console.log('Executing', resolvedExecutable, args.join(' '))
    const proc = childProcess.spawn(resolvedExecutable, args)

    proc.stdout.on('data', (data) => {
      console.log('trueautomation: ', data.toString())
    })

    proc.stderr.on('data', (data) => {
      console.error('trueautomation: ', data.toString())
    })

    proc.on('close', (code) => {
      console.log(`trueautomation process exited with code ${code}`)
    })

    proc.on('error', (err) => {
      console.log('Failed to start subprocess.', err)
    })

    return new Promise((resolve, reject) => {
      var counter = 0

      const checkPort = () => {
        isPortReachable(this.trueautomationPort).then((isReachable) => {
          if (isReachable) {
            resolve()
          } else {
            if (counter++ < 10) {
              setTimeout(checkPort, 2000)
            } else {
              console.error('Can not start TrueAutomation.IO service')
              reject(new Error('Can not start TrueAutomation.IO service'))
            }
          }
        })
      }

      checkPort()
    })
  }

  onComplete () {
    return fetch(`http://localhost:${this.trueautomationPort}/shutdown`)
  }
}
