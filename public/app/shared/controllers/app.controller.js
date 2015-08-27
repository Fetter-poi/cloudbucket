angular.module('app').controller('AppCtrl', function ($scope, $sessionStorage) {
  'use strict';
  $scope.isImage = function (file) {
    if (file) {
      if (file.name) {
        return /\.(jpeg|jpg|gif|png)$/gi.test(file.name);
      }
      return file.contentType && /^image/.test(file.contentType);
    }
    return false;
  };

  $scope.isVideo = function (file) {
    if (file) {
      return file.contentType && /^video/.test(file.contentType);
    }
    return false;
  };


  $scope.fileSize = function (size) {
    if (!size) {
      return '0 B';
    }
    if (size > 1000) {
      if (size > 1000 * 1000) {
        if (size > 1000 * 1000 * 1000) {
          return (size / 1000 / 1000 / 1000).toFixed(2) + ' GB';
        }
        return (size / 1000 / 1000).toFixed(2) + ' MB';
      }
      return (size / 1000).toFixed(2) + ' KB';
    }
    return size.toFixed(2) + ' B';
  };

  $scope.$storage = $sessionStorage;

});
