angular.module('app').controller('AlbumDetailsCtrl', function ($scope, $q, $stateParams, $state, dialogs,
                                                               $sessionStorage,
                                                               albumService, DEFAULT_ALBUM, fileService) {
  'use strict';

  var filesPromise = null;
  $sessionStorage.album = $stateParams.id;
  if ($stateParams.id !== '0') {
    albumService.getById($stateParams.id).then(function (response) {
      $scope.album = response.data.content;
      $scope.$watch('album.title', function (newVal, oldVal) {
        if (newVal && oldVal && newVal !== oldVal) {
          albumService.update($stateParams.id, {title: newVal});
        }
      });
    });
    filesPromise = fileService.get({album: $stateParams.id});
  } else {
    $scope.album = DEFAULT_ALBUM;
    filesPromise = fileService.get();
  }


  filesPromise.then(function (response) {
    $scope.files = response.data._embedded.files;
  });

  $scope.validateTitle = function (title) {
    if ($stateParams.id !== '0') {
      console.log(title);
      return title;
    }
    return false;
  };

  $scope.deleteAlbum = function () {
    var dlg = dialogs.confirm('Conferma', 'Eliminare defintivamente questo album?');
    dlg.result.then(function () {
      albumService.destroy($stateParams.id).then(function () {
        $state.go('albums');
      });
    });
  };
});
