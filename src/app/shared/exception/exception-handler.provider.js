(function() {
    'use strict';

    angular
        .module('dataApp.shared.exception')
        .provider('exceptionHandler', exceptionHandlerProvider)
        .config(config);

    /* @ngInject */
    function exceptionHandlerProvider() {
        /* jshint validthis:true */
        this.config = {
            errorPrefix: ''
        };

        this.configure = function(config) {
            this.config.errorPrefix = config.errorPrefix;
        };

        this.$get = function() {
            return {
                config: this.config
            };
        };
    }

    /**
     * Configure by setting an optional string value for errorPrefix.
     * Accessible via config.errorPrefix (via config value).
     * @param  {[type]} $provide
     * @return {[type]}
     * @ngInject
     */
    function config($provide) {
        $provide.decorator('$exceptionHandler', extendExceptionHandler);
    }

    /**
     * Extend the $exceptionHandler service to also display a toast.
     * @param  {Object} $delegate
     * @param  {Object} exceptionHandler
     * @return {Function} the decorated $exceptionHandler service
     */
    function extendExceptionHandler($delegate, exceptionHandler, log) {
        return function(exception, cause) {
            var errorPrefix = exceptionHandler.config.errorPrefix || '';
            var error = {
                exception: exception,
                cause: cause
            };

            exception.message = errorPrefix + exception.message;

            $delegate(exception, cause);

            /**
             * Could add the error to a service's collection,
             * add errors to $rootScope, log errors to remote web server,
             * or log locally. Or throw hard. It is entirely up to you.
             * throw exception;
             *
             * @example
             *     throw { message: 'error message we added' };
             */
            log.error(exception.message, error);
        };
    }
})();
