angular.module('app').controller('AppCtrl', function ($scope, $sessionStorage) {
  'use strict';
  $scope.isImage = function (file) {
    if (file) {
      if (file.name) {
        return /\.(jpeg|jpg|gif|png)$/.test(file.name);
      }
      return file.contentType && /^image/.test(file.contentType);
    }
    return false;
  };

  $scope.$storage = $sessionStorage;

});
