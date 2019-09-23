angular
  .module('shared')
  .factory('AngularHelper', AngularHelper);

AngularHelper.$inject = ['$rootScope', '$window'];

function AngularHelper ($rootScope, $window) {
  let setSizes = (width) => {
    let size = $rootScope.size = {};
    size.xs = width < 768;
    size.sm = width >= 768 && width < 992;
    size.md = width >= 992 && width < 1200;
    size.mobile = width <= 1024;
    size.lg = width >= 1200;
    $safeApply();
  };

  setSizes($window.innerWidth);
  angular.element($window).bind('resize', () => setSizes($window.innerWidth));

  return {
    $safeApply: $safeApply,
    installLock: installLock
  };

  function $safeApply (scope = $rootScope, before) {
    if (!scope.$$phase && !$rootScope.$$phase) scope.$apply(before);
  }

  function installLock () {
    this.locked = false;
    this.lock = () => { this.locked = true; };
    this.free = () => { this.locked = false; };
  }
}
