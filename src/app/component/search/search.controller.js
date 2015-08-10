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
        searchViewModel.resultsPage  = 0;
        searchViewModel.searchText   = '';
        searchViewModel.selectedItem = null;

        // ====================
        // Result state
        // ====================
        searchViewModel.results = {
            searchText: '',
            xml: {
                documentCount: 0,
                documents: []
            }
        };

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
                pageSizes: [25, 50, 100, 200],
                pageSize: 25,
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
        // Grid
        // ====================
        searchViewModel.grid = {
            xml: {
                data: searchViewModel.results.xml.documents,
                columnDefs: [
                    { name: 'UUID',                 field: 'patientUuid' },
                    { name: 'Barcode',              field: 'patientBarcode' },
                    { name: 'Age at Diagnosis',     field: 'ageAtDiagnosis' },
                    { name: 'Gender',               field: 'gender' },
                    { name: 'Race',                 field: 'race' },
                    { name: 'Disease',              field: 'disease' },
                    { name: 'Platform (Clinical)',  field: 'platformXml' },
                    { name: 'Platform (Molecular)', field: 'platformMaf' }
                ],
                enableSorting: true,
                paginationPageSizes: searchViewModel.option.pagination.pageSizes,
                paginationPageSize: searchViewModel.option.pagination.pageSize,
                showColumnFooter: true,
                showGridFooter: true
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
            resetResults(searchViewModel.results.xml);

            searchViewModel.results.searchText = searchViewModel.searchText;

            return fetchXmlWith(searchViewModel, INDEX_SOURCE.xml)
                    .then(function(documents) {
                        return fetchMafMetadataWith(documents, INDEX_SOURCE.maf);
                    })
                    .then(function(results) {
                        var documents =
                            results.map(function(result) {
                                var document = result.document;

                                if (result.metadata) {
                                    document.platformMaf = result.metadata.archiveName.platform;
                                }

                                return document;
                            });

                        return updateResults(searchViewModel, documents);
                    })
                    .catch(function (error) {
                        log.error(error);
                    });
        };

        searchViewModel.reset = function() {
            resetFilters(searchViewModel);

            searchViewModel.search();
        };

        function resetFilters(viewModel) {
            var viewModelFilters = viewModel.option.filter;

            Lazy(Object.keys(viewModelFilters))
                .each(function(filter) {
                    viewModelFilters[filter].value = '';
                });
        }


        function resetResults(viewModelResults) {
            viewModelResults.documentCount    = 0;
            viewModelResults.documents.length = 0;
        }

        function fetchXmlWith(viewModel, indexSource) {
            var criteria = {
                indexSource: indexSource,
                searchTerms: viewModel.searchText,
                filters:     filtersOf(viewModel, indexSource),
                pagination:  viewModel.option.pagination
            };

            return searchService
                    .search(criteria)
                    .then(parseXmlDocuments);
        }

        function parseXmlDocuments(searchResults) {
            var documents = [];

            if (searchResults && searchResults.hits.hits.length > 0) {
                searchResults.hits.hits.forEach(function (result) {
                    var source   = result._source;
                    var document = {
                        patientUuid:    valueOf(source.patient.bcr_patient_uuid),
                        patientBarcode: valueOf(source.patient.bcr_patient_barcode),
                        ageAtDiagnosis: valueOf(source.patient.age_at_initial_pathologic_diagnosis),
                        gender:         valueOf(source.patient.gender),
                        race:           valueOf(source.patient.race),
                        disease:        source.archiveName.disease,
                        platformXml:    source.archiveName.platform
                    };

                    documents.push(document);
                });
            }

            function valueOf(field) {
                if (typeof field !== 'undefined') {
                    return field.value;
                }

                return undefined;
            }

            return documents;
        }

        function updateResults(viewModel, documents) {
            // Set view model scope state
            viewModel.results.xml.documentCount = documents.length;
            viewModel.results.xml.documents     = documents;
            viewModel.grid.xml.data             = documents;

            // Update chart and pagination data
            // updateChartData(result.aggregations.values.buckets);
            updatePagination(documents);

            return documents;
        }

        function fetchMafMetadataWith(documents, indexSource) {
            if (documents && documents.length > 0) {
                var requests =
                    documents.map(function(document) {
                        var criteria = {
                            indexSource: indexSource,
                            filters: [[{ 'term': { 'barcode.patient': document.patientBarcode.split('-')[2] } }]]
                        };

                        return searchService
                                .search(criteria)
                                .then(function(result) {
                                    var resultDocument = {
                                        document: document
                                    };

                                    if (result.hits.total > 0) {
                                        resultDocument.metadata = result.hits.hits[0]._source;
                                    }

                                    return resultDocument;
                                });
                    });

                return $q.all(requests);
            }
            else {
                return $q.resolve;
            }
        }

        function updatePagination(data) {
            if (data) {
                var page      = searchViewModel.option.pagination.currentPage;
                var pageSize  = searchViewModel.option.pagination.pageSize;
                var pagedData = data.slice((page - 1) * pageSize, page * pageSize);

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

        function filtersOf(viewModel, indexSource) {
            if (indexSource.indexName === INDEX_SOURCE.xml.indexName) {
                var viewModelFilters = viewModel.option.filter;

                return Lazy(Object.keys(viewModelFilters))
                    .filter(function(filter, index) {
                        return (viewModelFilters[filter].value.length > 0 && viewModelFilters[filter].value !== 'All');
                    })
                    .map(function(filter, index) {
                        var termFilter = {
                            term: {}
                        };

                        Object.defineProperty(termFilter.term, viewModelFilters[filter].name, {
                            value: viewModelFilters[filter].value.toUpperCase(),
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
