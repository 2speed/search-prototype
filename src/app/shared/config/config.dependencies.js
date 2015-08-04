(function() {
    'use strict';

    /**
     * Lodash
     */
    angular
        .module('dataApp.shared.config')
        .factory('_', lodashFactory);

    /* @ngInject */
    function lodashFactory($window, exception) {
        if (angular.isObject($window._)) {
            return $window._;
        }

        exception.onError('Lodash library cannot be loaded');
    }

    /**
     * D3
     */
    angular
        .module('dataApp.shared.config')
        .factory('d3', d3Factory);

    /* @ngInject */
    function d3Factory($window, exception) {
        if (angular.isObject($window.d3)) {
            return $window.d3;
        }

        exception.onError('D3 library cannot be loaded');
    }

    /**
     * jQuery
     */
    angular
        .module('dataApp.shared.config')
        .factory('$', jqueryFactory);

    /* @ngInject */
    function jqueryFactory($window, exception) {
        if (angular.isObject($window.jQuery)) {
            return $window.jQuery;
        }

        exception.onError('jQuery library cannot be loaded');
    }
})();
