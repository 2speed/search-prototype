(function() {
    'use strict';

    // Configuration
    angular
        .module('dataApp')
        .config(dataAppConfig);

    /* @ngInject */
    function dataAppConfig($logProvider, toastr) {
        // Enable log
        $logProvider.debugEnabled(true);

        // Set options third-party lib
        toastr.options.timeOut           = 3000;
        toastr.options.positionClass     = 'toast-top-right';
        toastr.options.preventDuplicates = true;
        toastr.options.progressBar       = true;
    }

    // Decorators
    angular
        .module('dataApp')
        .decorator('$q', qDecorator);

    /* @ngInject */
    function qDecorator($delegate, $window) {
        var Promise = $window.Promise;

        if (!Promise) {
            return $delegate;
        }

        var decorated = function(resolve, reject) {
            return new Promise(resolve, reject);
        };

        decorated.prototype = Promise.prototype;

        angular.extend(decorated, Promise);

        decorated.defer = function() {
            var deferred = decorated.pending();

            deferred.resolve = angular.bind(deferred, deferred.fulfill);
            deferred.reject  = angular.bind(deferred, deferred.reject);
            deferred.notify  = angular.bind(deferred, deferred.progress);

            return deferred;
        };

        decorated.reject = decorated.rejected;
        decorated.when   = decorated.cast;

        var decoratedAll = decorated.all;
        decorated.all = function(promises) {
            if (angular.isObject(promises) && !angular.isArray(promises)) {
                return decorated.props(promises);
            }

            return decoratedAll.call(decorated, promises);
        };

        var decoratedFinally = decorated.prototype.finally;
        decorated.prototype.finally = function(finallyCb, progressCb) {
            this.progressed(progressCb);

            return decoratedFinally.call(this, finallyCb);
        };

        decorated.onPossiblyUnhandledRejection(angular.noop);

        return decorated;
    }
})();
