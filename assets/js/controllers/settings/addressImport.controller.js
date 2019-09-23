angular
  .module('walletApp')
  .controller('AddressImportCtrl', AddressImportCtrl);

function AddressImportCtrl ($scope, AngularHelper, $uibModal, Wallet, Alerts, $uibModalInstance, $state, $timeout, BitcoinCash) {
  $scope.settings = Wallet.settings;
  $scope.accounts = Wallet.accounts;
  $scope.alerts = [];
  $scope.address = null;
  $scope.BIP38 = false;
  $scope.step = 1;

  $scope.status = {};
  $scope.fields = { addressOrPrivateKey: '', bip38passphrase: '', account: null };

  $scope.$watchCollection('accounts()', (newValue) => {
    $scope.fields.account = Wallet.accounts()[Wallet.my.wallet.hdwallet.defaultAccountIndex];
  });

  $scope.isValidAddressOrPrivateKey = (val) => {
    return Wallet.isValidAddress(val) || Wallet.isValidPrivateKey(val);
  };

  $scope.goToTransfer = () => {
    $uibModalInstance.close();
    $uibModal.open({
      templateUrl: 'partials/settings/transfer.pug',
      controller: 'TransferController',
      windowClass: 'bc-modal',
      resolve: { address: () => $scope.address }
    });
  };

  $scope.parseBitcoinUrl = (url) => url.replace('bitcoin:', '').replace(/\//g, '');

  $scope.onAddressScan = (url) => {
    $scope.fields.addressOrPrivateKey = $scope.parseBitcoinUrl(url);
    let valid = $scope.isValidAddressOrPrivateKey($scope.fields.addressOrPrivateKey);
    $scope.importForm.privateKey.$setValidity('isValid', valid);
  };

  $scope.importSuccess = (address) => {
    BitcoinCash.bch.fetch && BitcoinCash.bch.fetch();
    $scope.status.busy = false;
    $scope.address = address;
    $scope.step = 2;
    AngularHelper.$safeApply($scope);
  };

  $scope.importError = (err) => {
    $scope.status.busy = false;
    AngularHelper.$safeApply($scope);

    switch (err instanceof Error ? err.message : err) {
      case 'presentInWallet':
        $scope.importForm.privateKey.$setValidity('present', false);
        $scope.BIP38 = false;
        break;
      case 'wrongBipPass':
        $scope.importForm.bipPassphrase.$setValidity('wrong', false);
        break;
      case 'importError':
        $scope.importForm.privateKey.$setValidity('check', false);
        $scope.step = 1;
        $scope.BIP38 = false;
        $scope.proceedWithBip38 = undefined;
        break;
      default: {
        Alerts.displayError('UNKNOWN_ERROR');
      }
    }
  };

  $scope.importCancel = () => {
    $scope.status.busy = false;
    AngularHelper.$safeApply($scope);
  };

  $scope.import = () => {
    $scope.status.busy = true;
    AngularHelper.$safeApply($scope);
    let addressOrPrivateKey = $scope.fields.addressOrPrivateKey.trim();
    let bip38passphrase = $scope.fields.bip38passphrase.trim();

    const needsBipPassphrase = (proceed) => {
      $scope.status.busy = false;
      $scope.proceedWithBip38 = proceed;
      $timeout(() => { $scope.BIP38 = true; });
    };

    const attemptImport = Wallet.addAddressOrPrivateKey.bind(
      null,
      addressOrPrivateKey,
      needsBipPassphrase,
      $scope.importSuccess,
      $scope.importError,
      $scope.importCancel
    );

    $timeout(() => {
      if (!$scope.BIP38) {
        if (Wallet.isValidAddress(addressOrPrivateKey)) {
          Alerts.confirm('CONFIRM_IMPORT_WATCH')
            .then(attemptImport)
            .finally(() => $scope.status.busy = false);
        } else {
          attemptImport();
        }
      } else {
        $scope.proceedWithBip38(bip38passphrase);
      }
    }, 250);
  };

  $scope.close = () => {
    if ($scope.step === 2 && $scope.address.balance > 0 && !$scope.address.isWatchOnly) {
      Alerts.confirm('CONFIRM_NOT_SWEEP', { action: 'TRANSFER', friendly: true })
        .then($scope.goToTransfer).catch($uibModalInstance.dismiss);
    } else {
      $uibModalInstance.dismiss('');
    }
  };
}
