
angular
  .module('walletApp')
  .factory('languages', languages);

languages.$inject = ['$translate', '$location'];

function languages ($translate, $location) {
  const languageCodes = {
    'de': 'German',
    // 'cs': 'Czech', // Pending backend support
    'hi': 'Hindi',
    'no': 'Norwegian',
    'ru': 'Russian',
    // 'uk': 'Ukrainian', // Pending backend support
    'pt': 'Portuguese',
    'bg': 'Bulgarian',
    'fr': 'French',
    'zh-cn': 'Chinese Simplified',
    'hu': 'Hungarian',
    'sl': 'Slovenian',
    'id': 'Indonesian',
    'sv': 'Swedish',
    'ko': 'Korean',
    'el': 'Greek',
    'en': 'English',
    'it': 'Italiano',
    'es': 'Spanish',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'ja': 'Japanese',
    'pl': 'Polish',
    'da': 'Danish',
    'ro': 'Romanian',
    'nl': 'Dutch',
    'tr': 'Turkish'
  };

  const service = {
    languages: formatLanguages(languageCodes),
    codes: Object.keys(languageCodes),
    get: () => $translate.use(),
    set: (code) => $translate.use(code),
    mapCodeToName: (code) => languageCodes[code],
    isLocalizedMessage,
    localizeMessage,
    parseFromUrl
  };

  let code = parseFromUrl($location.absUrl());
  if (code) $translate.use(code);

  return service;

  function isLocalizedMessage (msg) {
    return angular.isString(msg) || (angular.isObject(msg) && msg['en'] != null);
  }

  function localizeMessage (msg) {
    return angular.isString(msg) ? msg : (msg[service.get()] || msg['en']);
  }

  function formatLanguages (langs) {
    let langFormat = code => ({
      code: code,
      name: langs[code]
    });
    let langSort = (l0, l1) => {
      var name0 = l0.name.toLowerCase();
      var name1 = l1.name.toLowerCase();
      return name0 < name1 ? -1 : 1;
    };
    return Object.keys(langs).map(langFormat).sort(langSort);
  }

  function parseFromUrl (url) {
    let codes = service.codes.join('|');
    let regex = new RegExp(`\\/(${codes})\\/wallet`);
    let matches = url.match(regex);
    return matches && matches.length ? matches[1] : null;
  }
}
