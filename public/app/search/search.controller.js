angular.module('app').controller('SearchCtrl', function ($scope, $q, $stateParams, $state, dialogs,
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

  loadFiles(0);

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
