angular
  .module('walletApp')
  .controller('NavigationCtrl', NavigationCtrl);

function NavigationCtrl($scope, $interval, $cookies, $http, Wallet, Alerts, currency) {
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.whatsNewTemplate = 'templates/whats-new.jade';
  $scope.lastViewedWhatsNew = $cookies.get('whatsNewViewed') || 0;
  $scope.feats = [];

  $scope.viewedWhatsNew = () => {
    $scope.nLatestFeats = 0;
    $cookies.put('whatsNewViewed', Date.now());
  };

  $scope.logout = () => {
    let isSynced = Wallet.isSynchronizedWithServer();
    let message = isSynced ? 'ARE_YOU_SURE_LOGOUT' : 'CHANGES_BEING_SAVED';
    Alerts.confirm(message, {}, 'top').then(() => {
      $cookies.remove('password');
      Wallet.logout();
    });
  };

  $http.get('/whats-new').then(({data}) => {
    $scope.feats = data;
    $scope.nLatestFeats = data.filter(({date}) => date > $scope.lastViewedWhatsNew).length;
  });

  $interval(() => {
    if (Wallet.status.isLoggedIn) currency.fetchExchangeRate();
  }, 15 * 60000);
}
