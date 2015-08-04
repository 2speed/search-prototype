/* global toastr:false, moment:false */
(function() {
    'use strict';

    angular
        .module('dataApp.component.search')
        .constant('INDEX_SOURCE', {
            maf: {
                indexName: 'maf',
                indexType: 'metadata',
                searchType: 'dfs_query_then_fetch',
                scroll: '10m',
                termAggregationField: 'Hugo_Symbol',
                suggestField: 'suggest_completion',
                queryOf: function(query) {
                    return { 'query':{ 'has_child': { 'type': 'content', 'query': query } } };
                }
            },
            xml: {
                indexName: 'xml',
                indexType: 'content',
                searchType: 'dfs_query_then_fetch',
                scroll: '10m',
                termAggregationField: 'patient.gender.value',
                suggestField: 'suggest_completion',
                queryOf: function(query) {
                    return { 'query': query };
                }
            }
        })
        .constant('SELECTION', {
            disease: [
                'All', 'ACC', 'BLCA', 'BRCA', 'COAD', 'GBM', 'HNSC', 'KICH', 'KIRC',
                'KIRP', 'LAML', 'LGG', 'LUAD', 'LUSC', 'OV', 'READ', 'SKCM', 'STAD', 'THCA',
                'UCEC'
            ],
            gender: [
                'All',
                'Female',
                'Male'
            ],
            race: [
                'All',
                'Not Reported',
                'White',
                'American Indian or Alaska Native',
                'Black or African American',
                'Asian',
                'Natice Hawaiian or Other Pacific Islander'
            ]
        });
})();
