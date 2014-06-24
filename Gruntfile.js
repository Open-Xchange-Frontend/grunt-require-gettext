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
            gruntfile: {
                options: {
                    reload: true
                },
                files: ['Gruntfile.js'],
                tasks: ['clean', 'jshint', 'create_pot', 'compile_po', 'mochaTest']
            },
            all: {
                files: ['spec/**/*.*', 'lib/*.js', 'tasks/*.js'],
                tasks: ['clean', 'jshint', 'create_pot', 'compile_po', 'mochaTest']
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'lib/*.js',
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
            tests: ['tmp/', '.cache/']
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
                    'tmp/i18n/simple.pot': [
                        'spec/fixtures/simpleModule.js',
                        'spec/fixtures/defineAsync.js',
                        'spec/fixtures/fuzzyModule.js',
                        'spec/fixtures/veryNewModule.js'
                    ]
                }
            },
            no_headers: {
                files: {
                    'tmp/i18n/simple_no_headers.pot': ['spec/fixtures/simpleModule.js']
                }
            }
        },

        compile_po: {
            simple: {
                files: [{
                    src: ['spec/fixtures/**/*.po'],
                    dest: 'tmp/build/i18n/'
                }]
            },
            fuzzy: {
                options: {
                    template: 'spec/fixtures/templates/custom.tpl',
                    includeFuzzy: true
                },
                files: [{
                    src: ['spec/fixtures/**/*.po'],
                    dest: 'tmp/build/i18n/includeFuzzy/'
                }]
            },
            custom_template: {
                options: {
                    template: 'spec/fixtures/templates/custom.tpl'
                },
                files: [{
                    src: ['spec/fixtures/**/*.po'],
                    dest: 'tmp/build/i18n/custom/'
                }]
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
        },

        // More easy release management
        bump: {
            options: {
                files: ['package.json'],
                commit: false,
                createTag: false,
                push: false
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
    grunt.loadNpmTasks('grunt-bump');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'create_pot', 'compile_po', 'mochaTest']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};
