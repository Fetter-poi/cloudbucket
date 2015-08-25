angular.element(document).ready(function () {
  'use strict';
  angular.bootstrap(document, ['app']);
});

angular.module('app', [
  'ui.router',
  'ngFileUpload',
  'ngAnimate',
  'ngSanitize',
  'ui.bootstrap',
  'gg.editableText',
  'pascalprecht.translate',
  'dialogs.main',
  'angularMoment',
  'ngStorage'
])
  .config(function ($stateProvider, $urlRouterProvider, $translateProvider) {
    'use strict';
    $stateProvider.state('home', {
      url: '/home',
      controller: 'HomeCtrl',
      templateUrl: 'app/home/home.tpl.html'
    }).state('profile', {
      url: '/profile',
      controller: 'ProfileCtrl',
      templateUrl: 'app/profile/profile.tpl.html'
    }).state('albums', {
      url: '/albums',
      controller: 'AlbumIndexCtrl',
      templateUrl: 'app/albums/album-index.tpl.html'
    }).state('albums/details', {
      url: '/albums/:id',
      controller: 'AlbumDetailsCtrl',
      templateUrl: 'app/albums/album-details.tpl.html'
    }).state('files', {
      url: '/files',
      controller: 'FileIndexCtrl',
      templateUrl: 'app/files/file-index.tpl.html'
    }).state('files/details', {
      url: '/files/:id',
      controller: 'FileDetailsCtrl',
      templateUrl: 'app/files/file-details.tpl.html'
    });
    $urlRouterProvider.otherwise('/home');
    $translateProvider.useSanitizeValueStrategy(null);
    $translateProvider.translations('it', {
      DIALOGS_ERROR: 'Errore',
      DIALOGS_ERROR_MSG: 'Si è verificato un errore sconosciuto.',
      DIALOGS_CLOSE: 'Chiudi',
      DIALOGS_PLEASE_WAIT: 'Attendere prego',
      DIALOGS_PLEASE_WAIT_ELIPS: 'Attendere prego...',
      DIALOGS_PLEASE_WAIT_MSG: 'Attendere il completamento dell\'operazione.',
      DIALOGS_PERCENT_COMPLETE: '% Completato',
      DIALOGS_NOTIFICATION: 'Notifica',
      DIALOGS_NOTIFICATION_MSG: 'Notifica sconosciuta.',
      DIALOGS_CONFIRMATION: 'Conferma',
      DIALOGS_CONFIRMATION_MSG: 'Richiesta conferma.',
      DIALOGS_OK: 'OK',
      DIALOGS_YES: 'Sì',
      DIALOGS_NO: 'No'
    });
    $translateProvider.preferredLanguage('it');
  }).run(function (amMoment) {
    amMoment.changeLocale('it');
  });
