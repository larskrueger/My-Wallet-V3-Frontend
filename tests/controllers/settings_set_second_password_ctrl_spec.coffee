describe "SetSecondPasswordCtrl", ->
  scope = undefined
  Wallet = undefined
  modalInstance =
    close: ->
    dismiss: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller, $compile, $templateCache) ->
      Wallet = $injector.get("Wallet")
      Wallet.user.passwordHint = "passhint"
      Wallet.isCorrectMainPassword = (pw) -> pw == 'mainpw'

      scope = $rootScope.$new()
      template = $templateCache.get('partials/settings/set-second-password.jade')

      $controller "SetSecondPasswordCtrl",
        $scope: scope,
        $uibModalInstance: modalInstance

      scope.model = { fields: {} }
      $compile(template)(scope)
      scope.$digest()

  it "should close", ->
    spyOn(modalInstance, "dismiss")
    scope.close()
    expect(modalInstance.dismiss).toHaveBeenCalledWith('')

  describe "password", ->

    it "should be valid if the password is ok", ->
      scope.form.password.$setViewValue('validpw')
      expect(scope.form.password.$valid).toEqual(true)

    it "should reset the confirmations field when changed", ->
      scope.form.confirmation.$setViewValue('conf')
      scope.form.password.$setViewValue('validpw')
      expect(scope.fields.confirmation).toEqual('')

    it "should not be valid if the password is too short", ->
      scope.form.password.$setViewValue('asd')
      expect(scope.form.password.$valid).toEqual(false)
      expect(scope.form.password.$error.minlength).toEqual(true)

    it "should not be valid if the password is the password hint", ->
      scope.form.password.$setViewValue('passhint')
      expect(scope.form.password.$valid).toEqual(false)
      expect(scope.form.password.$error.isValid).toEqual(true)

    it "should not be valid if the password is the main password", ->
      scope.form.password.$setViewValue('mainpw')
      expect(scope.form.password.$valid).toEqual(false)
      expect(scope.form.password.$error.isValid).toEqual(true)

  describe "confirmation", ->

    beforeEach ->
      scope.form.password.$setViewValue('validpw')

    it "should be valid if the confirmation is the same as the password", ->
      scope.form.confirmation.$setViewValue('validpw')
      expect(scope.form.confirmation.$valid).toEqual(true)

    it "should not be valid if the confirmation is different than the password", ->
      scope.form.confirmation.$setViewValue('differentpw')
      expect(scope.form.confirmation.$valid).toEqual(false)
      expect(scope.form.confirmation.$error.isValid).toEqual(true)
