angular.module('app').controller('AlbumIndexCtrl', function ($scope, $modal, albumService, DEFAULT_ALBUM) {
  'use strict';

  albumService.get().then(function (response) {
    $scope.albums = response.data._embedded.albums;
    $scope.albums.push(DEFAULT_ALBUM);
    _.each($scope.albums, function (album) {
      albumService.countFiles(album._id).success(function (response) {
        album.count = response.count;
      });
    });
  });

  $scope.newAlbum = function () {
    $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'app/albums/album.new.tpl.html',
      controller: 'AlbumNewCtrl',
      size: 'lg'
    });
  };
});
