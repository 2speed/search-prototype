'use strict';

var argv    = require('yargs').argv,
    path    = require('path'),
    resolve = path.join;

module.exports = (function BuildConfig() {
    var PROJECT_NAME            = require('./package.json').name;

    var PATH_BASEDIR            = './',
        PATH_SOURCE             = resolve(PATH_BASEDIR, 'src'),
        PATH_TEST               = resolve(PATH_BASEDIR, 'test'),
        PATH_BUILD_OUTPUT       = resolve(PATH_BASEDIR, 'build'),
        PATH_BUILD_DISTRIBUTION = resolve(PATH_BASEDIR, 'dist'),
        PATH_APP                = resolve(PATH_SOURCE, 'app'),
        PATH_CONTENT            = resolve(PATH_SOURCE, 'content'),
        PATH_BOWER              = resolve(PATH_BASEDIR, 'bower_components'),
        PATH_NODE               = resolve(PATH_BASEDIR, 'node_modules');

    var CONFIG_PATH = {
        app: {
            basedir: PATH_APP,
            shared: resolve(PATH_APP, 'shared'),
            component: resolve(PATH_APP, 'component')
        },
        basedir: PATH_BASEDIR,
        bower: PATH_BOWER,
        build: {
            output: PATH_BUILD_OUTPUT,
            distribution: PATH_BUILD_DISTRIBUTION
        },
        content: {
            basedir: PATH_CONTENT,
            styles: resolve(PATH_CONTENT, 'styles'),
            fonts: resolve(PATH_CONTENT, 'fonts'),
            images: resolve(PATH_CONTENT, 'images'),
        },
        node: PATH_NODE,
        source: PATH_SOURCE,
        test: PATH_TEST
    };

    var CONFIG_PLUGINS = {
        angularTemplatecache: {
            app: {
                source: join(PATH_APP, '**/*.html'),
                templateFileName: 'app.tpls.js',
                options: {
                    moduleName: PROJECT_NAME + '.component',
                    declareModule: false
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 2 versions', 'ie 10']
            }
        },
        browserSync: {
            options: {
                host: 'localhost',
                port: 9000
            }
        }
    };

    // Dependencies : CSS
    var CONFIG_DEPENDENCIES_CSS =
        join(PATH_BOWER, [
            'toastr/toastr.css',
            'animate.css/animate.css',
            'font-awesome/css/font-awesome.css',
            'angular-ui-grid/ui-grid.css',
            'dcjs/dc.css'
        ]);

    // Dependencies : FONTS
    var CONFIG_DEPENDENCIES_FONTS = [
        path.join(PATH_CONTENT, 'fonts/**'),
        path.join(PATH_BOWER, 'bootstrap-sass-official/assets/fonts/bootstrap/**'),
        path.join(PATH_BOWER, 'angular-ui-grid/**')
    ];

    // Dependencies : SASS
    var CONFIG_DEPENDENCIES_SASS = [
        path.join(PATH_APP, '**/*.scss'),
        path.join('!' + PATH_APP, 'app.scss')
    ];

    // Dependencies : Script
    var CONFIG_DEPENDENCIES_SCRIPT =
        join(PATH_BOWER, [
            'jquery/dist/jquery.js',
            'angular/angular.js',
            'json3/lib/json3.js',
            'es5-shim/es5-shim.js',
            'bluebird/js/browser/bluebird.js',
            'lodash/dist/lodash.js',
            'angular-animate/angular-animate.js',
            'angular-cookies/angular-cookies.js',
            'angular-resource/angular-resource.js',
            'angular-route/angular-route.js',
            'angular-sanitize/angular-sanitize.js',
            'angular-touch/angular-touch.js',
            'angular-bindonce/bindonce.js',
            'angular-bootstrap/ui-bootstrap.js',
            'angular-ui-grid/ui-grid.js',
            'extras.angular.plus/ngplus-overlay.js',
            'toastr/toastr.js',
            'moment/moment.js',
            'elasticsearch/elasticsearch.angular.js',
            'd3/d3.js',
            'crossfilter/crossfilter.js',
            'dcjs/dc.js',
            'angular-dc/dist/angular-dc.js',
            'lazy.js/lazy.js'
        ]);

    // Dependencies : UI Grid
    var CONFIG_DEPENDENCIES_UI_GRID =
        join(PATH_BOWER, [
            'angular-ui-grid/ui-grid.eot',
            'angular-ui-grid/ui-grid.woff'
        ]);

    // Dependencies : Script : Exclude
    var CONFIG_DEPENDENCIES_SCRIPT_EXCLUDE = []

    // Dependencies : Angular $templateCache
    var CONFIG_DEPENDENCIES_TEMPLATE_CACHE =
        path.join(PATH_BOWER, 'angular-bootstrap/ui-bootstrap-tpls.js');

    return {
        project: {
            name: PROJECT_NAME
        },
        path: CONFIG_PATH,
        build: {
            plugins: CONFIG_PLUGINS,
            sass: { },
            starttag: '// injector',
            endtag: '// endinjector',
            addRootSlash: false
        },
        dependencies: {
            css: CONFIG_DEPENDENCIES_CSS,
            fonts: CONFIG_DEPENDENCIES_FONTS,
            sass: CONFIG_DEPENDENCIES_SASS,
            script: CONFIG_DEPENDENCIES_SCRIPT.concat(CONFIG_DEPENDENCIES_SCRIPT_EXCLUDE),
            templateCache: CONFIG_DEPENDENCIES_TEMPLATE_CACHE,
            uiGrid: CONFIG_DEPENDENCIES_UI_GRID
        },
        dist: !!(argv.dist)
    };

    function join(prefix, components) {
        var prefixed = [];

        if (!prefix) {
            throw new Error('Missing component prefix');
        }

        if (!components) {
            throw new Error('No components specified');
        }

        if (Array.isArray(components)) {
            prefixed = components;
        }
        else if (typeof components === 'string') {
            prefixed = components.split();
        }
        else {
            throw new Error('Components cannot be resolved to an array');
        }

        return prefixed.map(function(component) {
            return resolve(prefix, component);
        });
    }
})();
