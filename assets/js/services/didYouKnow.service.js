angular
  .module('didYouKnow', [])
  .factory('DidYouKnow', DidYouKnow);

function DidYouKnow () {
  const getRandInRange = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  const dyks = [
    {
      id: 1,
      title: 'DYK_CUSTOM_FEES_TITLE',
      type: 'FEATURE',
      text: 'DYK_CUSTOM_FEES',
      icon: 'ti-signal'
    }, {
      id: 2,
      title: 'DYK_RECOVERY_TITLE',
      type: 'FEATURE',
      text: 'DYK_RECOVERY',
      icon: 'ti-lock',
      linkText: 'SECURITY',
      state: 'wallet.common.settings.security'
    }, {
      id: 3,
      title: 'DYK_TX_FEES_TITLE',
      type: 'EDUCATIONAL',
      text: 'DYK_TX_FEES',
      icon: 'ti-thought'
    }, {
      id: 4,
      title: 'DYK_FEEDBACK_TITLE',
      type: 'FEATURE',
      text: 'DYK_FEEDBACK',
      icon: 'ti-announcement',
      linkText: 'GIVE_FEEDBACK',
      state: 'wallet.common.feedback'
    }, {
      id: 5,
      title: 'DYK_BTC_VALUE_TITLE',
      type: 'EDUCATIONAL',
      text: 'DYK_BTC_VALUE',
      icon: 'ti-stats-up'
    }
  ];

  const service = {
    getAll: () => dyks, // Only used for tests
    getRandom: () => dyks[getRandInRange(0, dyks.length - 1)]
  };
  return service;
}
