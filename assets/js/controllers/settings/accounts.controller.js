angular
  .module('walletApp')
  .controller('SettingsAccountsController', SettingsAccountsController);

function SettingsAccountsController ($scope, $stateParams, Wallet, Alerts, $uibModal, filterFilter, $ocLazyLoad, modals, BitcoinCash) {
  $scope.accounts = Wallet.accounts;
  $scope.activeSpendableAddresses = () => Wallet.legacyAddresses().filter(a => a.active && !a.isWatchOnly && a.balance > 0);
  $scope.openTransferAll = () => modals.openTransfer($scope.activeSpendableAddresses());

  $scope.display = {
    archived: false
  };

  $scope.filterTypes = ['BITCOIN', 'BITCOIN CASH'];
  $scope.isFilterType = (f) => $scope.filterType === f;
  $scope.setFilterType = (f) => $scope.filterType = f;
  $scope.setFilterType($stateParams.filter || 'BITCOIN');

  $scope.addressBookPresent = Wallet.addressBook().length;
  $scope.numberOfActiveAccounts = () => Wallet.accounts().filter(a => !a.archived).length;
  $scope.isDefault = (account) => Wallet.isDefaultAccount(account);
  $scope.unarchive = (account) => Wallet.unarchive(account);
  $scope.getLegacyTotal = () => Wallet.total('imported');
  $scope.toggleDisplayCurrency = Wallet.toggleDisplayCurrency;

  $scope.newAccount = () => {
    Alerts.clear();
    $uibModal.open({
      templateUrl: 'partials/account-form.pug',
      windowClass: 'bc-modal initial',
      controller: 'AccountFormCtrl',
      resolve: {
        account: () => void 0
      }
    });
  };

  $scope.transfer = () => {
    let fromAccount = Wallet.accounts()[Wallet.getDefaultAccountIndex()];
    modals.openSend({ fromAccount, amount: 0 });
  };

  $scope.openTransferAll = () => $uibModal.open({
    templateUrl: 'partials/settings/transfer.pug',
    controller: 'TransferController',
    windowClass: 'bc-modal',
    resolve: { address: () => $scope.activeSpendableAddresses() }
  });

  $scope.openVerifyMessage = () => $uibModal.open({
    templateUrl: 'partials/settings/verify-message.pug',
    controller: 'VerifyMessageController',
    windowClass: 'bc-modal initial'
  });
}
