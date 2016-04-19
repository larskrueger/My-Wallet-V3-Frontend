describe "Destination Input directive", ->
  $compile = undefined
  $rootScope = undefined
  element = undefined
  isoScope = undefined
  Wallet = undefined

  beforeEach module("walletApp")

  beforeEach inject((_$compile_, _$rootScope_, $injector) ->
    $compile = _$compile_
    $rootScope = _$rootScope_
    scope = $rootScope.$new()
    Wallet = $injector.get('Wallet')

    Wallet.my.wallet =
      hdwallet:
        accounts: [{ archived: false }]
      keys: [{ archived: true }]

    Wallet.status.isLoggedIn = true

    return
  )

  beforeEach ->
    element = $compile('<destination-input ng-model="transaction"></destination-input>')($rootScope)
    $rootScope.$digest()
    isoScope = element.isolateScope()
    isoScope.$digest()

  it "should call change on addressScan", inject(($timeout) ->
    spyOn(isoScope, "change")
    result = 'bitcoin:1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX'
    isoScope.onAddressScan(result)
    $timeout.flush()
    expect(isoScope.change).toHaveBeenCalled()
  )

  it "should trigger onPaymentRequest", inject(($timeout) ->
    spyOn(isoScope, "onPaymentRequest")
    result = 'bitcoin:1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX'
    isoScope.onAddressScan(result)
    $timeout.flush()
    expect(isoScope.onPaymentRequest).toHaveBeenCalled()
  )

  it "should hide the dropdown when there is one account and no active addresses", ->
    expect(isoScope.dropdownHidden).toEqual(true)
