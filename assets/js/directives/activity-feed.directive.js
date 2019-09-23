
angular
  .module('walletDirectives')
  .directive('activityFeed', activityFeed);

activityFeed.$inject = ['$http', 'Wallet', 'MyWallet', 'Activity', 'tradeStatus'];

function activityFeed ($http, Wallet, MyWallet, Activity, tradeStatus) {
  const directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/activity-feed.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.loading = true;
    scope.status = Wallet.status;
    scope.activities = Activity.activities;

    tradeStatus.canTrade().then((res) => scope.canTrade = res);

    scope.$watch(() => Activity.activities, (activities) => {
      scope.activities = activities;
    });

    scope.$watch('status.didLoadTransactions', (didLoad) => {
      if (didLoad) scope.loading = false;
    });

    scope.$watch('status.didLoadSettings', (didLoad) => {
      if (didLoad) Activity.updateLogActivities();
    });
  }
}
