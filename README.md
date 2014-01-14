# grunt-require-gettext

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
_(Nothing yet)_
