angular
  .module('walletApp')
  .controller('BitcoinCashExchangeController', BitcoinCashExchangeController);

function BitcoinCashExchangeController ($scope, ShapeShift, MyWallet, modals, Alerts, $uibModalStack) {
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  $scope.wallet = MyWallet.wallet.hdwallet.accounts[$scope.vm.asset.index];
  $scope.steps = enumify('exchange-create', 'exchange-confirm', 'exchange-receipt');
  $scope.onStep = (s) => $scope.steps[s] === $scope.step;
  $scope.goTo = (s) => $scope.step = $scope.steps[s];

  $scope.goTo('exchange-create');

  $scope.rateHandler = ShapeShift.getRate;
  $scope.quoteHandler = ShapeShift.getQuote;
  $scope.buildPayment = ShapeShift.buildPayment;
  $scope.approximateQuoteHandler = ShapeShift.getApproximateQuote;

  $scope.onCreateComplete = (payment, fee, quote) => {
    $scope.fee = fee;
    $scope.quote = quote;
    $scope.payment = payment;
    $scope.goTo('exchange-confirm');
  };

  $scope.shiftHandler = ShapeShift.shift;
  $scope.openHelper = modals.openHelper;

  $scope.onConfirmComplete = (trade) => {
    $scope.vm.trade = trade;
    $scope.goTo('exchange-receipt');
    ShapeShift.watchTradeForCompletion(trade).then(modals.openShiftTradeDetails);
  };

  $scope.onExpiration = () => {
    $uibModalStack.dismissAll();
    $scope.vm.goTo('exchange-create');
  };

  $scope.trade = $scope.vm.trade;
}
