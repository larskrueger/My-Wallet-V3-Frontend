angular
  .module('walletApp')
  .controller('SfoxUploadController', SfoxUploadController);

function SfoxUploadController (AngularHelper, Env, $scope, $q, state, $http, sfox, modals, Upload, QA) {
  Env.then(env => {
    $scope.qaDebugger = env.qaDebugger;
  });

  let exchange = $scope.vm.exchange;
  let initialUploadStep = 0;
  $scope.uploadSteps = exchange.profile.verificationStatus.required_docs.length;
  let getNextIdType = () => {
    let { required_docs = [] } = exchange.profile.verificationStatus;

    return required_docs[0];
  };

  $scope.state = {
    idType: getNextIdType(),
    signedURL: undefined
  };

  $scope.setState = () => {
    $scope.state.verificationStatus = exchange.profile.verificationStatus;
    $scope.state.idType = getNextIdType();
    $scope.state.file = undefined;
  };

  $scope.prepUpload = (file) => {
    $scope.lock();
    let fields = $scope.state;
    let profile = exchange.profile;
    let idType = fields.idType;
    let filename = file.name;

    return $q.resolve(profile.getSignedURL(idType, filename))
      .then((res) => $scope.upload(res.signed_url, file))
      .catch((err) => console.log(err));
  };

  $scope.upload = (url, file) => {
    return Upload.http({
      method: 'PUT',
      url: url,
      data: file,
      headers: { 'content-type': 'application/octet-stream' }
    }).then(() => exchange.fetchProfile())
      .then(() => $scope.setState())
      .catch(sfox.displayError)
      .finally($scope.free);
  };

  let watchVerificationStatusLevel = (level) => {
    let { required_docs = [] } = exchange.profile.verificationStatus;
    let complete;

    if (level === 'verified') complete = true;
    if (level === 'pending' && !required_docs[0]) complete = true;

    $scope.onUploadStep = initialUploadStep += 1;
    complete && $scope.vm.goTo(sfox.determineStep(exchange));
  };

  AngularHelper.installLock.call($scope);
  $scope.$watch('state.verificationStatus.level', watchVerificationStatusLevel);

  // QA Tool
  $scope.autoFill = () => {
    ['id', 'address'].forEach((idType) => {
      exchange.profile.getSignedURL(idType, idType).then((res) => {
        $scope.upload(res.signed_url, QA.base64DataUrl());
      });
    });
  };
}
