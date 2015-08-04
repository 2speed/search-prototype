(function() {
    'use strict';

    /**
     * @ngdoc function
     * @name dataApp.component.modal:ModalHelp
     * @description
     * # ModalHelp
     * Controller component
     */
    angular
        .module('dataApp.component.modal')
        .controller('ModalHelp', ModalHelp);

    /* @ngInject */
    function ModalHelp($modal) {
        /*jshint validthis: true */
        var modalHelp = this;

        var ModalHelpInstance = ['$scope', '$modalInstance',
            function($scope, $modalInstance) {
                $scope.cancel = function() {
                    $modalInstance.dismiss('cancel');
                };
            }
        ];

        modalHelp.open = function(size) {
            $modal.open({
                templateUrl: 'dataApp/component/modal/help/modal-help.html',
                controller: ModalHelpInstance,
                size: size
            });
        };
    }
})();
