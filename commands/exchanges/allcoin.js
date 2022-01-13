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
  console.log("[ALLCOIN] Fetching...")
  request(
  {
    url:'https://www.allcoin.com/api2/pairs',
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
      console.log("[ALLCOIN] Fetch succeeded.");
    }

    var pairs = [];

    var result;

    try
    {
      result = JSON.parse(body).data;
    }
    catch(e)
    {
      return next("JSON.parse() failed: "+e.message);
    }

    for (var prop in result) {
      if (result.hasOwnProperty(prop)) {
        pairs.push(prop)
      }
    }

    console.log("[ALLCOIN] Pairs found ("+pairs.length+"): "+pairs);

    if (!last_round)
    {
      last_round = pairs;
      console.log("[ALLCOIN] Initialising last_round, returning.");
      return next();
    }

    //pairs.push(randomString(5));
    //last_round.push(randomString(5));

    if (!_.isEqual(last_round, pairs))
    {
      console.log("[ALLCOIN] Printing changes...");

      var added = _.difference(pairs, last_round);
      var removed = _.difference(last_round, pairs);

      added.forEach(function(pair, i, arr)
      {
        sayAll("[allcoin] New Pair Added: ["+pair+"] [https://www.allcoin.com/trade/"+pair+"]");
      });

      removed.forEach(function(pair, i, arr)
      {
        sayAll("[allcoin] Pair Removed: ["+pair+"]");
      });

      last_round = pairs;

      console.log("[ALLCOIN] Changes printed, returning.");
      return next();
    }
    else
    {
      console.log("[ALLCOIN] No difference, returning.");
      return next();
    }

  });
}

module.exports = checkChanges;
