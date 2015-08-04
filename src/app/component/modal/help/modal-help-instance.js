(function() {
    'use strict';

    /**
     * @ngdoc function
     * @name dataApp.component.modal:ModalHelpInstance
     * @description
     * # ModalHelpInstance
     * Controller component
     */
    angular
        .module('dataApp.component.modal')
        .controller('ModalHelpInstance', ModalHelpInstance);

    /* @ngInject */
    function ModalHelpInstance($modalInstance) {
        /* jshint validthis: true */
        var modalHelpInstance = this;

        modalHelpInstance.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    }
})();
