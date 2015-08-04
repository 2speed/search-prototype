(function() {
    'use strict';

    angular
        .module('dataApp.shared.exception')
        .factory('exception', exception);

    /* @ngInject */
    function exception(log) {
        var service = {
            onError: onError
        };

        return service;

        function onError(message) {
            return function(reason) {
                log.error(message, reason);
            };
        }
    }
})();
