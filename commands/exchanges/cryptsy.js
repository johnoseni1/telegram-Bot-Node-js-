var _        = require("lodash");
var request  = require("request");
var path     = require("path");

var last_round;
var cookieJar = request.jar()


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
  console.log("[CRYPTSY] Fetching...")

  request(
  {
    url:'http://pubapi.cryptsy.com/api.php?method=marketdatav2',
    timeout: 60000,
    jar: cookieJar
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
      console.log("[CRYPTSY] Fetch succeeded.");
    }

    var pairs = [];

    var result;

    try
    {
      var parsedBody = JSON.parse(body);

      if (!parsedBody.success)
        return next("request not successful");

      result = parsedBody.return.markets;
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

    if (pairs.length < 10)
      return next("Too few pairs returned");

    console.log("[CRYPTSY] Pairs found ("+pairs.length+"): "+pairs);

    if (!last_round)
    {
      last_round = pairs;
      console.log("[CRYPTSY] Initialising last_round, returning.");
      return next();
    }

    //pairs.push(randomString(5));
    //last_round.push(randomString(5));

    if (!_.isEqual(last_round, pairs))
    {
      console.log("[CRYPTSY] Printing changes...");

      var added = _.difference(pairs, last_round);
      var removed = _.difference(last_round, pairs);

      added.forEach(function(pair, i, arr)
      {
        sayAll("[cryptsy] New Pair Added: ["+pair+"] [https://www.cryptsy.com/markets/view/"+pair.replace("/", "_")+"]");
      });

      removed.forEach(function(pair, i, arr)
      {
        sayAll("[cryptsy] Pair Removed: ["+pair+"]");
      });

      last_round = pairs;

      console.log("[CRYPTSY] Changes printed, returning.");
      return next();
    }
    else
    {
      console.log("[CRYPTSY] No difference, returning.");
      return next();
    }

  });
}

module.exports = checkChanges;
