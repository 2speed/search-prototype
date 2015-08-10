(function() {
    'use strict';

    angular
        .module('dataApp.shared.data')
        .factory('searchService', searchServiceFactory);

    /* @ngInject */
    function searchServiceFactory($http, $q, log, esFactory) {
        var client = esFactory({
            host: 'localhost:9200',
            apiVersion: '1.4',
            log: 'info'
        });

        var searchService = {
            suggest: suggest,
            search: search
        };

        return searchService;

        function suggest(indexSource, searchText) {
            return client.suggest({
                    index: indexSource.indexName,
                    body: {
                        'suggestions': {
                            'text': (searchText || ''),
                            'completion': { 'field': indexSource.suggestField }
                        }
                    }
                })
                .then(function(response) {
                    var options = [];

                    if (response && response.suggestions) {
                        response
                            .suggestions[0]
                            .options
                            .map(function(option) {
                                options.push(option.text);
                            });
                    }

                    return options;
                });
        }

        function search(criteria) {
            if (criteria && criteria.indexSource) {
                var indexSource = criteria.indexSource;

                var request     = {
                    index: indexSource.indexName,
                    type: indexSource.indexType,
                    body: buildSearchQuery(indexSource, criteria.searchTerms, criteria.filters)
                };

                if (criteria.pagination) {
                    var pagination = criteria.pagination;

                    request.from   = ((pagination.currentPage - 1) * pagination.pageSize);
                    request.size   = pagination.pageSize;
                }

                return client.search(request);
            }
            else {
                return $q.resolve;
            }
        }

        function buildSearchQuery(indexSource, searchTerms, filters) {
            var query = {};

            if (filters && filters.length > 0) {
                query.filtered = { 'filter': { 'bool': { 'must': filters } } };
            }

            if (searchTerms) {
                if (query.hasOwnProperty('filtered')) {
                    query.filtered.query = { 'match': { '_all': searchTerms } };
                }
                else {
                    query = { 'match': { '_all': searchTerms } };
                }
            }
            else if (!query.hasOwnProperty('filtered')) {
                query.match_all = {};
            }

            return indexSource.queryOf(query);
        }
    }
})();
