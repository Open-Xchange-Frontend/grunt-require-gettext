# grunt-require-gettext

[![Build Status](https://travis-ci.org/Open-Xchange-Frontend/grunt-require-gettext.svg?branch=develop)](https://travis-ci.org/Open-Xchange-Frontend/grunt-require-gettext)

> Grunt plugin to process js files and extract calls to gettext that is used with a requirejs gettext module.

## Getting Started
This plugin requires Grunt `>=0.4.0`

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

#### options.location
Type: `String`
Default value: `'full'`

One of the standard Gettext options for `--add-location`: `'full'`, `'file'` or `'none'`. Full includes line numbers, file includes only file names and none omits the location entirely.

Note: `module` is always added and is not influenced by this option.

### Usage Examples

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

see [ChangeLog.md](ChangeLog.md)

