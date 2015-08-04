(function() {
    'use strict';

    angular
        .module('dataApp.shared.data')
        .service('searchFilterService', searchFilterService);

    /* @ngInject */
    function searchFilterService() {
        var searchFilterServiceDefinition = {
            findSelectedFilter: findSelectedFilter,
            formatFilters: formatFilters
        };

        return searchFilterServiceDefinition;

        function findSelectedFilter(field, value) {
            /* jshint validthis: true */
            var selectedFilters = this.filters.selectedFilters;

            for (var i = 0; i < selectedFilters.length; i++) {
                var obj = selectedFilters[i];
                if (obj.field === field && obj.value === value) {
                    return i;
                }
            }
            return -1;
        }

        function formatFilters(aggregations) {
            /* jshint validthis: true */
            var self = this;

            var formattedFilters = {};

            for (var aggregation in aggregations) {
                if (aggregations.hasOwnProperty(aggregation)) {
                    formattedFilters[aggregation] =
                        aggregations[aggregation]
                            .buckets
                            .map(filteringResult());
                }
            }

            function filteringResult(result) {
                var isSelected = function() {
                    return self.findSelectedFilter(aggregation, result.key) === -1 ? false : true;
                };

                return {
                    value: result.key,
                    count: result.doc_count,
                    isSelected: isSelected()
                };
            }

            this.filters.availableFilters = formattedFilters;
        }
    }
})();
