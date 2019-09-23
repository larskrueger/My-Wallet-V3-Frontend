angular
  .module('walletApp')
  .controller('RecoverFundsCtrl', RecoverFundsCtrl);

function RecoverFundsCtrl ($scope, AngularHelper, $state, $timeout, $translate, localStorageService, Wallet, Alerts, Ethereum) {
  $scope.isValidMnemonic = Wallet.isValidBIP39Mnemonic;
  $scope.currentStep = 1;
  $scope.fields = {
    email: '',
    password: '',
    confirmation: '',
    mnemonic: '',
    bip39phrase: ''
  };

  $scope.browser = {disabled: true};

  $scope.performImport = () => {
    $scope.working = true;

    const success = (result) => {
      localStorageService.set('session', result.sessionToken);
      localStorageService.set('guid', result.guid);

      $scope.working = false;
      $scope.nextStep();
      AngularHelper.$safeApply();

      const loginSuccess = () => {
        if (Ethereum.userHasAccess) Ethereum.initialize();
        $state.go('wallet.common.home');
      };

      const loginError = (err) => {
        Alerts.displayError(err);
      };

      $timeout(() => {
        Wallet.login(
          result.guid, result.password, null, null, loginSuccess, loginError
        );
      }, 4000);
    };

    const error = (err) => {
      $scope.working = false;
      Alerts.displayError(err || 'RECOVERY_ERROR');
    };

    $timeout(() => {
      Wallet.my.recoverFromMnemonic(
        $scope.fields.email,
        $scope.fields.password,
        $scope.fields.mnemonic,
        $scope.fields.bip39phrase,
        success, error);
    }, 250);
  };

  $scope.getMnemonicLength = () => {
    $scope.isValidMnemonicLength = $scope.fields.mnemonic.split(' ').length === 12;
  };

  $scope.nextStep = () => {
    $scope.working = true;
    $timeout(() => {
      if (!Wallet.my.browserCheck()) {
        $scope.browser.disabled = true;
        $scope.browser.msg = $translate.instant('UNSUITABLE_BROWSER');
      } else {
        $scope.currentStep++;
        $scope.fields.confirmation = '';
      }
      $scope.working = false;
    }, 250);
  };

  $scope.goBack = () => {
    $scope.currentStep--;
  };
}
