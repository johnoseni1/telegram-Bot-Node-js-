var fs = require("fs");
var path = require("path");
var config = require('./config');

var exchanges = {};
var say;


var pairsCommand = {
  process: function(command, telegramProcess) {
    say = function(msg) {
      telegramProcess.stdin.write('msg '  + command.sendTo + ' "' + msg + '"\n');
    }
    console.log("[PAIRS] Loading exchanges...")
    var exchangeDir = path.join(__dirname, 'exchanges')
    var files = fs.readdirSync(exchangeDir);

    files.forEach(function (filename)
    {

      filename = path.join(exchangeDir, filename);
      var ext = path.extname(filename);
      var basename = path.basename(filename, ext);

      if ((path.basename(filename).toLowerCase() === 'index.js') ||
          (!fs.statSync(filename).isFile()) ||
          (ext.toLowerCase() !== '.js'))
        return;

      exchanges[basename] = require(filename);

    });

    exchangeNames = Object.keys(exchanges).sort();

    console.log("[PAIRS] Found " + exchangeNames.length + " exchanges: " + exchangeNames);
    setTimeout(checkChanges, 20000);
  }
};

var checkChanges = function()
{
  var currentCheck = 0;
  var lastCheckName;

  function runCheck(err)
  {
    if (err)
      console.error("[PAIRS] "+lastCheckName+" failed: "+err);

    if (currentCheck == exchangeNames.length)
    {
      console.log("[PAIRS] Run finished, next check in "+config.interval+" minutes.");
      setTimeout(checkChanges, (config.interval * 60 * 1000));
      return;
    }

    lastCheckName = exchangeNames[currentCheck];

    exchanges[exchangeNames[currentCheck++]](say, runCheck);
  }

  console.log("[PAIRS] Starting fetch...")
  runCheck();

}


module.exports = pairsCommand;