angular.module('walletApp').controller('LandingCtrl', LandingCtrl);

function LandingCtrl ($scope, $http, $state, $sce, languages, Env, walletStats) {
  Env.then(env => {
    $scope.network = env.network;
    $scope.rootURL = env.rootURL;
    $scope.showEth = env.ethereum.rolloutFraction === 1;
    $scope.apiDomain = env.apiDomain;

    $http.get($scope.apiDomain + 'charts/my-wallet-n-users?cors=true')
      .then((res) => $scope.walletCount = Math.floor(res.data.values[res.data.values.length - 1].y / 1e6))
      .catch(() => $scope.walletCount = walletStats.walletCountMillions);
  });

  $scope.fields = {
    email: undefined
  };

  $scope.posY = 0;

  $scope.languages = languages.languages;

  $scope.txsCount = walletStats.transactionsCountMillions;

  $scope.firstLoad = () => {
    let language_code = languages.get();

    let suffix;

    if (language_code === 'zh-cn' || language_code === 'zh_CN') {
      suffix = '-zh-cn';
    } else if (language_code === 'ru') {
      suffix = '-ru';
    } else if (language_code === 'uk') {
      suffix = '-ru';
    } else {
      suffix = '';
    }

    $scope.adUrl = $sce.trustAsResourceUrl(`https://storage.googleapis.com/bc_public_assets/video/blockchain-ad${suffix}.mp4`);
  };

  $scope.firstLoad();

  $scope.signup = () => {
    $state.go('public.signup', { email: $scope.fields.email });
  };

  $scope.$watch(languages.get, (code) => {
    $scope.language = languages.mapCodeToName(code);
  });
}
