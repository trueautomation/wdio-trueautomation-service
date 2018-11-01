import fetch from 'node-fetch';
import which from 'which';
import fs from 'fs';
import childProcess from 'child_process';
import isPortReachable from 'is-port-reachable';

class TrueautomationLauncher {
    constructor () {
        this.trueautomationLog = null;
        this.port = 3000
    }

    onPrepare (config) {
        this.trueautomationLog = config.trueautomationLog || `trueautomation-${Date.now()}.log`;

        var remote = '';
        var driver = '';

        if (config.host && config.port && config.path &&
            (config.host !== 'localhost' || config.host !== '127.0.0.1')) {
            config.capabilities.forEach((capability) => {
                capability.taRemoteUrl = `http://${config.host}:${config.port}${config.path}`;
            });

            remote = ' --remote';
        }

        if (config.driver) {
            driver = ` --driver ${config.driver}`;

            if (config.driverVersion) {
                driver += `--driver-version ${config.driverVersion}`;
            }
        }

        const executable = config.trueautomationExecutable || process.env.TRUEAUTOMATION_EXEC || 'trueautomation';

        const resolvedExecutable = which.sync(executable, { nothrow: true });

        if (!resolvedExecutable) {
            console.error(`${executable} not found. Can not find TrueAutomation.IO client.`);
            process.exit(-10);
        }

        if (!fs.exists('log')) {
            fs.mkdirSync('log');
        }

        const logfile = `log/${this.trueautomationLog}`;
        const exeString = `${resolvedExecutable} --log-file ${logfile} --port ${this.port}${driver}${remote}`;

        childProcess.exec(exeString);

        return new Promise((resolve, reject) => {
            var counter = 0;

            const checkPort = () => {
                isPortReachable(this.port).then((isReachable) => {
                   if (isReachable) {
                       resolve();
                   } else {
                       if (counter++ < 10) {
                           setTimeout(checkPort, 2000);
                       } else {
                           console.error('Can not start TrueAutomation.IO service');
                           reject();
                       }
                   }
                });
            }
        });
    }

    onComplete() {
        return fetch(`http://localhost:${this.port}/shutdown`);
    }
}

export default TrueautomationLauncher;
