angular
  .module('walletApp')
  .controller('MobileLoginController', MobileLoginController);

function MobileLoginController ($scope, $state, $timeout, $q, Wallet, MyWallet, Alerts) {
  let state = $scope.state = {
    scannerOn: true,
    permissionDenied: false,
    scanFailed: false,
    scanComplete: false
  };

  $scope.getBoxColor = () => {
    if (state.scanComplete) return 'success';
    if (state.scanFailed || state.permissionDenied) return 'error';
    return '';
  };

  $scope.onScanError = (error) => {
    if (error && error.name === 'PermissionDeniedError') {
      $timeout(() => { state.permissionDenied = true; });
    }
    state.scannerOn = false;
  };

  $scope.onScanResult = (result) => {
    let success = () => {
      $state.go('wallet.common.home');
      Wallet.api.incrementLoginViaQrStats();
    };

    let error = (e) => { Alerts.displayError(e); };

    $q.resolve(MyWallet.parsePairingCode(result))
      .then((data) => {
        state.scanComplete = true;
        let { guid, password, sharedKey } = data;
        Wallet.login(guid, password, null, null, success, error, sharedKey);
      })
      .catch((error) => {
        console.log(error);
        state.scanFailed = true;
      })
      .then(() => {
        state.scannerOn = false;
      });
  };

  $scope.retryScan = () => {
    state.scannerOn = true;
    state.scanFailed = false;
  };
}
