// Karma configuration
"use strict";

module.exports = function (config) {
    //noinspection JSFileReferences
    config.set({

        client: {
            captureConsole: true
        },

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine-jquery', 'jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js',
            'build/js/*.js',

            // served fixtures
            { pattern: 'test/fixtures/**/*.html', included: false, served: true },
            { pattern: 'test/data/**/*.json', included: false, served: true },

            'test/**/*.js'
        ],


        // list of files to exclude
        exclude: [
            'build/js/*.min.js',
            'build/js/door43-library-start.js'
        ],


        // pre-process matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'build/js/*.js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],

        customLaunchers: {
            Chrome_without_security: {
                base: 'Chrome',
                flags: ['--disable-web-security']
            }
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browsers should be started simultaneous
        concurrency: Infinity
    });
};
