(function() {
    'use strict';

    angular
        .module('dataApp.shared.data')
        .factory('searchService', searchServiceFactory);

    /* @ngInject */
    function searchServiceFactory($http, $q, log, esFactory, exception) {
        var client = esFactory({
            host: 'tcga-d1-app9.nci.nih.gov:9200',
            apiVersion: '1.4',
            log: 'trace'
        });

        var searchService = {
            suggest: suggest,
            search: search
        };

        return searchService;

        function suggest(indexSource, searchText) {
            var deferred = $q.defer();

            client.suggest({
                    index: indexSource.indexName,
                    body: {
                        'suggestions': {
                            'text': (searchText || ''),
                            'completion': { 'field': indexSource.suggestField }
                        }
                    }
                })
                .then(function(response) {
                    resolveOptions(deferred, response);
                }, function(error) {
                    deferred.reject(error.message);
                    log.error(error.message);
                });

            function resolveOptions(deferred, response) {
                var options = [];

                if ('undefined' !== typeof response && response.suggestions) {
                    response
                        .suggestions[0]
                        .options
                        .map(function(option) {
                            options.push(option.text);
                        });
                }

                deferred.resolve(options);
            }

            return deferred.promise;
        }

        function search(indexSource, searchTerms, filters, pagination) {
            var deferred = $q.defer();

            var searchFields = {
                index: indexSource.indexName,
                type: indexSource.indexType,
                body: buildSearchQuery(indexSource, searchTerms, filters)
            };

            if (pagination) {
                searchFields.from = ((pagination.currentPage - 1) * pagination.pageSize);
                searchFields.size = pagination.pageSize;
            }

            client
                .search(searchFields)
                .then(function(response) {
                    deferred.resolve(response);
                }, function(error) {
                    deferred.reject(error.message);
                    log.error(error.message);
                });

            return deferred.promise;
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
