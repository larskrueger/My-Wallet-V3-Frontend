describe('label-origin.component', () => {
  let compileElement;

  beforeEach(module('walletApp'));
  beforeEach(inject(($compile, $rootScope, $httpBackend) => {
    // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
    $httpBackend.whenGET('/Resources/wallet-options.json').respond();
    compileElement = function (origin) {
      $rootScope.origin = origin;
      let element = $compile("<label-origin origin='origin'></label-origin>")($rootScope);
      $rootScope.$digest();
      return element[0];
    };
  }));

  it('should display a label', () => {
    let element = compileElement({ label: 'my_address', address: '1abcd' });
    expect(element.innerHTML).toContain('my_address');
  });

  it('should display an address', () => {
    let element = compileElement({ address: '1abcd' });
    expect(element.innerHTML).toContain('1abcd');
  });
});
