angular.module('app').factory('userService', function ($http) {
  'use strict';
  return {
    getMe: function () {
      return $http.get('v1/users/me');
    },
    updateMe: function (data) {
      return $http.patch('v1/users/me', data);
    }
  };
});
