angular
  .module('walletApp')
  .controller('BuySellSelectPartnerController', BuySellSelectPartnerController);

function BuySellSelectPartnerController ($scope, $state, $timeout, Wallet, MyWallet, coinify, country, state, tradeStatus, modals, Env, sfox) {
  tradeStatus.canTrade().then((canTrade) => {
    if (!canTrade) {
      $state.go('wallet.common.home');
      if ($scope.inMobileBuy) {
        $timeout(() => modals.openFullScreen('partials/buy-subscribe-modal.pug', 'SubscribeCtrl'));
      }
    }
  });

  let contains = (val, list) => list.indexOf(val) > -1;
  let accountInfo = MyWallet.wallet.accountInfo;
  let codeGuess = accountInfo && accountInfo.countryCodeGuess;
  let stateCodeGuess = accountInfo && accountInfo.stateCodeGuess;

  $scope.countries = country.countryCodes;
  $scope.country = $scope.countries.filter(c => c.Code === codeGuess)[0];
  $scope.states = state.stateCodes;
  $scope.state = $scope.states.filter((s) => s.Code === stateCodeGuess)[0] || $scope.states[0];
  $scope.sfoxAvailable = accountInfo.invited.sfox && accountInfo.invited.sfoxBuy;

  Env.then(env => {
    $scope.coinifyWhitelist = env.partners.coinify.countries;
    $scope.unocoinWhitelist = env.partners.unocoin.countries;
    $scope.sfoxWhitelist = env.partners.sfox.countries;
    $scope.sfoxStateWhitelist = env.partners.sfox.states;
  });

  $scope.email = Wallet.user.email;

  $scope.partners = {
    'coinify': {
      namespace: 'COINIFY',
      logo: 'img/coinify-logo.svg',
      href: 'https://www.coinify.com/',
      route: '.coinify',
      invited: accountInfo.invited.coinify
    },
    'sfox': {
      namespace: 'SFOX',
      logo: 'img/sfox-logo.png',
      href: 'https://www.sfox.com/',
      route: '.sfox',
      invited: accountInfo.invited.sfox && accountInfo.invited.sfoxBuy
    },
    'unocoin': {
      namespace: 'UNOCOIN',
      logo: 'img/unocoin-logo.png',
      href: 'https://www.unocoin.com/',
      route: '.unocoin',
      invited: accountInfo.invited.unocoin
    }
  };

  $scope.signupForAccess = () => {
    let email = encodeURIComponent($scope.email);
    let country = $scope.country.Name;
    let state = $scope.country.Code === 'US' ? $scope.state.Name : undefined;

    coinify.signupForAccess(email, country, state);
  };

  $scope.signupForSellAccess = () => {
    let email = encodeURIComponent($scope.email);
    let state = $scope.country.Code === 'US' ? $scope.state.Name : undefined;

    sfox.signupForSellAccess(email, state);
  };

  $scope.selectPartner = (partner, countryCode) => {
    $scope.status = { busy: true };
    $state.go($scope.vm.base + partner.route, { countryCode })
      .catch(() => { $scope.status.busy = false; });
  };

  $scope.onWhitelist = (countryCode) => (
    (contains(countryCode, $scope.coinifyWhitelist) && 'coinify') ||
    (contains(countryCode, $scope.unocoinWhitelist) && accountInfo.invited.unocoin && 'unocoin') ||
    (contains(countryCode, $scope.sfoxWhitelist) && codeGuess === 'US' && 'sfox') || false
  );

  $scope.onStateWhitelist = (stateCode) => (
    contains(stateCode, $scope.sfoxStateWhitelist) && 'sfox' || false
  );

  $scope.dismissBuyIntro = sfox.dismissBuyIntro;
  $scope.hasDismissedBuyIntro = sfox.hasDismissedBuyIntro;

  Env.then(env => {
    let email = MyWallet.wallet.accountInfo.email;
    $scope.canSeeSellTab = MyWallet.wallet.external.shouldDisplaySellTab(email, env, 'coinify');
    $scope.tabs = {
      options: $scope.$root.inMobileBuy || !$scope.canSeeSellTab
        ? ['BUY_BITCOIN', 'ORDER_HISTORY']
        : ['BUY_BITCOIN', 'SELL_BITCOIN', 'ORDER_HISTORY']
    };
  });

  $scope.$watchGroup(['country', 'state'], (newValues) => {
    let country = newValues[0];
    let state = newValues[1];

    if (!country) { // This should normally not happen
      $scope.blacklisted = true;
      return;
    }

    let whitelisted;

    if (country.Code === 'US') {
      whitelisted = $scope.onWhitelist(country.Code) && state && $scope.onStateWhitelist(state.Code);
    } else {
      whitelisted = $scope.onWhitelist(country.Code);
    }
    $scope.blacklisted = !whitelisted;
    $scope.partner = whitelisted ? $scope.partners[whitelisted] : null;
    $scope.showIntroductionBanner = $scope.partner && $scope.partner.namespace ? $scope.partners[$scope.partner.namespace.toLowerCase()].invited : false;
  });
}
