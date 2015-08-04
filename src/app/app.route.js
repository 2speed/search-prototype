(function() {
    'use strict';

    angular
        .module('dataApp')
        .config(routeConfig);

    /* @ngInject */
    function routeConfig($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'component/search/search.html',
                controller: 'SearchController',
                controllerAs: 'search'
            })
            .when('/chart', {
                templateUrl: 'component/chart/chart.html',
                controller: 'ChartController',
                controllerAs: 'chart'
            })
            .otherwise({
                redirectTo: '/'
            });
    }
})();
