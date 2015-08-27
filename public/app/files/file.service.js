angular.module('app').factory('fileService', function ($http) {
  'use strict';
  return {
    get: function (params) {
      return $http.get('v1/files', {params: params});
    },
    getTags: function (params) {
      return $http.get('v1/files/tags', {params: params});
    },
    getInfo: function () {
      return $http.get('v1/files/info');
    },
    getById: function (id) {
      return $http.get('v1/files/' + id);
    },
    destroy: function (id) {
      return $http.delete('v1/files/' + id);
    },
    update: function (id, data) {
      return $http.patch('v1/files/' + id, data);
    }
  };
});
