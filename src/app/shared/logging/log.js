(function() {
    'use strict';

    angular
        .module('dataApp.shared.logging')
        .factory('log', loggerFactory);

    /* @ngInject */
    function loggerFactory($log) {
        var service = {
            showNotification: true,
            success: success,
            warning: warning,
            error: error,
            info: info,
            debug: debug,
            log: $log.log
        };

        return service;

        function success(message, data, title) {
            $log.info('SUCCESS: ' + message, (data || ''));
        }

        function warning(message, data, title) {
            $log.warn('WARNING: ' + message, (data || ''));
        }

        function error(message, data, title) {
            $log.error('ERROR: ' + message, (data || ''));
        }

        function info(message, data, title) {
            $log.info('INFO: ' + message, (data || ''));
        }

        function debug(message, data, title) {
            $log.debug('DEBUG: ' + message, (data || ''));
        }
    }
}());
