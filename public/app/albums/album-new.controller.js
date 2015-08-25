angular.module('app').controller('AlbumNewCtrl', function ($scope, $modalInstance, $state, albumService) {
  'use strict';

  $scope.submit = function (form) {
    console.log(form);
    if (form.$valid) {
      albumService.create($scope.model).then(function (response) {
        var albumId = _.last(response.headers('location').split(/\//));
        $state.go('albums/details', {id: albumId});
      });
    }
  };


  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
