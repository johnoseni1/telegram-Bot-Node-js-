
var fs = require('fs');
var _ = require('lodash');
var stripAnsi = require('strip-ansi');
var spawn = require('child_process').spawn;
var telegramProcess = spawn('./startbot.sh');

var Config = { };
var CommandProcessers = {};
telegramProcess.stdout.setEncoding('utf8');

// Give process 2secs to start before watching stdout
setTimeout(function() {

    console.log('starting bot');
    // Need to call dialog_list to get all chats and contacts
    telegramProcess.stdin.write('dialog_list\n');

    loadConfig(function(configdata) {
        Config = configdata;
        telegramProcess.stdout.on('data', function(data) {
            var lines = data.toString().split('\n');

            // telegram cli constantly outputs '>', don't bother trying to parse those
            if (lines.length > 1) {
                // telegram cli uses ansi color codes...need to strip them for parsing
                //lines = _.map(lines, function(line) {
                //    return stripAnsi(line);
                //});

                // Message output should always be in the first line of data
                if (lines[0].indexOf('>>>') > -1) {
                    console.log(lines[0]);
                    var commandObj = buildCommandObj(lines[0]);
                    processCommand(commandObj);
                }
            }
        });
    });
}, 2000);

function parseCLIOutput(data) {
    var splitData = data.split(' >>> ');
    // Message is always the last element
    var message = splitData[splitData.length - 1];
    message = stripAnsi(message);
    var split = splitData[0].replace(/\[35\;1m/g, '');
    split = split.replace(/\[0\;31m/g, '');
    split = split.replace(/\[1\;31m/g, '');
    split = split.replace(/\[0m/g, '');
    split = split.replace(/\[34\;1m/g, '');
    split = split.replace(/\[32\;1m/g, '');
    split = split.replace(/\r/, '');
    split = split.replace(/\[K/, '');
    split = split.replace(/\u001b\s/g, '\u001b');
    split = split.replace(/\s\u001b/g, '\u001b');
    split = split.replace(/\u001b\u001b/g, '\u001b');

    //User/Group to send to will always be the 3rd element.
    // User who sent the message is always last element of meta data.
    // Above statement is lies, does not account for spaces in user or group name
    
    var splitarr= split.split('\u001b');
    var sendTo = splitarr[2].replace(/\s/g, '_');
    var user = splitarr[3].replace(/\s/g, '_');  

    if (user == '') {
      if (splitarr.length > 4) {
        user = splitarr[4].replace(/\s/g, '_');
      } else {
        user = splitarr[2].replace(/\s/g, '_');
      }
    }

    var obj = {sendTo: sendTo, user: user, message: message};
    return obj;
}

function parseMessage(message) {
    var commandIdentifier = message.substring(0, 1);
    message = message.substring(1, message.length);

    // Only process messages that start with "!" as commands
    if (commandIdentifier === '!') {
        var command = message.match(/^[^\s]+/);

        // Should always be 1
        if (command.length > 0) {
            command = command[0];
        } else {
            return false;
        }

        var commandArgs = message.substring(command.length + 1, message.length);

        return {
            command: command,
            args: commandArgs
        };
    } else {
        return false;
    }
}

function processCommand(commandObj) {
    // Find command processor from config file
    var commandConfig = _.find(Config.commands, function(c) {
        //console.log(c);
        return c.command === commandObj.command.command;
    });
    if (commandConfig) {
        // Check if the command was already proccessed previously.
        if (!CommandProcessers[commandConfig.command]) {
            CommandProcessers[commandConfig.command] = require('./commands/' + commandConfig.processor);
        }
        CommandProcessers[commandConfig.command].process(commandObj, telegramProcess);
    } else {
        console.log('Could not find command');
    }
}

function buildCommandObj(data) {
    var parsedOutput = parseCLIOutput(data);
    var parsedMessage = parseMessage(parsedOutput.message);

    return {
        sendTo: parsedOutput.sendTo,
        user: parsedOutput.user,
        command: parsedMessage
    };
}

function loadConfig(callback) {
    fs.readFile('config.js', 'utf8', function(err, data) {
        if (err)
            return console.log(err);

        callback(JSON.parse(data));
    });
}
