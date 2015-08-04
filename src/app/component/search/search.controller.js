(function() {
    'use strict';

    /**
     * @ngdoc function
     * @name searchApp.SearchController
     * @description
     * # SearchController
     * Search controller component
     */
    angular
        .module('dataApp.component.search')
        .controller('SearchController', SearchController);

    /* @ngInject */
    function SearchController($scope, $q, log, d3, searchService, INDEX_SOURCE, SELECTION) {
        /* jshint validthis: true */
        var searchViewModel = this;

        searchViewModel.selection    = SELECTION;
        searchViewModel.isSearching  = false;
        searchViewModel.noResults    = false;
        searchViewModel.resultsPage  = 0;
        searchViewModel.searchText   = '';
        searchViewModel.selectedItem = null;

        // ====================
        // Options
        // ====================
        searchViewModel.option = {
            chart: {
                colorCategory: d3.scale.category20b()
            },
            filter: {
                disease: { name: 'archiveName.disease', value: '' },
                gender: { name: 'patient.gender.value.raw', value: '' },
                race: { name: 'patient.race.value.raw', value: '' }
            },
            pagination: {
                pageSizes: [50, 100, 150, 250],
                pageSize: 50,
                currentPage: 1
            },
            sort: [{
                name: '_score',
                displayName: 'Relevancy',
                direction: 'desc'
            }, {
                direction: 'asc'
            }]
        };

        // ====================
        // Options : Grid
        // ====================
        searchViewModel.option.grid = {
            xml: {
                columnDefs: [
                    { name: 'UUID', field: '_source.patient.bcr_patient_uuid.value' },
                    { name: 'Barcode', field: '_source.patient.bcr_patient_barcode.value' },
                    { name: 'Age at Diagnosis', field: '_source.patient.age_at_initial_pathologic_diagnosis.value' },
                    { name: 'Gender', field: '_source.patient.gender.value' },
                    { name: 'Race', field: '_source.patient.race.value' },
                    { name: 'Disease', field: '_source.archiveName.disease' },
                    { name: 'Platform (Clinical)', field: '_source.archiveName.platform' },
                    { name: 'Platform (Molecular)', field: 'platform_maf' }
                ],
                enableSorting: true,
                paginationPageSizes: searchViewModel.option.pagination.pageSizes,
                paginationPageSize: searchViewModel.option.pagination.pageSize,
                showColumnFooter: true,
                showGridFooter: true,
            },
            maf: {
                columnDefs: [
                    { name: 'Disease', field: '_source.archiveName.disease', width: 120 },
                    { name: 'Gene', field: '_source.Hugo_Symbol', width: 120 },
                    { name: 'Patient', field: '_source.barcode.patient', width: 120 },
                    { name: 'Tumor Sample Barcode',field: '_source.Tumor_Sample_Barcode', width: 280 },
                    { name: 'Start Position', field: '_source.Start_Position', width: 120 },
                    { name: 'End Position', field: '_source.End_Position', width: 120 },
                    { name: 'Mutation Status', field: '_source.Mutation_Status' },
                    { name: 'Validation Status', field: '_source.Validation_Status' },
                    { name: 'Reference Allele', field: '_source.Reference_Allele' },
                    { name: 'Verification Status', field: '_source.Verification_Status' }
                ],
                enableSorting: true,
                showColumnFooter: true
            }
        };

        // ====================
        // Result state
        // ====================
        searchViewModel.results = {
            searchText: '',
            xml: {
                documentCount: 0,
                documents: []
            },
            maf: {
                documentCount: 0,
                documents: []
            }
        };

        searchViewModel.suggest = function(searchText) {
            return searchService
                .suggest(INDEX_SOURCE.xml, searchText)
                .then(function(options) {
                    return options;
                });
        };

        searchViewModel.search = function() {
            searchViewModel.results.searchText           = searchViewModel.searchText;
            searchViewModel.results.xml.documentCount    = 0;
            searchViewModel.results.xml.documents.length = 0;
            searchViewModel.results.maf.documentCount    = 0;
            searchViewModel.results.maf.documents.length = 0;

            return fetchResults(INDEX_SOURCE.xml, searchViewModel.results.searchText);
        };

        searchViewModel.reset = function() {
            var optionFilter = searchViewModel.option.filter;

            Lazy(Object.keys(optionFilter))
                .each(function(filter) {
                    optionFilter[filter].value = '';
                });

            searchViewModel.search();
        }

        function updatePagination(data) {
            if (data) {
                var page             = searchViewModel.option.pagination.currentPage;
                var pageSize         = searchViewModel.option.pagination.pageSize;
                var pagedData        = data.slice((page - 1) * pageSize, page * pageSize);

                searchViewModel.data = pagedData;

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        }

        function updateChartData(data) {
            if (data) {
                var cf = crossfilter(data);

                searchViewModel.nameDimension =
                    cf.dimension(function(d) {
                        return d.key;
                    });

                searchViewModel.docCountGroup =
                    searchViewModel.nameDimension.group().reduceSum(function(d) {
                        return d.doc_count;
                    });
            }
        }

        function filtersOf(indexSource) {
            if (indexSource.indexName === 'xml') {
                var optionFilter = searchViewModel.option.filter;

                return Lazy(Object.keys(optionFilter))
                    .filter(function(filter, index) {
                        return (optionFilter[filter].value.length > 0 && optionFilter[filter].value !== 'All');
                    })
                    .map(function(filter, index) {
                        var termFilter = {
                            term: {}
                        };

                        Object.defineProperty(termFilter.term, optionFilter[filter].name, {
                            value: optionFilter[filter].value.toUpperCase(),
                            writable: true,
                            configurable: true,
                            enumerable: true
                        });

                        return termFilter;
                    })
                    .toArray();
            }

            return [];
        }

        function fetchResults(indexSource, queryTerms, filters) {
            var queryFilters            = null;
            var pagination              = null;

            searchViewModel.isSearching = false;

            if (indexSource.indexName === 'xml') {
                queryFilters = filtersOf(indexSource);
                pagination = searchViewModel.option.pagination;
            }
            else {
                if (filters) {
                    queryFilters = filters;
                }
            }

            return searchService
                    .search(indexSource, queryTerms, queryFilters, pagination)
                    .then(function(searchResults) {
                        if (searchResults && searchResults.hits.hits.length > 0) {
                            if (indexSource.indexName === INDEX_SOURCE.xml.indexName) {
                                return searchResults.hits.hits.map(function(xmlResult) {
                                    var patient  = (xmlResult._source.patient.bcr_patient_barcode.value).split('-')[2];
                                    var filter   = [{ 'term': { 'barcode.patient': patient } }];

                                    fetchResults(INDEX_SOURCE.maf, null, [filter])
                                        .then(function(mafResult) {
                                            if (mafResult && mafResult.length > 0) {
                                                xmlResult.platform_maf = mafResult[0]._source.archiveName.platform;
                                            }
                                        });

                                    return xmlResult;
                                });
                            }
                            else {
                                return searchResults.hits.hits;
                            }
                        }

                        return [];
                    })
                    .then(function(documents) {
                        var viewModelResults = searchViewModel.results[indexSource.indexName];

                        if (documents) {
                            // Set scope state
                            viewModelResults.documentCount = documents.length;
                            viewModelResults.documents = documents;
                            searchViewModel.option.grid[indexSource.indexName].data = documents;

                            // Update chart and pagination data
                            // updateChartData(result.aggregations.values.buckets);
                            if (indexSource.indexName === 'xml') {
                                updatePagination(documents);
                            }
                        }
                        else {
                            searchViewModel.noResults = true;
                        }

                        searchViewModel.isSearching = false;

                        return viewModelResults.documents;
                    });
        }

        searchViewModel.search();

        $scope.$watch('searchViewModel.option.pagination', function(newVal, oldVal) {
            if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                searchViewModel.search();
            }
        }, true);

        $scope.$watch('searchViewModel.option.filter', function(newVal, oldVal) {
            if (newVal !== oldVal) {
                searchViewModel.search();
            }
        }, true);
    }
})();
