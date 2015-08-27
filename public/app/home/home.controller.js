angular.module('app').controller('HomeCtrl', function ($scope, Upload, $timeout) {
  'use strict';

  $scope.loadingFiles = [];

  $scope.$watch('files', function () {
    $scope.upload($scope.files);
  });

  $scope.upload = function (files) {
    if (files && files.length) {
      _.forEach(files, function (file) {
        if (!file.$error && file.type !== 'directory' && !/^\./.test(file.name)) {
          $scope.loadingFiles.push(file);
          Upload.upload({
            url: 'v1/files/upload',
            fields: {
              'username': $scope.username
            },
            file: file
          }).progress(function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            file.progressPercentage = progressPercentage;
          }).success(function (data, status, headers) {
            var location = headers('location');
            if (location) {
              file._id = _.last(location.split(/\//));
            } else {
              file.error = true;
            }
          }).error(function () {
            file.error = true;
          });
        }
      });
    }
  };
});