describe('Destination Input directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;
  let Wallet;
  let ignore;

  beforeEach(module('walletDirectives'));

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, $injector, $httpBackend) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    let scope = $rootScope.$new();
    Wallet = $injector.get('Wallet');

    Wallet.addressBook = () => [
      { address: '1abc', label: 'address_book_entry' }
    ];

    Wallet.isValidPrivateKey = () => false;

    // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
    $httpBackend.whenGET('/Resources/wallet-options.json').respond();

    Wallet.my.wallet = {
      hdwallet: {
        accounts: [{ archived: false }]
      },
      keys: [{ archived: true }]
    };

    Wallet.status.isLoggedIn = true;
    ignore = {'label': 'label'};

  })
  );

  beforeEach(function () {
    element = $compile('<destination-input coin-code="btc" ng-model="transaction" is-valid-address="isValidAddress" ignore="ignore"></destination-input>')($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    isoScope.isValidAddress = (addr) => addr;
    return isoScope.$digest();
  });

  it('should call change on addressScan', inject(function ($timeout) {
    spyOn(isoScope, 'change');
    let result = 'bitcoin:valid_btc_address';
    isoScope.onAddressScan(result);
    $timeout.flush();
    expect(isoScope.change).toHaveBeenCalled();
  })
  );

  it('should trigger onPaymentRequest', inject(function ($timeout) {
    spyOn(isoScope, 'onPaymentRequest');
    let result = 'bitcoin:valid_btc_address';
    isoScope.coinCode = 'btc';
    isoScope.onAddressScan(result);
    $timeout.flush();
    expect(isoScope.onPaymentRequest).toHaveBeenCalled();
  })
  );

  it('should hide the dropdown when there is one account and no active addresses', () => expect(isoScope.dropdownHidden).toEqual(false));

  it('should have the correct number of destinations', () => expect(isoScope.destinations.length).toEqual(0));
});
