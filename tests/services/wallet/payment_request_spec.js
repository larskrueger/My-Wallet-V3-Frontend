describe("walletServices", function() {
  let Wallet = undefined;
  let MyWallet = undefined;
  let mockObserver = undefined;
  let errors = undefined;

  beforeEach(angular.mock.module("walletApp"));

  beforeEach(function() {
    angular.mock.inject(function($injector) {
      Wallet = $injector.get("Wallet");

    });

  });

  return describe("parsePaymentRequest()", function() {
    beforeEach(() =>
      Wallet.isValidAddress = url => true
    );

    it("should recognise bitcoin://", inject(function(Wallet) {
      let result = Wallet.parsePaymentRequest("http://", 'btc');
      expect(result.hasBitcoinPrefix).toBeFalse;

      result = Wallet.parsePaymentRequest("bitcoin://", 'btc');
      return expect(result.hasBitcoinPrefix).toBeTrue;
    })
    );

    it("should recognise a valid request", inject(function(Wallet) {
      let result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=10", 'btc');
      return expect(result.isValid).toBeTrue;
    })
    );

    it("should extract the address", inject(function(Wallet) {
      let result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=0.1", 'btc');
      return expect(result.address).toBe("abcdefg");
    })
    );

    it("should recognise bitcoin:address", inject(function(Wallet) {
      let result = Wallet.parsePaymentRequest("bitcoin:abc", 'btc');
      expect(result.hasBitcoinPrefix).toBeTrue;
      return expect(result.address).toBe("abc");
    })
    );

    it("should recognise a bitcoin address without bitcoin URI prefix", inject(function(Wallet) {
      let result = Wallet.parsePaymentRequest("abc", 'btc');
      return expect(result.address).toBe("abc");

    })
    );

    it("should extract the address if no amount param is present", inject(function(Wallet) {
      let result = Wallet.parsePaymentRequest("bitcoin://abcdefg", 'btc');
      return expect(result.address).toBe("abcdefg");
    })
    );

    it("should extract the amount", inject(function(Wallet) {
      let result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=0.1", 'btc');
      return expect(result.amount).toBe(10000000);
    })
    );

    it("should ignore additional parameters", inject(function(Wallet) {
      let result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=0.1&other=hello", 'btc');
      expect(result.amount).toBe(10000000);
      return expect(result.address).toBe("abcdefg");
    })
    );

    it("should ignore the order of parameters", inject(function(Wallet) {
      let result = Wallet.parsePaymentRequest("bitcoin://abcdefg?other=hello&amount=0.1", 'btc');
      expect(result.amount).toBe(10000000);
      return expect(result.address).toBe("abcdefg");
    })
    );

    it("should parse payment requests above 1 btc in amount", inject(function(Wallet) {
      let result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=100", 'btc');
      expect(result.amount).toBe(10000000000);
      return expect(result.address).toBe("abcdefg");
    })
    );

    it("should extract label", inject(function(Wallet) {
      let result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=0.1&label=Label", 'btc');
      expect(result.amount).toBe(10000000);
      expect(result.address).toBe("abcdefg");
      return expect(result.label).toBe("Label");
    })
    );

    return it("should extract message", inject(function(Wallet) {
      let result = Wallet.parsePaymentRequest("bitcoin://abcdefg?amount=0.1&message=take_my_bitcoins", 'btc');
      expect(result.amount).toBe(10000000);
      expect(result.address).toBe("abcdefg");
      return expect(result.message).toBe("take_my_bitcoins");
    })
    );
  });
});
