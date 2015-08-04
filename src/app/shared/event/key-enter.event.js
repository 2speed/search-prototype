(function() {
    'use strict';

    /**
     * @ngdoc directive
     * @name dcc.shared.event:onKeyEnter
     * @description
     * # onKeyEnter
     */
    angular
        .module('dataApp.shared.event')
        .directive('onKeyEnter', onKeyEnter);

    /* @ngInject */
    function onKeyEnter() {
        var directive = {
            link: link
        };

        return directive;

        function link(scope, element, attributes) {
            element.bind('keydown keypress', function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attributes.onKeyEnter);
                    });

                    event.preventDefault();
                }
            });
        }
    }
})();
