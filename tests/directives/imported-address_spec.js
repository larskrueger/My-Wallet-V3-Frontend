describe('Imported Address Directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;

  let legacyAddresses = [
    {archived: false, label: 'Hello'},
    {archived: true, label: 'World'}
  ];

  beforeEach(module('walletDirectives'));

  // Load the myApp module, which contains the directive
  beforeEach(module('walletApp'));

  beforeEach(() => {
    module(($provide) => {
      $provide.value('Wallet', {
        legacyAddresses: () => legacyAddresses,
        changeLegacyAddressLabel: (address, label, success, error) => {
          if (label) {
            return success();
          } else {
            return error();
          }
        },
        settings: {
          displayCurrency: 'EUR'
        },
        archive: (address) => {
          address.archived = true;
        }
      });
    });
  });

  beforeEach(inject((_$compile_, _$rootScope_, $injector) => {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    let Wallet = $injector.get('Wallet');
    Wallet.my = $injector.get('MyWallet');
  }));

  beforeEach(function () {
    $rootScope.address = legacyAddresses[0];
    element = $compile('<tr imported-address="address"></tr>')($rootScope);
    $rootScope.scheduleRefresh = function () {};
    $rootScope.$digest();
    isoScope = element.isolateScope();

    isoScope.success = () => true;
    isoScope.error = () => true;
  });

  it('should show the address label', () => expect(element.html()).toContain('address.label'));

  it('should know the address label', () => expect(isoScope.address.label).toEqual('Hello'));

  it('can be archived', () => {
    let address = legacyAddresses[0];
    expect(address.archived).toBe(false);
    isoScope.archive(address);
    expect(address.archived).toBe(true);
  });

  it('should be able to change a label', () => {
    spyOn(isoScope, 'success');

    isoScope.changeLabel('World', isoScope.success, isoScope.error);
    expect(isoScope.success).toHaveBeenCalled();
  });

  it('should fail if no label is passed', () => {
    spyOn(isoScope, 'error');

    isoScope.changeLabel('', isoScope.success, isoScope.error);
    expect(isoScope.error).toHaveBeenCalled();
  });

  it('should be able to cancel an edit', () => {
    isoScope.cancelEdit();
    expect(isoScope.status.edit).toBe(false);
  });

  describe('showAddress', () =>

    it('should open a modal', inject(function ($uibModal) {
      spyOn($uibModal, 'open').and.callThrough();
      isoScope.showAddress();
      expect($uibModal.open).toHaveBeenCalled();
    })
    )
  );

  describe('transfer', () =>

    it('should open a modal', inject(function ($uibModal) {
      spyOn($uibModal, 'open');
      isoScope.transfer();
      expect($uibModal.open).toHaveBeenCalled();
    })
    )
  );

  describe('showPrivKey', () =>

    it('should open a modal', inject(function ($uibModal) {
      spyOn($uibModal, 'open');
      isoScope.showPrivKey();
      expect($uibModal.open).toHaveBeenCalled();
    })
    )
  );

  describe('spend', () =>

    it('should open a modal', inject(function ($uibModal, modals) {
      let addr = '1asdf';
      spyOn(modals, 'openSend').and.callThrough();
      spyOn($uibModal, 'open').and.callThrough();
      isoScope.address = addr;
      isoScope.spend();
      expect(modals.openSend).toHaveBeenCalledWith({ fromAccount: addr });
      expect($uibModal.open).toHaveBeenCalled();
    })
    )
  );
});
