var _        = require("lodash");
var request  = require("request");
var path     = require("path");

var last_round;

var module_name = path.basename(__filename, path.extname(__filename));

var randomString = function(len, charSet)
{
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var randomString = '';
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
}

var checkChanges = function(sayAll, next)
{
  console.log("[COINS-E] Fetching...")
  request(
  {
    url:'https://www.coins-e.com/api/v2/markets/list/',
    timeout: 60000
  }, function (error, response, body)
  {
    if (error)
    {
      return next("Fetch error: "+error);
    }
    else if (response.statusCode !== 200)
    {
      return next("Fetch error: response code: "+response.statusCode);
    }

    else
    {
      console.log("[COINS-E] Fetch succeeded.");
    }

    var pairs = [];

    var result;

    try
    {
      result = JSON.parse(body).markets;
    }
    catch(e)
    {
      return next("JSON.parse() failed: "+e.message);
    }
    result.forEach(function(market, i, arr)
    {
      if (market.status === "healthy")
        pairs.push(market.pair);
    });

    console.log("[COINS-E] Pairs found ("+pairs.length+"): "+pairs);

    if (!last_round)
    {
      last_round = pairs;
      console.log("[COINS-E] Initialising last_round, returning.");
      return next();
    }

    //pairs.push(randomString(5));
    //last_round.push(randomString(5));

    if (!_.isEqual(last_round, pairs))
    {
      console.log("[COINS-E] Printing changes...");

      var added = _.difference(pairs, last_round);
      var removed = _.difference(last_round, pairs);

      added.forEach(function(pair, i, arr)
      {
        sayAll("[coins-e] New Pair Added: ["+pair+"] [https://www.coins-e.com/exchange/"+pair+"/]");
      });

      removed.forEach(function(pair, i, arr)
      {
        sayAll("[coins-e] Pair Removed: ["+pair+"]");
      });

      last_round = pairs;

      console.log("[COINS-E] Changes printed, returning.");
      return next();
    }
    else
    {
      console.log("[COINS-E] No difference, returning.");
      return next();
    }

  });
}

module.exports = checkChanges;
