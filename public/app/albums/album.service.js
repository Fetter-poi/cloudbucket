angular.module('app').factory('albumService', function ($http) {
  'use strict';
  return {
    get: function (params) {
      return $http.get('v1/albums', {params: params});
    },
    slim: function (params) {
      return $http.get('v1/albums/slim', {params: params});
    },
    getById: function (id) {
      return $http.get('v1/albums/' + id);
    },
    countFiles: function (id) {
      return $http.get('v1/albums/' + id + '/count');
    },
    destroy: function (id) {
      return $http.delete('v1/albums/' + id);
    },
    create: function (data) {
      return $http.post('v1/albums', data);
    },
    update: function (id, data) {
      return $http.patch('v1/albums/' + id, data);
    }
  };
}).constant('DEFAULT_ALBUM', {
  title: 'Nuovi file',
  _id: 0
});
