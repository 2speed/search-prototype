(function() {
    'use strict';

    angular
        .module('dataApp')
        .run(runBlock);

    /* @ngInject */
    function runBlock(log) {
        log.debug('Run block complete');
    }
})();
