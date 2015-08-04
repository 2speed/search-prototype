(function DisplayDetail() {
    'use strict';

    angular
        .module('dataApp.shared.logging')
        .directive('displayDetail', displayDetail);

    /* @ngInject */
    function displayDetail() {
        var directive = {
            link: displayDetailLink,
            restrict: 'E',
            scope: {
                info: '@',
                placement: '@'
            },
            template: html
        };

        return directive;

        function displayDetailLink($scope) {
            $scope.placement = ($scope.placement || 'top');
        }
    }
})();
