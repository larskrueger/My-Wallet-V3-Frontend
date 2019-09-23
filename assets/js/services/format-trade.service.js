angular
  .module('walletApp')
  .factory('formatTrade', formatTrade);

formatTrade.$inject = ['$rootScope', '$filter', 'Wallet', 'MyWallet', 'currency', 'Env'];

function formatTrade ($rootScope, $filter, Wallet, MyWallet, currency, Env) {
  const service = {
    awaiting_transfer_in,
    bankTransfer,
    confirm,
    reviewing,
    pending,
    processing,
    cancelled,
    rejected,
    failed,
    expired,
    completed,
    completed_test,
    initiated,
    reject_card,
    kyc,
    error,
    success,
    labelsForCurrency
  };

  let qaDebugger;

  Env.then(env => {
    qaDebugger = env.qaDebugger;
  });

  let errorStates = {
    'cancelled': 'canceled',
    'rejected': 'rejected',
    'expired': 'expired'
  };

  let getState = (state) => errorStates[state] || state;
  let isKYC = (trade) => trade.constructor.name === 'CoinifyKYC';
  let wholeNumber = (trade) => ['INR'].indexOf(trade.inCurrency) > -1;

  let getLabel = (trade) => {
    let accountIndex = trade.accountIndex;
    return accountIndex != null ? MyWallet.wallet.hdwallet.accounts[accountIndex].label : '';
  };

  function rejected (trade) { return service.error(trade, 'rejected'); }
  function cancelled (trade) { return service.error(trade); }
  function failed (trade) { return service.error(trade); }
  function expired (trade) { return service.error(trade); }
  function completed (trade) { return service.success(trade); }
  function completed_test (trade) { return service.success(trade); }
  function pending (trade) { return service.reviewing(trade); }

  let addTradeDetails = (trade, account) => {
    let tradeIdPrefix = trade.inCurrency === 'INR' ? 'UCN-' : 'CNY-';
    let showTradeID = !account;
    let showTradeSubscription = trade.tradeSubscriptionId;
    let transaction = {
      'TRADE_ID': showTradeID ? '#' + tradeIdPrefix + trade.id : null,
      'SUBSCRIPTION_ID': showTradeSubscription ? `#CNYR-${trade.tradeSubscriptionId}` : null,
      'DATE_INITIALIZED': $filter('date')(trade.createdAt, 'd MMMM yyyy, HH:mm'),
      'BTC_PURCHASED': currency.formatCurrencyForView(trade.receiveAmount, currency.bitCurrencies[0], true),
      'PAYMENT_METHOD': account ? account.accountType + ' ' + account.accountNumber : null,
      'TOTAL_COST': currency.formatCurrencyForView(wholeNumber(trade) ? trade.sendAmount : trade.sendAmount / 100, { code: trade.inCurrency })
    };
    if (qaDebugger) transaction['RECEIVING_ADDRESS'] = trade.receiveAddress;
    return transaction;
  };

  function error (trade, state) {
    let tx = addTradeDetails(trade);
    if (isKYC(trade)) { return service.kyc(trade, 'rejected'); }
    if (state === 'rejected' && trade.medium === 'card') { return service.reject_card(trade, 'rejected'); }

    return {
      tx: tx,
      class: 'state-danger-text',
      namespace: 'TX_ERROR_STATE',
      values: {
        state: state || getState(trade.state)
      }
    };
  }

  function confirm (trade) {
    return {
      tx: trade,
      values: {},
      namespace: 'TX_CONFIRM'
    };
  }

  function success (trade) {
    let tx = addTradeDetails(trade);
    if (!trade.bitcoinReceived) { return service.processing(trade); }

    return {
      tx: tx,
      class: 'success',
      values: {
        label: getLabel(trade)
      },
      namespace: 'TX_SUCCESS'
    };
  }

  function processing (trade, accounts) {
    let account = accounts && accounts[0];
    let tx = addTradeDetails(trade, account);

    return {
      tx: tx,
      class: 'blue',
      values: {},
      namespace: 'TX_PENDING'
    };
  }

  function reviewing (trade) {
    let tx = addTradeDetails(trade);
    if (isKYC(trade)) { return service.kyc(trade, 'reviewing'); }

    return {
      tx: tx,
      class: 'blue',
      values: {},
      namespace: 'TX_IN_REVIEW'
    };
  }

  function initiated (trade, accounts) {
    let account = accounts && accounts[0];
    let tx = addTradeDetails(trade, account);

    return {
      tx: tx,
      class: 'success',
      values: {
        email: Wallet.user.email
      },
      namespace: 'TX_INITIATED'
    };
  }

  function reject_card (trade, state) {
    let namespace = 'TX_CARD_REJECTED';
    let tx = addTradeDetails(trade);

    return {
      tx: tx,
      class: 'state-danger-text',
      namespace: namespace,
      values: {
        state: state || getState(trade.state)
      }
    };
  }

  function kyc (trade, state) {
    let classname = state === 'reviewing' ? 'blue' : 'state-danger-text';
    let namespace = state === 'reviewing' ? 'KYC_FLAGGED' : 'KYC_REJECTED';

    return {
      class: classname,
      namespace: namespace,
      values: {
        date: $filter('date')(trade.createdAt, 'MM/dd')
      }
    };
  }

  function labelsForCurrency (currency) {
    if (currency === 'DKK') {
      return { accountNumber: 'Account Number', bankCode: 'Reg. Number' };
    }
    return { accountNumber: 'IBAN', bankCode: 'BIC' };
  }

  function bankTransfer (trade, bankAccount) {
    return {
      namespace: 'TX_AWAITING_REF_NUMBER',
      tx: {
        'AMOUNT': trade.sendAmount + ' ' + trade.inCurrency,
        'BANK_NAME': bankAccount.bankName,
        'ACCOUNT_HOLDER_NAME': bankAccount.holderName,
        'ACCOUNT_NUMBER': bankAccount.number,
        'IFSC_CODE': bankAccount.ifsc,
        'ACCOUNT_TYPE': bankAccount.type
      },
      values: {
        amount: trade.sendAmount + ' ' + trade.inCurrency
      }
    };
  }

  function awaiting_transfer_in (trade) {
    if (!trade.bankAccount) { return service.initiated(trade); }
    const labels = labelsForCurrency(trade.inCurrency);
    return {
      class: 'state-danger-text',
      namespace: 'TX_BANK_TRANSFER',
      tx: {
        'Recipient Name': trade.bankAccount.holderName,
        'Recipient Address': [
          trade.bankAccount.holderAddress.street,
          trade.bankAccount.holderAddress.zipcode + ' ' + trade.bankAccount.holderAddress.city,
          trade.bankAccount.holderAddress.country
        ].join(', '),
        [labels.accountNumber]: trade.bankAccount.number,
        [labels.bankCode]: trade.bankAccount.bic,
        'Bank': [
          trade.bankAccount.bankName,
          trade.bankAccount.bankAddress.street,
          trade.bankAccount.bankAddress.zipcode + ' ' + trade.bankAccount.bankAddress.city,
          trade.bankAccount.bankAddress.country
        ].join(', '),
        'Reference/Message': `Order ID ${trade.bankAccount.referenceText}`
      },
      values: {
        label: getLabel(trade),
        curr: trade.inCurrency,
        amt: trade.sendAmount / 100
      }
    };
  }

  return service;
}
