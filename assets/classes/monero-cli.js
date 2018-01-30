var spawn = require('child_process').spawn;
var os = require('os');
var path = require('path');
var debug = require('debug')('xmr-stak-gui-class-monero-cli');

class moneroCli {
    constructor() {}

    async launchMoneroCli(args) {
        if (os.type() === "Linux") {
            debug('OS Type: Linux');
            debug(`Spawning child process xmr-stak with the paramiters: ${args}`);
            var child = spawn(path.join(__dirname, '../monero-cli/monero-wallet-cli'), args);
            return child;

        } else if (os.type() === "Windows_NT") {
            debug('OS Type: Windows_NT');
            debug(`Spawning child process xmr-stak with the paramiters: ${args}`);
            var child = spawn(path.join(__dirname, '../monero-cli/monero-wallet-cli.exe'), args);
            return child;
        } else {
            debug('Failed to launch xmr-stak. Your OS is not supported');
            return false;
        }
    }

    async getVersion() {
        var child = await this.launchMoneroCli([`--version`]);
        if (child) { // child === false if launchMoneroCli fails

            child.stdout.on('data', function (data) {
                setTimeout(function () { // Wait a second for the full chunk of data
                    debug(`stdout: ${data}`);
                    var version = data.toString('utf8');
                    version = version.replace('Monero ', '');
                    debug('Version:' + version);
                    $('#MoneroCliVersion').text(`and Monero-CLI: ${version}`);
                    return version;
                }, 1000);
            });

            child.stderr.on('data', function (data) {
                debug(`stderr: ${data}`);
            });
            child.on('close', function (code) {
                debug(`Closing code: ${code}`);
            });
            child.on('error', function (err) { // If xmr-stak cant be found
                $('#MoneroCliVersion').text(`and Monero-CLI: Not Found`);
            });
        }
    }

    async generateAddress(walletName, password) {

        var walletAddressRegex = /[a-z0-9A-Z]{95}/g // Wallet Address Regex
        var viewKeyRegex = /[a-z0-9A-Z]{64}/g // View Key Regex
        var seedRegex = /(^ *\w+(?: +\w+){4,}$\n)/gm // Seed Regex

        var child = await this.launchMoneroCli([`--generate-new-wallet`, `./assets/wallets/${walletName}`]);
        await child.stdin.write(`${password}\n`); // Enter the wallet password
        await child.stdin.write(`1\n`); // Select English as the language
        await child.stdin.write(`exit\n`); // Exit the CLI
        child.stdout.on('data', function (data) {
                debug(`stdout: ${data}`);
                if (data.includes(`Generated new wallet`)) { // Find the text regarding the wallet address and view key and output them to the user
                    debug('Wallet Created');
                    var walletResult = walletAddressRegex.exec(data);
                    debug(`Wallet address is: ${walletResult}`)
                    $(`#walletAddress`).text(walletResult);

                    var viewKeyResult = viewKeyRegex.exec(data);
                    debug(`Wallet view key is: ${viewKeyResult}`)
                    $(`#viewKey`).text(viewKeyResult);
                } else if (data.includes(`PLEASE NOTE: the following`)) { // Find the text regarding the wallet seed and output them to the user
                    var seedResult = seedRegex.exec(data);
                    debug(`Seed is: ${data}`);
                    $(`#seed`).text(data);

                } else if (data.includes(`failed to generate new wallet: file already exists`)) {
                    $(`#walletAddress`).text('Error, a wallet with that address already exists. Please choose a different name or open the wallet');
                }
        });

        child.stderr.on('data', function (data) {
            debug(`stderr: ${data}`);
        });

        child.on('close', function (code) {
            debug(`Closing code: ${code}`);
        });

        child.on('error', function (err) { // If xmr-stak cant be found
            debug(`Failed to launch monero-wallet-cli. Error: ${err}`)
        });
    }

}

module.exports = moneroCli;