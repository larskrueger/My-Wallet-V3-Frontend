angular
  .module('walletApp')
  .controller('SettingsSecurityCtrl', SettingsSecurityCtrl);

function SettingsSecurityCtrl ($scope, $uibModal, Wallet, Alerts, Ethereum) {
  $scope.settings = Wallet.settings;
  $scope.user = Wallet.user;

  let showEthereum = Ethereum.userHasAccess || void 0;
  $scope.phraseTranslateValues = { showEthereum };

  $scope.processToggleRememberTwoFactor = null;

  $scope.display = { advanced: false };

  $scope.toggleAdvanced = () => {
    $scope.display.advanced = !$scope.display.advanced;
  };

  $scope.toggleLogging = () => {
    let level = $scope.settings.loggingLevel === 0 ? 1 : 0;
    Wallet.setLoggingLevel(level);
  };

  $scope.enableRememberTwoFactor = () => {
    $scope.processToggleRememberTwoFactor = true;
    const success = () => {
      $scope.processToggleRememberTwoFactor = false;
      Wallet.saveActivity(2);
    };
    const error = () => {
      $scope.processToggleRememberTwoFactor = false;
    };
    Wallet.enableRememberTwoFactor(success, error);
  };

  $scope.disableRememberTwoFactor = () => {
    $scope.processToggleRememberTwoFactor = true;
    const success = () => {
      $scope.processToggleRememberTwoFactor = false;
      Wallet.saveActivity(2);
    };
    const error = () => {
      $scope.processToggleRememberTwoFactor = false;
    };
    Wallet.disableRememberTwoFactor(success, error);
  };

  $scope.changeTwoFactor = () => {
    $uibModal.open({
      templateUrl: 'partials/settings/two-factor.pug',
      windowClass: 'bc-modal initial',
      controller: 'TwoFactorCtrl',
      resolve: {
        loadBcPhoneNumber: ($ocLazyLoad) => {
          return $ocLazyLoad.load('bcPhoneNumber');
        }
      }
    });
  };

  $scope.clearErrors = () => {
    $scope.errors = {};
  };
}
