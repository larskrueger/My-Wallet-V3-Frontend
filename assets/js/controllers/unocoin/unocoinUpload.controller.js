angular
  .module('walletApp')
  .controller('UnocoinUploadController', UnocoinUploadController);

function UnocoinUploadController (AngularHelper, Env, $scope, $q, state, $http, unocoin, modals, Upload, QA) {
  Env.then(env => {
    $scope.qaDebugger = env.qaDebugger;
  });

  let exchange = $scope.vm.exchange;
  let getNextIdType = () => idTypes.shift();
  let idTypes = ['pancard', 'photo', 'address'];

  $scope.goTo = (step) => $scope.state.step = step;

  $scope.state = {
    idType: getNextIdType()
  };

  $scope.setState = () => {
    $scope.state.idType = getNextIdType();
  };

  $scope.prepUpload = (file) => {
    let fields = $scope.state;
    let idType = fields.idType;
    let profile = exchange.profile;

    return $q.resolve(Upload.base64DataUrl(file))
      .then((url) => profile.addPhoto(idType, url))
      .then(() => idTypes.length > 0 ? $scope.setState() : $scope.verify());
  };

  $scope.verify = () => {
    $scope.lock();

    let profile = exchange.profile;

    return $q.resolve(profile.verify())
             .then(() => { $scope.vm.goTo('pending'); unocoin.pollLevel(); })
             .catch((err) => { $scope.vm.verificationError = err; $scope.vm.goTo('verify'); }).finally($scope.free);
  };

  AngularHelper.installLock.call($scope);

  // QA Tool
  $scope.autoFill = () => {
    ['pancard', 'photo', 'address'].forEach((idType) => exchange.profile.addPhoto(idType, QA.base64DataUrl()));
    $scope.verify();
  };
}
