'use strict';

// Gulp and required dependencies
var gulp              = require('gulp'),
    $                 = require('gulp-load-plugins')(),
    sass              = require('gulp-sass'),
    ngHtml2Js         = require("gulp-ng-html2js"),
    browserSync       = require('browser-sync'),
    buildConfig       = require('./build.config'),
    del               = require('del'),
    lazypipe          = require('lazypipe'),
    mergeStream       = require('merge-stream'),
    path              = require('path'),
    router            = require('front-router'),
    runSequence       = require('run-sequence'),
    streamqueue       = require('streamqueue'),
    _                 = require('lodash'),
    wiredep           = require('wiredep').stream;

// Utilities
var log               = $.util.log,
    notify            = $.notify,
    reload            = browserSync.reload;

// Build configuration
var buildPath         = buildConfig.path,
    buildPlugins      = buildConfig.build.plugins,
    buildDependencies = buildConfig.dependencies;

// Uglify pipe
var uglifyScripts =
    lazypipe()
        .pipe(function() {
            return $.if(buildConfig.dist, $.uglify({
                        beautify: true,
                        compress: { sequences: false, join_vars: false },
                        mangle: false
                    }))
                    .on('error', notify.onError('Error: <%= error.message %>'));
        });

// Uglify styles
var uglifyStyles =
    lazypipe()
        .pipe(function() {
            return $.if(buildConfig.dist, $.csso())
                    .on('error', notify.onError('Error: <%= error.message %>'));
        });

// Help
gulp.task('help', $.taskListing);

// Analyze
gulp.task('analyze', function taskAnaylyze() {
    return gulp.src(path.join(buildPath.app.basedir, '**/*.js'))
            .pipe(reload({ stream: true, once: true }))
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish'));
});

// Clean
gulp.task('clean', function taskCleanBuild(callback) {
    clean(path.join(buildPath.build.output, '/*'), 'build', callback);
});

// Copy
gulp.task('copy', function taskCopy() {
    var source = [
        path.join(buildPath.source, '*.txt'),
        path.join(buildPath.source, '*.html'),
        '!' + path.join(buildPath.source, 'index.html')
    ];

    return gulp.src(source, { dot: true })
            .pipe(gulp.dest(buildPath.build.output))
            .pipe($.size({ title: 'copy' }));
});

// Styles
gulp.task('styles', function taskStyles() {
    var outputPath  = path.join(buildPath.build.output, 'styles');

    var injectFiles = gulp.src(buildDependencies.sass, { read: false });

    var options     = {
        inject: {
            transform: function(path) {
                path = path.replace(buildPath.app.basedir + '/', '');
                return '@import "' + path + '";';
            },
            starttag: '// injector',
            endtag: '// endinjector',
            addRootSlash: false
        },
        sass: {
            style: 'expanded'
        },
        wiredep: {
            exclude: [/bootstrap.js$/, /bootstrap-sass-official\/.*\.js/, /bootstrap\.css/],
            directory: 'bower_components'
        }
    };

    var scss   = gulp.src([path.join(buildPath.app.basedir, 'app.scss')])
                    .pipe($.inject(injectFiles, options.inject))
                    .pipe(wiredep(_.extend({}, options.wiredep)))
                    .pipe($.sourcemaps.init())
                    .pipe(sass(options.sass))
                        .on('error', notify.onError('Error: <%= error.message %>'))
                    .pipe($.autoprefixer(buildPlugins.autoprefixer.options.browsers))
                        .on('error', notify.onError('Error: <%= error.message %>'))
                    .pipe($.replace('../../bower_components/bootstrap-sass-official/assets/fonts/bootstrap/', '../fonts/'))
                    .pipe($.sourcemaps.write())
                    .pipe(gulp.dest(outputPath));

    var css    = gulp.src(buildDependencies.css)
                    .pipe($.concat('vendor.css'))
                    .pipe(gulp.dest(outputPath));

    var uiGrid = gulp.src(buildDependencies.uiGrid)
                    .pipe(gulp.dest(outputPath));

    return mergeStream(scss, css, uiGrid)
            .pipe($.size({ title: 'styles' }));
});

// Scripts : Vendor
gulp.task('scripts:vendor', function taskVendorScripts() {
    var source = buildDependencies.script;

    return gulp.src(source)
            .pipe($.concat('vendor.min.js'))
            .pipe(uglifyScripts())
            .pipe(gulp.dest(path.join(buildPath.build.output, 'scripts')))
            .pipe($.size({ title: 'vendor scripts' }));
});

