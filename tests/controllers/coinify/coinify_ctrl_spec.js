describe('CoinifyController', () => {
  let $rootScope;
  let $controller;
  let coinify;
  let $q;

  let quote = {
    quoteAmount: 1,
    baseAmount: -100,
    baseCurrency: 'USD',
    expiresAt: 100000000,
    getPaymentMediums () { return $q.resolve(); }
  };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $q, _$rootScope_, _$controller_, $httpBackend) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;

      // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
      const options = {
        partners: {
          coinify: {
            surveyLinks: ['www.blockchain.com/survey']
          }
        }
      };
      $httpBackend.whenGET('/Resources/wallet-options.json').respond(options);

      let MyWallet = $injector.get('MyWallet');
      coinify = $injector.get('coinify');

      MyWallet.wallet = {
        hdwallet: {
          defaultAccount: {
            index: 0
          },
          accounts: [{label: ''}]
        },
        external: {
          coinify: {
            getQuote (quote) { return $q.resolve(quote); }
          }
        }
      };
    }));

  let getController = function (quote, trade, options) {
    let scope = $rootScope.$new();
    let endTime = new Date();
    let frequency = 'Daily';
    let mediums = { card: {}, bank: {} }

    let ctrl = $controller('CoinifyController', {

      $scope: scope,
      trade: trade || null,
      quote: quote || null,
      endTime: endTime || null,
      frequency: frequency || false,
      options: options || {},
      mediums: mediums || false,
      $uibModalInstance: { close () {}, dismiss () {} }
    });

    ctrl.now = () => 1495742841561;

    ctrl.$scope = scope;
    return ctrl;
  };

  describe('.baseFiat()', function () {
    let ctrl;
    beforeEach(() => {
      ctrl = getController(quote);
    });

    it('should be true if baseCurrency is fiat', () => {
      expect(ctrl.baseFiat()).toBe(true);
    });
  });

  describe('.BTCAmount()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should return BTC amount', () => expect(ctrl.BTCAmount()).toBe(1));
  });

  describe('.fiatAmount()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should return fiat amount', () => expect(ctrl.fiatAmount()).toBe(100));
  });

  describe('.fiatCurrency()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should return fiat currency', () => expect(ctrl.fiatCurrency()).toBe('USD'));
  });

  describe('.expireTrade()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should expire the trade', () => {
      ctrl.expireTrade();
      $rootScope.$digest();
      return expect(ctrl.state.trade.expired).toBe(true);
    });
  });

  describe('.timeToExpiration()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should return expiration time of quote', () => expect(ctrl.timeToExpiration()).toBe(100000000 - 1495742841561));
  });

  describe('.refreshQuote()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should refresh a quote from fiat', () => {
      spyOn(coinify, 'getQuote');
      ctrl.refreshQuote();
      $rootScope.$digest();
      return expect(coinify.getQuote).toHaveBeenCalledWith(10000, 'USD');
    });

    it('should refresh a quote form BTC', () => {
      spyOn(coinify, 'getQuote');
      ctrl.quote.baseCurrency = 'BTC';
      ctrl.quote.quoteCurrency = 'USD';
      ctrl.refreshQuote();
      $rootScope.$digest();
      return expect(coinify.getQuote).toHaveBeenCalledWith(100, 'BTC', 'USD');
    });
  });

  describe('.expireTrade()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController(quote));

    it('should set expired trade state', () => {
      ctrl.expireTrade();
      $rootScope.$digest();
      expect(ctrl.state.trade.expired).toBe(true);
    });
  });

  describe('.goTo()', function () {
    let ctrl;
    beforeEach(() => ctrl = getController());

    it('should set the step', () => {
      ctrl.goTo('email');
      expect(ctrl.currentStep()).toBe('email');
    });
  });

  describe('.exitToNativeTx()', () => {
    it('should call mobile interface with the correct tx hash', inject((buyMobile) => {
      let txHash = 'mock_tx_hash';
      spyOn(buyMobile, 'callMobileInterface');
      let ctrl = getController(null, { txHash });
      ctrl.$scope.exitToNativeTx();
      expect(buyMobile.callMobileInterface).toHaveBeenCalledWith(buyMobile.SHOW_TX, txHash);
    }));
  });

  describe('initial state', function () {
    it('should ask user to verify email', inject(function (Wallet, MyWallet) {
      Wallet.user.isEmailVerified = false;
      MyWallet.wallet.external.coinify = ({ profile: {} });
      let ctrl = getController();
      expect(ctrl.currentStep()).toBe('email');
    }));

    it('should ask user to signup if email is verified', inject(function (Wallet, MyWallet) {
      Wallet.user.isEmailVerified = true;
      let ctrl = getController();
      expect(ctrl.currentStep()).toBe('signup');
    }));

    it('should ask user to select payment medium', inject(function (Wallet, MyWallet) {
      Wallet.user.isEmailVerified = true;
      MyWallet.wallet.external.coinify = ({ profile: {}, user: 1 });
      let ctrl = getController(quote, null);
      expect(ctrl.currentStep()).toBe('email');
    }));

    it('should ask user to complete isx after a trade is created', inject(function (Wallet, MyWallet) {
      Wallet.user.isEmailVerified = true;
      MyWallet.wallet.external.coinify = ({ profile: {}, user: 1 });
      let ctrl = getController(null, {});
      expect(ctrl.currentStep()).toBe('isx');
    }));

    it('should show a completed trade summary', inject(function (Wallet, MyWallet) {
      let trade = { state: 'completed' };
      Wallet.user.isEmailVerified = true;
      MyWallet.wallet.external.coinify = ({ profile: {}, user: 1 });
      let ctrl = getController(null, trade);
      expect(ctrl.currentStep()).toBe('trade-complete');
    }));
  });
});
