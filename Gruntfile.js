/*
 * grunt-require-gettext
 * https://github.com/open-xchange-frontend/grunt-require-gettext
 *
 * Copyright (c) 2014 Julian Bäume
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        watch: {
            options: {
                interrupt: true,
                spawn: true
            },
            all: {
                files: ['spec/**/*_spec.js', 'tasks/*.js', 'Gruntfile.js'],
                tasks: ['jshint', 'create_pot', 'mochaTest']
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'tasks/*.js'
            ],
            specs: {
                options: {
                    jshintrc: 'spec/.jshintrc'
                },
                src: ['spec/**/*_spec.js']
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        // Configuration to be run (and then tested).
        create_pot: {
            simple: {
                options: {
                    headers: {
                        'PO-Revision-Date': 'DATE',
                        'Last-Translator': 'NAME <EMAIL>',
                        'Language-Team': 'NAME <EMAIL>',
                        'MIME-Version': '1.0',
                        'Content-Type': 'text/plain; charset=UTF-8',
                        'Content-Transfer-Encoding': '8bit',
                        'Plural-Forms': 'nplurals=INTEGER; plural=EXPRESSION;'
                    }
                },
                files: {
                    'tmp/i18n/simple.pot': ['spec/fixtures/simpleModule.js']
                },
            }
        },

        // Unit tests.
        mochaTest: {
            tests: {
                src: 'spec/**/*_spec.js',
                options: {
                    reporter: 'spec'
                }
            }
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'create_pot', 'mochaTest']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};
