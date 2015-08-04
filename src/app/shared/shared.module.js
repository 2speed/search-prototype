(function() {
    'use strict';

    angular.module('dataApp.shared', [
        /* Angular */
        'ngAnimate',
        'ngCookies',
        'ngTouch',
        'ngSanitize',
        'ngResource',
        'ngRoute',
        'ngplus',
        'ui.bootstrap',

        /* NG Grid */
        'ui.grid',
        'ui.grid.edit',
        'ui.grid.pagination',
        'ui.grid.resizeColumns',
        'ui.grid.selection',

        /* Elasticsearch */
        'elasticsearch',

        /* D3/DC */
        'angularDc',

        /* DCC */
        'dataApp.shared.config',
        'dataApp.shared.data',
        'dataApp.shared.event',
        'dataApp.shared.exception',
        'dataApp.shared.logging'
    ]);
})();
