
angular
  .module('walletDirectives')
  .directive('transactionStatus', transactionStatus);

function transactionStatus (BrowserHelper, Env) {
  const directive = {
    restrict: 'E',
    replace: false,
    scope: {
      transaction: '=',
      confirmations: '='
    },
    templateUrl: 'templates/transaction-status.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.verify = () => {
      if (scope.isCoin('btc')) {
        Env.then(env => {
          BrowserHelper.safeWindowOpen(env.rootURL + 'tx/' + scope.transaction.hash);
        });
      } else if (scope.isCoin('eth')) {
        BrowserHelper.safeWindowOpen(`https://etherscan.io/tx/${scope.transaction.hash}`);
      } else if (scope.isCoin('bch')) {
        BrowserHelper.safeWindowOpen(`https://blockchair.com/bitcoin-cash/transaction/${scope.transaction.hash}`);
      }
    };

    scope.confirmationsNeeded = scope.confirmations || 3;

    scope.isCoin = (coin) => scope.transaction.coinCode === coin;

    scope.$watch('transaction.confirmations', () => {
      if (scope.transaction && scope.transaction.confirmations != null) {
        scope.minutesRemaining = 30 - scope.transaction.confirmations * 10;
        scope.complete = scope.transaction.confirmations >= scope.confirmationsNeeded;
        scope.frugalWarning = scope.transaction.frugal && scope.transaction.confirmations === 0;
      }
    });
  }
}