// Scripts : Application
gulp.task('scripts:application', ['analyze'], function taskApplicationScripts() {
    var source = path.join(buildPath.app.basedir, '**/*.js');

    return gulp.src(source)
            .pipe($.sourcemaps.init())
            .pipe($.angularFilesort())
            .pipe($.concat('app.min.js'))
            .pipe($.ngAnnotate({ add: true, single_quotes: true }))
            .on('error', notify.onError('Error: <%= error.message %>'))
            .pipe(uglifyScripts())
            .pipe($.sourcemaps.write('.'))
            .pipe(gulp.dest(path.join(buildPath.build.output, 'scripts')))
            .pipe($.size({ title: 'application scripts' }));
});

// Scripts
gulp.task('scripts', function taskScripts(callback) {
    runSequence('scripts:vendor', 'scripts:application', callback);
});

// Angular $templateCache : Application
gulp.task('templateCache:application', function taskTemplateCacheApplication() {
    var templatecacheConfig = buildPlugins.angularTemplatecache.app;

    return gulp.src(templatecacheConfig.source)
            .pipe(ngHtml2Js(templatecacheConfig.options))
            .on('error', notify.onError('Error: <%= error.message %>'))
            .pipe($.concat(templatecacheConfig.templateFileName))
            .pipe(uglifyScripts())
            .pipe(gulp.dest(path.join(buildPath.build.output, 'scripts')))
            .pipe($.size({ title: 'application angular template cache' }));
});

// Angular $templateCache : Vendor
gulp.task('templateCache:vendor', function taskTemplateCacheVendor() {
    return gulp.src(buildDependencies.templateCache, { dot: true })
            .pipe(gulp.dest(path.join(buildPath.build.output, 'scripts')));
});

// Angular $templateCache
gulp.task('templateCache', ['templateCache:application', 'templateCache:vendor']);

// Fonts
gulp.task('fonts', function taskFonts() {
    return gulp.src(buildDependencies.fonts)
            .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
            .pipe($.flatten())
            .pipe(gulp.dest(path.join(buildPath.build.output, 'fonts')))
            .pipe($.size({ title: 'fonts' }));
});

// Images
gulp.task('images', function taskImages() {
    var outputPath = path.join(buildPath.build.output, 'images');

    return gulp.src(path.join(buildPath.content.images, '**'))
            .pipe($.cache($.imagemin({ progressive: true, interlaced: true })))
            .on('error', notify.onError('Error: <%= error.message %>'))
            .pipe(gulp.dest(outputPath))
            .pipe($.size({ title: 'images' }));
});

// Markup
gulp.task('markup', function taskMarkup() {
    var index  = path.join(buildPath.source, 'index.html');

    var source = [
        'styles/vendor.css',
        'styles/app.css',
        'scripts/**/*.js'
    ].map(function(entry) {
        return path.join(buildPath.build.output, entry);
    });

    var cssFilter    = $.filter('**/*.css');
    var scriptFilter = $.filter('**/*.js');

    return gulp.src(index)
            .pipe($.inject(gulp.src(source)
                .pipe(scriptFilter)
                .pipe($.angularFilesort())
                .pipe(scriptFilter.restore()), {
                    addRootSlash: false,
                    ignorePath: buildPath.build.output
                })
                .on('error', notify.onError('Error: <%= error.message %>')))
            .pipe(gulp.dest(buildPath.build.output))
            .pipe($.size({ title: 'markup' }));
});

// Serve
gulp.task('serve', function taskServe() {
    browserSync({
        notify: false,
        logPrefix: 'SERVE',
        port: buildPlugins.browserSync.options.port,
        server: buildPath.build.output
    });

    gulp.watch(path.join(buildPath.source, 'index.html'), ['markup', reload]);
    gulp.watch(path.join(buildPath.app.basedir, '**/*.html'), ['templateCache', reload]);
    gulp.watch(path.join(buildPath.app.basedir, '**/*.js'), ['scripts:application', reload]);
    gulp.watch(path.join(buildPath.content.styles, '**/*.{scss,css}'), ['styles', reload]);
    gulp.watch(path.join(buildPath.content.images, '**/*'), reload);
});

// Build
gulp.task('build', function taskBuild(callback) {
    runSequence('copy', ['styles', 'scripts', 'fonts', 'images'], 'templateCache', 'markup', callback);
});

// Default
gulp.task('default', function taskDefault(callback) {
    runSequence('clean', 'build', callback);
});

/**
 * Utility functions
 */
function clean(files, type, callback) {
    var logDeletedFilesPrefix = 'Deleted ' + ((type !== undefined) ? type : '') + ' file(s):\n';
    var logDeletedFiles = '';

    del(files, function cleanedFiles(error, deletedFiles) {
        if (error) {
            notify.onError('Error: <%= error.message %>');
        }
        else if (deletedFiles.length > 0) {
            deletedFiles.forEach(function buildLogMessage(deletedFile) {
                logDeletedFiles += ('\n\t' + deletedFile);
            });

            log($.util.colors.cyan(logDeletedFilesPrefix + logDeletedFiles + '\n'));
        }
    });

    if (typeof callback === 'function') {
        callback();
    }
}
