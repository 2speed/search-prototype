(function() {
    'use strict';

    angular
        .module('dataApp.shared.route')
        .provider('routeHandlerConfiguration', routeHandlerConfigurationProvider)
        .factory('routeHandler', routeHandlerFactory);

    /* @ngInject */
    function routeHandlerConfigurationProvider() {
        /* jshint validthis:true */
        this.config = {
            title: '',
            $routeProvider: undefined,
            resolveAlways: undefined
        };

        this.configure = function(config) {
            this.config.title          = config.title;
            this.config.$routeProvider = config.routeProvider;
            this.config.resolveAlways  = config.resolveAlways;
        };

        this.$get = function() {
            return {
                config: this.config
            };
        };
    }

    /* @ngInject */
    function routeHandlerFactory($location, $rootScope, $route, routeHandlerConfiguration, LOG) {
        var handleRouteChangeError = false;
        var routes = [];
        var $routeProvider = routeHandlerConfiguration.config.$routeProvider;
        var routeCounts = {
            errors: 0,
            changes: 0
        };
        var service = {
            configureRoutes: configureRoutes,
            getRoutes: getRoutes,
            routeCounts: routeCounts
        };

        init();

        return service;

        function configureRoutes(routes) {
            routes.forEach(function(route) {
                route.config.resolve =
                    angular.extend(route.config.resolve || {}, routeHandlerConfiguration.config.resolveAlways);

                $routeProvider.when(route.url, route.config);
            });

            $routeProvider.otherwise({ redirectTo: '/' });
        }

        function getRoutes() {
            for (var value in $route.routes) {
                if ($route.routes.hasOwnProperty(value)) {
                    var route = $route.routes[value];
                    var isRoute = !!route.title;

                    if (isRoute) {
                        routes.push(route);
                    }
                }
            }

            return routes;
        }

        function handleRouteErrors() {
            $rootScope.$on('$routeChangeError',
                function(event, current, previous, rejection) {
                    if (handleRouteChangeError) {
                        return;
                    }

                    routeCounts.errors++;
                    handleRouteChangeError = true;

                    var destination =
                        (current && (current.title || current.name || current.loadedTemplateUrl)) || 'unknown target';
                    var message = 'Error routing to ' + destination + '. ' + (rejection.msg || '');

                    LOG.warning(message, [current]);
                    $location.path('/');
                }
            );
        }

        function updateDocumentTitle() {
            $rootScope.$on('$routeChangeSuccess',
                function(event, current, previous) {
                    routeCounts.changes++;
                    handleRouteChangeError = false;

                    var title = routeHandlerConfiguration.config.docTitle + ' ' + (current.title || '');

                    $rootScope.title = title;
                }
            );
        }

        function init() {
            handleRouteErrors();
            updateDocumentTitle();
        }
    }
})();
