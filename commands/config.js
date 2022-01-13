var config =
{
  "irc":
  {
    "channels": [],
    "server": 'irc.altcoinweb.com',
    "nick": 'CollinBot',
    "password": null,
    "userName": 'alert',
    "realName": 'alert',
    "port": 6667,
    "debug": false,
    "floodProtection": true,
    "floodProtectionDelay": 1000,
    "showErrors": true
  },
  "irc2":
  {
    "channels": [],
    "server": 'irc.altcoinweb.com',
    "nick": 'CollinBot2',
    "password": null,
    "userName": 'alert',
    "realName": 'alert',
    "port": 6667,
    "debug": false,
    "floodProtection": true,
    "floodProtectionDelay": 1000,
    "showErrors": true
  },
  "blockchain_walls":
  {
    "threshold": 750
  },
  "channels":
  {
    "pairs": "#cryptopairs",
    "rss": "#cryptonews",
    "btc": "#cryptoalert", //blockchain walls
    "walls": "#cryptoalert" //echange walls
  },
  "interval": 2,
  "rssInterval": 10,
  "feeds": [
    { name: "#cryptonews CoinDesk", url: "http://feeds.feedburner.com/CoinDesk" },
    { name: "#cryptonews CryptoCoinNews", url: "http://www.cryptocoinsnews.com/category/news/feed" },
    { name: "#cryptonews CoinTelegraph", url: "http://cointelegraph.com/rss" },
    { name: "#cryptonews BitcoinMagazine", url: "http://feeds.feedburner.com/BitcoinMagazine" },
    { name: "#cryptonews Coinbase", url: "http://blog.coinbase.com/rss" },
    { name: "#cryptonews Bitpay", url: "http://blog.bitpay.com/feed.xml" },
    { name: "#cryptonews Blockchain", url: "http://blog.blockchain.com/feed/" },
    { name: "#cryptonews CoinReport", url: "https://coinreport.net/feed/" },
    { name: "#cryptonews NEW JOB POSTING", url: "https://coinality.com/feed" },
    { name: "#cryptonews r/btc", url: "http://reddit.com/r/bitcoin/.rss" },
    { name: "#cryptonews r/crypto", url: "http://reddit.com/r/cryptocurrency/.rss" },
    { name: "#cryptonews NewsBTC", url: "http://newsbtc.com/feed" },
    { name: "#cryptonews InsideBitcoins", url: "http://insidebitcoins.com/feed" },
    { name: "#cryptonews LetsTalkBitcoin", url: "https://letstalkbitcoin.com/rss" },
    { name: "#cryptonews CoinFire", url: "https://coinfire.cf/feed" },

  ]
}

module.exports = config;
//the rss / btc can go on one as that's the most & least spammy then alts and coin pair on the other as they are medium usage
//add the blockchain BTC > 2500 channel posting, and duplicate the altcoin arch into posting to an irc channel, and edit it to seperate 
//each different thing it does (rss/coinpairs/btc/alts) into different channels
