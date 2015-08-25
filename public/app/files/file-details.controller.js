angular.module('app').controller('FileDetailsCtrl', function ($scope, $stateParams, fileService) {
  'use strict';

  fileService.getById($stateParams.id).then(function (response) {
    $scope.file = response.data.content;
  });
});
