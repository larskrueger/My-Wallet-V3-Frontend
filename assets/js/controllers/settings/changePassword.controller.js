angular
  .module('walletApp')
  .controller('ChangePasswordCtrl', ChangePasswordCtrl);

function ChangePasswordCtrl ($scope, $log, Wallet, Alerts) {
  $scope.isCorrectMainPassword = Wallet.isCorrectMainPassword;
  $scope.uid = Wallet.user.uid;

  $scope.reset = () => {
    $scope.fields = {
      currentPassword: '',
      password: '',
      confirmation: ''
    };
  };

  $scope.isUserEmail = (candidate) => {
    return Wallet.user.email && candidate === Wallet.user.email;
  };

  $scope.isPasswordHint = (candidate) => {
    return Wallet.user.passwordHint && candidate === Wallet.user.passwordHint;
  };

  $scope.change = () => {
    if (!$scope.form.$valid) return;

    const error = (err) => {
      $scope.status.waiting = false;
      $scope.errors.unsuccessful = err;
    };

    $scope.status.waiting = true;
    Wallet.changePassword($scope.fields.password, $scope.deactivate, error);
  };
}
