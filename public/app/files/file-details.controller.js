angular.module('app').controller('FileDetailsCtrl', function ($scope, $stateParams, fileService, dialogs, $state,
                                                              albumService, $sessionStorage, toastr, $sce) {
  'use strict';

  function update(data) {
    fileService.update($stateParams.id, data)
      .success(function () {
        toastr.success('Elemento aggiornato', 'Ottimo!');
      })
      .error(function () {
        toastr.error('Si è verificato un errore', 'Errore');
      });
  }

  fileService.getById($stateParams.id).then(function (response) {
    $scope.file = response.data.content;
    if (/^video/.test($scope.file.contentType)) {
      console.log('v1/files/' + $scope.file.filename + '/download');
      $scope.video = {
        sources: [
          {
            src: $sce.trustAsResourceUrl('v1/files/' + $scope.file.filename + '/download'),
            type: $scope.file.contentType
          }
        ],
        theme: {
          url: 'bower_components/videogular-themes-default/videogular.css'
        }
      };
    }
    if ($scope.file.tags) {
      $scope.tags = _.map($scope.file.tags, function (tag) {
        return {
          text: tag
        };
      });
    }

  })
    .then(function () {
      return albumService.slim().then(function (response) {
        $scope.albums = response.data;
      });
    })
    .then(function () {
      _.forEach($scope.albums, function (album) {
        album.ticked = _.contains($scope.file.albums, album._id);
      });

      $scope.$watch('selectedAlbums', function (newVal, oldVal) {
        if (newVal && oldVal && newVal.length !== oldVal.length) {
          update({
            albums: _.map($scope.selectedAlbums, function (album) {
              return album._id;
            })
          });
        }
      });
    });

  $scope.albumSelectLabels = {
    selectAll: 'Seleziona tutti',
    selectNone: 'Deseleziona tutti',
    reset: 'Annulla',
    search: 'Cerca...',
    nothingSelected: 'Nessuno'
  };

  $scope.onTagsChanged = function () {
    $scope.file.tags = _.map($scope.tags, function (tag) {
      return tag.text;
    });
    update({
      tags: $scope.file.tags
    });
  };

  $scope.loadTags = function (query) {
    return fileService.getTags({q: query}).then(function (response) {
      return _.map(response.data, function (tag) {
        return {
          text: tag
        };
      });
    });
  };
  $scope.deleteFile = function () {
    var dlg = dialogs.confirm('Conferma', 'Eliminare defintivamente questo file?');
    dlg.result.then(function () {
      fileService.destroy($stateParams.id).then(function () {
        if ($sessionStorage.album) {
          $state.go('albums/details', {id: $sessionStorage.album});
        } else {
          $state.go('albums');
        }
      });
    });
  };


});
