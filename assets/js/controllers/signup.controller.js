angular
  .module('walletApp')
  .controller('SignupCtrl', SignupCtrl);

SignupCtrl.$inject = ['$scope', '$state', 'localStorageService', '$filter', '$timeout', '$translate', 'Wallet', 'currency', 'languages', 'MyWallet', '$http', 'Env', 'Ethereum'];

function SignupCtrl ($scope, $state, localStorageService, $filter, $timeout, $translate, Wallet, currency, languages, MyWallet, $http, Env, Ethereum) {
  $scope.working = false;
  $scope.browser = {disabled: true};

  let language_code = languages.get();
  if (language_code === 'zh_CN') {
    language_code = 'zh-cn';
  }

  let language_guess = $filter('getByProperty')('code', language_code, languages.languages);
  if (language_guess == null) {
    language_guess = $filter('getByProperty')('code', 'en', languages.languages);
  }

  $scope.language_guess = language_guess;

  Env.then(env => {
    $scope.underMaintenance = env.maintenance;
    // Get country code from server:
    $http.get(env.rootURL + 'wallet/browser-info')
      .success(data => {
        let cur;
        const country_code = data.country_code;
        switch (country_code) { // iso-3166-2
          case 'US':
          case 'IO': // British Indian Ocean Territory (de-facto)
            cur = 'USD';
            break;
          // Eurozone countries:
          case 'AT':
          case 'BE':
          case 'CY':
          case 'EE':
          case 'FI':
          case 'FR':
          case 'DE':
          case 'GR':
          case 'IE':
          case 'IT':
          case 'LV':
          case 'LT':
          case 'LU':
          case 'MT':
          case 'NL':
          case 'PT':
          case 'SK':
          case 'SI':
          case 'ES':
          case 'MC': // Monaco
          case 'SM': // San Marino
          case 'VA': // Vatican City
          case 'AD': // Andorra
          case 'PM': // Saint Pierre and Miquelon
          case 'YT': // Mayotte
          case 'BL': // Saint Barthélemy
          case 'XK': // Kosovo
          case 'ME': // Montenegro
          case 'NO': // Norway
          case 'AL': // Albania
          case 'BA': // Bosnia and Herzegovina
          case 'MK': // Macedonia
          case 'RS': // Serbia
          case 'TR': // Turkey
          case 'MD': // Moldova
          case 'CZ': // Czech Republic
            cur = 'EUR';
            break;
          case 'IS': // Iceland
            cur = 'ISK';
            break;
          case 'HK': // Hong Kong
            cur = 'HKD';
            break;
          case 'TW': // Taiwan
            cur = 'TWD';
            break;
          case 'CH': // Switserland
          case 'LI': // Liechtenstein
            cur = 'CHF';
            break;
          case 'DK': // Denmark
          case 'GL': // Greenland
          case 'FO': // Faroe Islands
            cur = 'DKK';
            break;
          case 'CL': // Chili
            cur = 'CLP';
            break;
          case 'CA': // Canada
            cur = 'CAD';
            break;
          case 'CN': // China
          case 'MO': // Macau (or is HKD better?)
            cur = 'CNY';
            break;
          case 'TH': // Thailand
            cur = 'THB';
            break;
          case 'AU': // Australia
            cur = 'AUD';
            break;
          case 'SG': // Singapore
            cur = 'SGD';
            break;
          case 'KR': // South Korea
            cur = 'KRW';
            break;
          case 'JP': // Japan
            cur = 'JPY';
            break;
          case 'PL': // Poland
            cur = 'PLN';
            break;
          case 'GB': // Great Britain, United Kingdom, Channel Islands
          case 'IM': // Isle of Man
          case 'GG': // Guernsey
          case 'SS': // South Georgia and the South Sandwich Islands
          case 'JE': // Jersey
            cur = 'GBP';
            break;
          case 'SE': // Sweden
            cur = 'SEK';
            break;
          case 'NZ': // New Zealand
            cur = 'NZD';
            break;
          case 'BR': // Brazil
            cur = 'BRL';
            break;
          case 'RU': // Russia
            cur = 'RUB';
            break;
          case 'IN': // India
            cur = 'INR';
            break;
          default:
            cur = 'USD'; // One day this will be BTC
        }

        $scope.currency_guess = $filter('getByProperty')('code', cur, currency.currencies);
      }).error(() => {
        // Fallback to USD
        $scope.currency_guess = $filter('getByProperty')('code', 'USD', currency.currencies);
      });
  });

  $scope.fields = {
    password: '',
    confirmation: '',
    acceptedAgreement: false,
    email: $state.params.email || ''
  };

  $state.params.email ? $scope.fields.emailIsFromState = true : '';

  $scope.signup = () => {
    $scope.working = true;

    if ($scope.autoReload) {
      localStorageService.set('password', $scope.fields.password);
    }

    $timeout(() => {
      if (!MyWallet.browserCheck()) {
        $scope.browser.disabled = true;
        $scope.browser.msg = $translate.instant('UNSUITABLE_BROWSER');
        $scope.working = false;
      } else {
        $scope.createWallet((uid) => {
          if (Ethereum.userHasAccess) Ethereum.initialize();
          $state.go('wallet.common.home');
        });
      }
    }, 250);
  };

  $scope.createWallet = (success) => {
    Wallet.create($scope.fields.password, $scope.fields.email, $scope.currency_guess, $scope.language_guess, success);
  };

  $scope.$watch('language_guess', (newVal, oldVal) => {
    if (newVal) {
      languages.set(newVal.code);
    }
  });

  if ($scope.autoCreate) {
    $scope.fields.password = 'password123';
    $scope.fields.confirmation = 'password123';
    $scope.fields.acceptedAgreement = true;
    $scope.fields.email = `${$scope.autoCreate}+${Date.now()}@blockchain.com`;
  }
}
