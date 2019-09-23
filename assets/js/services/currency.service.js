
angular
  .module('walletApp')
  .factory('currency', currency);

currency.$inject = ['$q', 'MyBlockchainApi', 'MyWalletHelpers'];

function currency ($q, MyBlockchainApi, MyWalletHelpers) {
  const SATOSHI = 100000000;
  const conversions = {};
  const ethConversions = {};
  const bchConversions = {};
  const fiatConversionCache = {};

  const coinifyCurrencyCodes = {
    'DKK': 'Danish Krone',
    'EUR': 'Euro',
    'GBP': 'Great British Pound',
    'USD': 'U.S. Dollar'
  };

  const coinifySellCurrencyCodes = {
    'DKK': 'Danish Krone',
    'EUR': 'Euro',
    'GBP': 'Great British Pound'
  };

  const currencyCodes = {
    'USD': 'U.S. Dollar',
    'EUR': 'Euro',
    'ISK': 'lcelandic Króna',
    'HKD': 'Hong Kong Dollar',
    'TWD': 'New Taiwan Dollar',
    'CHF': 'Swiss Franc',
    'DKK': 'Danish Krone',
    'CLP': 'Chilean, Peso',
    'CAD': 'Canadian Dollar',
    'CNY': 'Chinese Yuan',
    'THB': 'Thai Baht',
    'AUD': 'Australian Dollar',
    'SGD': 'Singapore Dollar',
    'KRW': 'South Korean Won',
    'JPY': 'Japanese Yen',
    'PLN': 'Polish Zloty',
    'GBP': 'Great British Pound',
    'SEK': 'Swedish Krona',
    'NZD': 'New Zealand Dollar',
    'BRL': 'Brazil Real',
    'RUB': 'Russian Ruble',
    'INR': 'Indian Rupee'
  };

  const bitCurrencies = [
    {
      serverCode: 'BTC',
      code: 'BTC',
      conversion: 100000000,
      btcValue: '1 BTC'
    }, {
      serverCode: 'MBC',
      code: 'mBTC',
      conversion: 100000,
      btcValue: '0.001 BTC'
    }, {
      serverCode: 'UBC',
      code: 'bits',
      conversion: 100,
      btcValue: '0.000001 BTC'
    }
  ];

  const ethCurrencies = [
    {
      code: 'ETH',
      conversion: 1
    }
  ];

  const bchCurrencies = [
    {
      code: 'BCH',
      conversion: 100000000
    }
  ];

  const cryptoCurrencyMap = {
    'eth': { currency: ethCurrencies[0], to: convertToEther, from: convertFromEther, icon: 'icon-ethereum', human: 'Ether' },
    'btc': { currency: bitCurrencies[0], to: convertToSatoshi, from: convertFromSatoshi, icon: 'icon-bitcoin', human: 'Bitcoin' },
    'bch': { currency: bchCurrencies[0], to: convertToBitcoinCash, from: convertFromBitcoinCash, icon: 'icon-bitcoin-cash', human: 'Bitcoin Cash' }
  };

  var service = {
    currencies: formatCurrencies(currencyCodes),
    coinifyCurrencies: formatCurrencies(coinifyCurrencyCodes),
    coinifySellCurrencies: formatCurrencies(coinifySellCurrencyCodes),
    bitCurrencies,
    ethCurrencies,
    bchCurrencies,
    conversions,
    ethConversions,
    fetchExchangeRate,
    cryptoCurrencyMap,
    fetchEthRate,
    fetchBchRate,
    fetchAllRates,
    updateCoinifyCurrencies,
    getFiatAtTime,
    isBitCurrency,
    isEthCurrency,
    isBchCurrency,
    decimalPlacesForCurrency,
    convertToSatoshi,
    convertFromSatoshi,
    convertToEther,
    convertFromEther,
    convertToBitcoinCash,
    convertFromBitcoinCash,
    formatCurrencyForView,
    getCurrencyByCode: MyWalletHelpers.memoize(getCurrencyByCode),
    commaSeparate
  };

  return service;

  function formatCurrencies (currencies) {
    let currencyFormat = code => ({
      code: code,
      name: currencies[code]
    });
    return Object.keys(currencies).map(currencyFormat);
  }

  function fetchExchangeRate (currency) {
    let { code } = currency;
    let currencyFormat = info => ({
      symbol: info.symbol,
      conversion: parseInt(SATOSHI / info.last, 10)
    });
    return MyBlockchainApi.getExchangeRate(code, 'BTC').then((rate) => {
      Object.keys(rate).forEach(key => {
        conversions[key] = currencyFormat(rate[key]);
      });
    });
  }

  function fetchEthRate (currency) {
    let { code } = currency;
    return MyBlockchainApi.getExchangeRate(code, 'ETH').then((rate) => {
      Object.keys(rate).forEach(key => {
        ethConversions[key] = rate[key];
      });
    });
  }

  function fetchBchRate (currency) {
    let { code } = currency;
    return MyBlockchainApi.getExchangeRate(code, 'BCH').then((rate) => {
      Object.keys(rate).forEach(key => {
        bchConversions[key] = rate[key];
      });
    });
  }

  function fetchAllRates (currency) {
    service.fetchExchangeRate(currency);
    service.fetchEthRate(currency);
    service.fetchBchRate(currency);
  }

  function getFiatAtTime (time, amount, currencyCode) {
    time = time * 1000;
    currencyCode = currencyCode.toLowerCase();

    let key = time + amount + currencyCode;
    let cached = fiatConversionCache[key];
    let cacheResult = fiat => fiatConversionCache[key] = parseFloat(fiat.replace(/,/g, '')).toFixed(2);

    let fiatValuePromise = cached !== undefined
      ? $q.resolve(cached) : MyBlockchainApi.getFiatAtTime(time, amount, currencyCode);

    return fiatValuePromise.then(cacheResult);
  }

  function updateCoinifyCurrencies (currencies) {
    let format = (code) => ({ code, name: currencyCodes[code] });
    service.coinifyCurrencies = currencies.slice().sort().map(format);
  }

  function isBitCurrency (currency) {
    if (currency == null) return null;
    return bitCurrencies.map(c => c.code).indexOf(currency.code) > -1;
  }

  function isEthCurrency (currency) {
    if (currency == null) return null;
    return ethCurrencies.map(c => c.code).indexOf(currency.code) > -1;
  }

  function isBchCurrency (currency) {
    if (currency == null) return null;
    return bchCurrencies.map(c => c.code).indexOf(currency.code) > -1;
  }

  function decimalPlacesForCurrency (currency) {
    if (currency == null) return null;
    let decimalMap = { 'BTC': 8, 'mBTC': 5, 'bits': 2, 'sat': 0, 'INR': 0, 'ETH': 8, 'BCH': 8 };
    let decimalPlaces = decimalMap[currency.code];
    return !isNaN(decimalPlaces) ? decimalPlaces : 2;
  }

  function convertToSatoshi (amount, currency) {
    if (amount == null || currency == null) return null;
    if (isBitCurrency(currency)) {
      return Math.round(amount * currency.conversion);
    } else if (conversions[currency.code] != null) {
      return Math.ceil(amount * conversions[currency.code].conversion);
    } else if (currency.conversion) {
      return Math.ceil(amount * currency.conversion);
    } else {
      return null;
    }
  }

  function convertFromSatoshi (amount, currency) {
    if (amount == null || currency == null) return null;
    if (isBitCurrency(currency) || isBchCurrency(currency)) {
      return amount / currency.conversion;
    } else if (conversions[currency.code] != null && conversions[currency.code].conversion) {
      return amount / conversions[currency.code].conversion;
    } else if (currency.conversion) {
      return Math.ceil(amount * currency.conversion);
    } else {
      return null;
    }
  }

  function convertToEther (amount, currency) {
    if (amount == null || currency == null) return null;
    if (isBitCurrency(currency)) {
      console.warn('do not try to convert bitcoin to ether');
      return null;
    } else if (isEthCurrency(currency)) {
      return amount;
    } else if (ethConversions[currency.code] != null) {
      return amount / ethConversions[currency.code].last;
    } else {
      return null;
    }
  }

  function convertFromEther (amount, currency) {
    if (amount == null || currency == null) return null;
    if (isBitCurrency(currency)) {
      console.warn('do not try to convert bitcoin from ether');
      return null;
    } else if (isEthCurrency(currency)) {
      return amount / currency.conversion;
    } else if (ethConversions[currency.code] != null) {
      return amount * ethConversions[currency.code].last;
    } else {
      return null;
    }
  }

  function convertToBitcoinCash (amount, currency) {
    if (amount == null || currency == null) return null;
    if (isBchCurrency(currency)) {
      return amount * currency.conversion;
    } else if (conversions[currency.code] != null) {
      return Math.ceil(amount * parseInt(SATOSHI / bchConversions[currency.code].last, 10));
    } else {
      return null;
    }
  }

  function convertFromBitcoinCash (amount, currency) {
    if (amount == null || currency == null) return null;
    if (isBchCurrency(currency)) {
      return amount / currency.conversion;
    } else if (bchConversions[currency.code] != null) {
      return service.convertFromSatoshi(amount, service.bchCurrencies[0]) * bchConversions[currency.code].last;
    } else {
      return null;
    }
  }

  function formatCurrencyForView (amount, currency, showCode = true) {
    if (amount == null || currency == null) return null;
    let decimalPlaces = decimalPlacesForCurrency(currency);
    let code = showCode ? (' ' + currency.code) : '';
    amount = parseFloat(amount);
    if (isBitCurrency(currency) || isEthCurrency(currency) || isBchCurrency(currency)) {
      amount = amount.toFixed(decimalPlaces);
      amount = amount.replace(/\.?0+$/, '');
    } else {
      amount = parseFloat(amount).toFixed(decimalPlaces);
    }
    return commaSeparate(amount) + code;
  }

  function getCurrencyByCode (code) {
    code = code.toUpperCase();
    return service.currencies.concat(bitCurrencies).concat(ethCurrencies).concat(bchCurrencies)
      .find(curr => curr.code === code);
  }

  function commaSeparate (amount) {
    let parts = amount.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+\b)/g, ',');
    return parts.join('.');
  }
}
