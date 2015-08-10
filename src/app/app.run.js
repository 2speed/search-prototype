(function() {
    'use strict';

    angular
        .module('dataApp')
        .run(runBlock);

    /* @ngInject */
    function runBlock($rootScope, $window, log) {
        var Promise = $window.Promise;

        Promise.setScheduler(function(callback) {
            $rootScope.$evalAsync(callback);
        });

        log.info('You know, for search...');
    }
})();

