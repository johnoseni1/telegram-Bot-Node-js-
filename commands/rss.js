var path         = require('path');
var fs           = require('fs');
var FeedParser   = require('feedparser');
var config       = require('./config');
var Iconv        = require('iconv').Iconv;
var _ = require("lodash");
var request = require("request");
var rssState = {};
var say;

var updateRss = function()
{
  setTimeout(updateRss, (config.rssInterval * 60 * 1000));

  console.log("[RSS] Starting update...")

  function done(err)
  {
    if (err)
      //sayAll("RSS Error: "+err);
      console.error("[RSS] "+feed.name + " RSS Error: "+err);
  }

  function maybeTranslate (res, charset) {
    var iconv;
    // Use iconv if its not utf8 already.
    if (!iconv && charset && !/utf-*8/i.test(charset)) {
      try {
        iconv = new Iconv(charset, 'utf-8');
        console.log('Converting from charset %s to utf-8', charset);
        iconv.on('error', done);
        // If we're using iconv, stream will be the output of iconv
        // otherwise it will remain the output of request
        res = res.pipe(iconv);
      } catch(err) {
        res.emit('error', err);
      }
    }
    return res;
  }

  function getParams(str) {
    var params = str.split(';').reduce(function (params, param) {
      var parts = param.split('=').map(function (part) { return part.trim(); });
      if (parts.length === 2) {
        params[parts[0]] = parts[1];
      }
      return params;
    }, {});
    return params;
  }


  config.feeds.forEach(function(feed, i, arr)
  {
    var warming;
    var postCount = 0
    if (!rssState[feed.name])
    {
      warming = true;
      rssState[feed.name] = [];
      console.log("[RSS] Warming "+feed.name);
    }

    var req = request(feed.url,
    {
      timeout: 60000,
      pool: false,
      headers:
      {
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    var feedparser = new FeedParser();

    req.on('error', function(err)
    {
      //sayAll(feed.name+" RSS Error: "+err);
      console.error("[RSS] "+feed.name + " RSS Error: "+err);
    });

    req.on('response', function(res)
    {
      if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
      var charset = getParams(res.headers['content-type'] || '').charset;
      res = maybeTranslate(res, charset);
      res.pipe(feedparser);
    });

    feedparser.on('error', function(err)
    {
      //sayAll(feed.name+" RSS Error: "+err);
      console.error("[RSS] "+feed.name + "RSS Error: "+err);
    });

    feedparser.on('end', function(err)
    {
      if (warming)
      {
        console.log("[RSS] Warmed "+feed.name+" with "+postCount+" articles.");
        warming = false;
      }
      else
      {
        console.log("Finished checking "+feed.name);
      }
    });

    feedparser.on('readable', function()
    {
      var posts = this;
      if (warming)
      {
        var post;
        while (post = posts.read())
        {
          rssState[feed.name].push(post.title);
          postCount++;
        }
      }
      else
      {
        var post;
        while (post = posts.read())
        {
          if (rssState[feed.name].indexOf(post.title) === -1)
          {
            say(feed.name + ": "+ post.title + " ["+post.link+"]");
            rssState[feed.name].push(post.title);
          }
        }
      }
    });
  });
}

var rssCommand = {
  process: function(command, telegramProcess) {
    say = function(msg) {
      telegramProcess.stdin.write('msg '  + command.sendTo + ' "' + msg + '"\n');
    }
    console.log("[RSS] Found " + config.feeds.length + " feeds: " + _.pluck(config.feeds, 'name'));
    setTimeout(updateRss, 20000);
  }
}

module.exports = rssCommand;
