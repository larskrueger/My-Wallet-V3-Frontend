describe('convertFilter', () => {
  beforeEach(module('walletApp'));
  beforeEach(module('walletFilters'));

  beforeEach(inject((Wallet, currency) => {
    Wallet.settings.displayCurrency = currency.bitCurrencies[0];
  }));

  it('should convert from satoshi to the displayCurrency', inject(($filter) => {
    let convert = $filter('convert');
    expect(convert(100000000)).toBe('1 BTC');
  }));

  it('should change when the displayCurrency changes', inject(($filter, Wallet, currency) => {
    let convert = $filter('convert');
    expect(convert(100000000)).toBe('1 BTC');
    Wallet.settings.displayCurrency = currency.bitCurrencies[1];
    expect(convert(100000000)).toBe('1,000 mBTC');
  }));

  it('should not convert if the amount is not defined', inject(($filter) => {
    let convert = $filter('convert');
    expect(convert()).toBe(null);
  }));

  it('should convert to btc currency', inject(($filter, Wallet, currency) => {
    let convert = $filter('convert');
    Wallet.settings.displayCurrency = currency.currencies[0];
    Wallet.settings.btcCurrency = currency.bitCurrencies[1];
    expect(convert(100000000, 'btc')).toBe('1,000 mBTC');
  }));
});
