
angular
  .module('walletDirectives')
  .directive('completedLevel', completedLevel);

completedLevel.$inject = [];

function completedLevel () {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      content: '@',
      img: '@',
      message: '@',
      placement: '@'
    },
    templateUrl: 'templates/completed-level.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.tooltip = {
      templateUrl: 'templates/completed-level-tooltip.pug',
      placement: scope.placement || 'top'
    };
  }
}
