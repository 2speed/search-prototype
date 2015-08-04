(function() {
    'use strict';

    var sharedConfig = angular.module('dataApp.shared.config');

    var environment = {
        title: 'Data Dashboard',
        version: '1.0.0',
        errorPrefix: '[Data-Dashboard Error] '
    };

    sharedConfig.value('environment', environment);

    sharedConfig.config(configure);

    /* @ngInject */
    function configure($logProvider, exceptionHandlerProvider) {
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }

        exceptionHandlerProvider
            .configure({
                errorPrefix: environment.errorPrefix
            });
    }
})();
