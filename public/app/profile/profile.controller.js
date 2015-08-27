angular.module('app').controller('ProfileCtrl', function ($scope, userService, toastr) {
  'use strict';

  userService.getMe().success(function (data) {
    $scope.model = {
      displayName: data.displayName
    };
  });

  $scope.submit = function (form) {
    console.log(form);
    if (form.$valid) {
      userService.updateMe($scope.model)
        .success(function (data) {
          $scope.model = {
            displayName: data.displayName
          };
          toastr.success('Profilo utente aggiornato', 'Ottimo!');
        })
        .error(function () {
          toastr.error('Si è verificato un errore', 'Errore');
        });
    }
  };
});
