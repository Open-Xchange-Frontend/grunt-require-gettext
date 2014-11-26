# grunt-require-gettext

[![Build Status](https://travis-ci.org/Open-Xchange-Frontend/grunt-require-gettext.svg?branch=develop)](https://travis-ci.org/Open-Xchange-Frontend/grunt-require-gettext)

> Grunt plugin to process js files and extract calls to gettext that is used with a requirejs gettext module.

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-require-gettext --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-require-gettext');
```

As a first example, this projects’s `Gruntfile.js` does contain some tasks, that will compile the test files from `spec/` directory.
Use these as a first start.

## The "compile_po" task

In your project's Gruntfile, add a section named `compile_po` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  options: {
    //Task-specific options go here
  },
  compile_po: {
    options: {
      // Target-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    }
  }
});
```

### Options

#### options.cacheDir
Type: `string`
Default value: `$(grunt-require-gettext path)/.cache/` (usually node_module/grunt-require-gettext/.cache)

Use `cacheDir` as the directory for reference cache used by compile_po task. Sometimes it's useful to write
the cache files somewhere else, for more easy access from the project using grunt-require-gettext to extract
strings. This directory contains pot file(s), that could be sent to translators to create the po files for
each supported language.

#### options.cacheFile
Type: `string`
Default value: `cache.pot`

Use `cacheFile` as the filename of the reference cache used by compile_po task. Sometimes it's useful to write
the cache files somewhere else, for more easy access from the project using grunt-require-gettext to extract
strings. This pot file could be sent to translators to create the po files for each supported language.

#### options.includeFuzzy
Type: `boolean`
Default value: `undefined`

Include messages flagged as fuzzy into the catalog. Default is not to include such messages, but sometimes they should not be
filtered. Use this option to include fuzzy messages.

#### options.template
Type: `String`
Default value: `null`

A path to a template file containing an underscore/lodash compatible template. If template is empty, the default template will be used:

```js
define("<%= module %>.<%= language %>", [], function () {
    return {
        "module": "<%= module %>",
        "language": "<%= language %>",
        "nplurals": <%= nplurals %>,
        "plural": "<%= plural %>",
        "dictionary": {
<% for (var msgid in dictionary) {%>
            "<%= msgid %>": "<%= dictionary[msgid] %>",
<% } %>
        }
    };
});
```

#### files format

Since the compile_po task will extract a module name from the reference comments of the translated string (it will be inserted there by
the create_pot task), there will most likely be more modules created, than po files as sources. Therefor the destination of the files
given _must_ be a directory. The task will fail if this is not the case.

## The "create_pot" task

### Overview

In your project's Gruntfile, add a section named `create_pot` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  create_pot: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.headers
Type: `Object`
Default value:
```js
{
  'Content-Type': 'text/plain; charset=UTF-8',
  'Content-Transfer-Encoding': '8bit'
}
```

Headers that should be added to the pot file.

### Usage Examples

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

### 0.6.1

- add detection for duplicate msgids
    - create_pot task will fail if duplicate is detected
    - primary key for items are msgctxt and msgid, nod msgid_plural
- integrate travis-ci automatic testing

### 0.6.0

- IMPORTANT: semantics of po filename changed
    - filename is primary source, language header is used as fallback
- updates of all (dev-)dependencies to latest versions

### 0.5.0

- IMPORTANT: if a string can not be extracted, task fails with a warning
- no duplicates in extracted comments any longer
- better handling of dynamic flag for extracted strings
- larger refactoring of the extraction code
- force to update pofile library to get latest bug-fixes in
- new reference cache for compile_po task
    -> no need to create_pot and msgmerge to update references in pofile

### 0.4.0

- add support for statically evaluable string arguments for gt calls
- gt calls that can not be evaluated will now fail the task with a warning
- add support for define.async extension of requirejs

### 0.3.9

- add support for i18n developer comments directly in front of gt call

### 0.3.8

- fix bug in compile_po not compiling the last po file in the file list

### 0.3.7

- fix minor issue with false negative warnings shown in some edge-cases
- fix a race-condition in compile_po task

### 0.3.6

- fix issues with ambiguous Language headers
- made development/release more easy by adding a few grunt goodies

### 0.3.5

- add fallback for missing Language header in pofile

### 0.3.4

- fix bug with completely untranslated modules not created at all (only the dictionary should be empty!)
- fix issue with gt.ngettext and variable as third argument
- hide warning about unknown module for filtered items

### 0.3.3

- fix crash when extracting from unused require gettext modules

### 0.3.2

- really fix the issue with peerDependency to grunt
- refactoring (less output during grunt compile_po --verbose)
    - po files with many fuzzy items should be handled faster
- add filter for obsolete messages (no option to override, yet)
    - force pofile dependency to 0.2.7, due to needed feature

### 0.3.1

- fix issue with peerDependency to grunt

### 0.3.0

- filter messages marked as fuzzy from dictionary in compile_po task
    - restore old behaviour with new includeFuzzy option

### 0.2.3

- filter untranslated strings from dictionary in compile_po task

### 0.2.2

- fix support for one message to be in multiple modules
- fix problem with ambiguous messages
    - use context, singular and plural of a message to determine a unique id

### 0.2.1

- add work-around for problems with references and msgmerge tool from gettext
    - fix should go upstream into pofile lib

### 0.2.0

- add support for advanced gettext usages
    - gt.pgettext
    - gt.ngettext
    - gt.npgettext
- add support for extracted comments
 

### 0.1.3

- fix major timing issue with multiple source files

### 0.1.2

- less verbose output in non-verbose mode
- watch task detects changes to _all_ files in spec dir
- some styling improvements
- fix issue with quotes in translated strings

### 0.1.1

- more verbose output on errors
- documentation fixes

### 0.1.0

- first working version with basically two tasks
    * create_pot - extract strings from all js files and create a po template (pot) from it
    * compile_po - convert translated po files into loadable require-js modules
