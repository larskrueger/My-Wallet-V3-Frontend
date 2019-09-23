angular
  .module('walletApp')
  .controller('ShapeShiftReceiptController', ShapeShiftReceiptController);

function ShapeShiftReceiptController ($scope, Alerts, Env, localStorageService) {
  let links;
  Env.then(env => links = env.shapeshift.surveyLinks);

  $scope.trade = $scope.vm.trade;

  $scope.onClose = () => {
    let survey = 'shift-trade-survey';
    let surveyCache = localStorageService.get(survey);
    let shouldClose = surveyCache && surveyCache.index === links.length - 1;
    if (shouldClose) { $scope.vm.tabs.select('ORDER_HISTORY'); $scope.vm.goTo('create'); } else Alerts.surveyCloseConfirm(survey, links, 1).then(() => { $scope.vm.tabs.select('ORDER_HISTORY'); $scope.vm.goTo('create'); });
  };
}
