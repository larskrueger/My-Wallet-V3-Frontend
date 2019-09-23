angular
  .module('walletApp')
  .factory('smartAccount', smartAccount);

smartAccount.$inject = ['Wallet', 'MyWallet', 'format'];

function smartAccount (Wallet, MyWallet, format) {
  const service = {
    getDefaultIdx: getDefaultIdx,
    getOptions: getOptions,
    getDefault: getDefault
  };

  function getOptions () {
    let accounts = Wallet.accounts().filter(a => !a.archived && a.index != null);
    let addresses = Wallet.legacyAddresses().filter(a => !a.archived);

    return accounts.concat(addresses).map(format.origin);
  }

  function getDefault () {
    let acct;
    let idx = service.getDefaultIdx();
    let options = service.getOptions();
    !isNaN(idx) && (acct = options.filter(a => a.index === idx)[0]);
    isNaN(idx) && (acct = service.getDefaultIdx());

    return acct;
  }

  function getDefaultIdx () {
    let isAvail = (a) => !a.archived && a.balance > 0;
    let availAccounts = Wallet.accounts().filter(isAvail);
    let availAddresses = Wallet.legacyAddresses().filter(isAvail);
    // 1. a default account has a balance
    // 2. another account has a balance, return lowest index
    // 3. a legacy address has a balance, return oldest index
    // 4. no balances, show default
    if (MyWallet.wallet.hdwallet.defaultAccount.balance > 0) {
      return MyWallet.wallet.hdwallet.defaultAccountIndex;
    } else if (availAccounts.length) {
      return availAccounts[0].index;
    } else if (availAddresses.length) {
      return availAddresses.sort((a, b) => a.created_time - b.created_time)[0];
    } else {
      return MyWallet.wallet.hdwallet.defaultAccountIndex;
    }
  }

  return service;
}
