angular.module('app').controller('AlbumDetailsCtrl', function ($scope, $q, $stateParams, $state, dialogs,
                                                               $sessionStorage, $document, toastr,
                                                               albumService, DEFAULT_ALBUM, fileService) {
  'use strict';

  function loadFiles(page, type) {
    var params = {
      size: 120,
      page: page
    };
    if (type) {
      params.type = type;
    }
    if ($stateParams.id !== '0') {
      params.album = $stateParams.id;
    }
    fileService.get(params).then(function (response) {

      //  // "_page":{"size":20,"page":0,"totalElements":10,"totalPages":1}
      response.data._page.page++;
      $scope.pagination = response.data._page;
      $scope.files = response.data._embedded.files;
    });
  }

  $sessionStorage.album = $stateParams.id;
  if ($stateParams.id !== '0') {
    albumService.getById($stateParams.id).then(function (response) {
      $scope.album = response.data.content;
      $scope.$watch('album.title', function (newVal, oldVal) {
        if (newVal && oldVal && newVal !== oldVal) {
          albumService.update($stateParams.id, {title: newVal})
            .success(function () {
              toastr.success('Titolo dell\'album', 'Ottimo!');
            })
            .error(function () {
              toastr.error('Si è verificato un errore', 'Errore');
            });
        }
      });
    });
  } else {
    $scope.album = DEFAULT_ALBUM;
  }


  loadFiles(0);

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
      albumService.destroy($stateParams.id)
        .success(function () {
          toastr.success('Album eliminato', 'Ottimo!');
          $state.go('albums');
        })
        .error(function () {
          toastr.error('Si è verificato un errore', 'Errore');
        });
    });
  };

  $scope.changeLayout = function (layout) {
    $scope.layout = $sessionStorage.albumLayout = layout;
  };

  $scope.doFilter = function (type) {
    $scope.appliedFiter = type === $scope.appliedFiter ? '' : type;
    loadFiles(0, $scope.appliedFiter);
  };

  $scope.layout = $sessionStorage.albumLayout || 'list';


  $scope.$watch('pagination.page', function (newValue, oldValue) {
    if (newValue && oldValue && newValue !== oldValue) {
      $('body').animate({scrollTop: 0}, '1000');
      loadFiles(newValue - 1, $scope.appliedFiter);

    }
  });

});
