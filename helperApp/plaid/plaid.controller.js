
function PlaidController ($scope, $routeParams) {
  const isInIframe = (window.parent !== window);

  if (!isInIframe) {
    console.error('Must be inside iframe');
    return;
  }

  const parentUrl = document.referrer.replace('/wallet/', '');

  var linkHandler = window.Plaid.create({
    product: 'auth',
    env: $routeParams.env,
    clientName: 'SFOX',
    key: $routeParams.apiKey,
    onLoad: function () {},
    onExit: function () {
      $scope.hideButton = false; $scope.$root.$apply();
      window.parent.postMessage({from: 'plaid', to: 'exchange', command: 'disablePlaid'}, parentUrl);
    },
    onSuccess: function (public_token, metadata) {
      $scope.hideButton = false; $scope.$root.$apply();
      window.parent.postMessage({from: 'plaid', to: 'exchange', command: 'getBankAccounts', msg: public_token}, parentUrl);
    }
  });

  $scope.enablePlaid = () => {
    window.parent.postMessage({from: 'plaid', to: 'exchange', command: 'enablePlaid'}, parentUrl);
    $scope.hideButton = true;
    linkHandler.open();
  };
}

export default PlaidController;
