//blockchain.info unconfirmed transactions over 2500
var WebSocket = require("ws");
var config = require("./config");

var say;

var wallsCommand = {
  process: function(command, telegramProcess) {
    say = function(msg) {
      telegramProcess.stdin.write('msg '  + command.sendTo + ' "' + msg + '"\n');
    }

    var ws = new WebSocket('wss://ws.blockchain.info/inv');

    ws.on('open', function()
    {
      console.log("[BLOCKCHAIN WALLS] Connection opened");

      ws.send(JSON.stringify({"op":"unconfirmed_sub"}), function(error)
      {
        if (error)
        {
          console.error("[BLOCKCHAIN WALLS] Subscription failed: "+ error);
          ws.close();
          return init();
        }
        else console.log("[BLOCKCHAIN WALLS] Subscribed");
      });
    });

    ws.on('message', function(data, flags)
    {
      try { var obj = JSON.parse(data); } catch(e) { return console.log("[BLOCKCHAIN WALLS] JSON parse failure: "+data); }

      if (obj.op && obj.op == "utx")
      {
        obj.x.out.forEach(function(output, i, arr)
        {
          if (output.value > (config.blockchain_walls.threshold * 100000000))
          {
            console.log("[BLOCKCHAIN WALLS] New: " + output.addr + " received " + (output.value / 100000000) + " btc");
            //say("New unconfirmed transfer: "+output.addr + " received " + (output.value / 100000000) + " btc.");
            say("[Large-BTC-Movement]: ["+output.addr+"] received ["+(output.value/100000000)+"] btc");
  	  //"New unconfirmed transfer: "+output.addr + " received " + (output.value / 100000000) + " btc.")
          }
        });
      }
    });

    ws.on('close', function()
    {
      console.error("[BLOCKCHAIN WALLS] Disconnected.");
      console.error("[BLOCKCHAIN WALLS] Reconnecting...");
      return wallsCommand.process();
    });
  }
}
module.exports = wallsCommand;
