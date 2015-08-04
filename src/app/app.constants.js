/* global toastr:false, moment:false */
(function() {
    'use strict';

    angular
        .module('dataApp')
        .constant('toastr', toastr)
        .constant('moment', moment);
})();
