angular
  .module('walletApp.core')
  .factory('MyWalletHelpers', ($q) =>
    ({
      tor () {
        return false;
      },
      privateKeyCorrespondsToAddress () {
        return $q.resolve(true);
      },
      scorePassword (pw) {
        return ((pw && pw.length) || 0) * 25;
      },
      memoize (f) { return f; },
      getMobileOperatingSystem () {
        return 'unknown';
      },
      isBitcoinAddress (addr) {
        return addr === 'valid_btc_address';
      },
      guidToGroup (uid) {
        if (uid[0] === 'a') { return 'a'; } else { return 'b'; }
      }
    })
);
