## Release History

### 0.6.2

- allow empty po files (no strings defined)
    - will create modules for completely empty po files that contains no strings
    - dictionary of the modules will be empty but files will at least exist
- fix problem with trailing white-space not being extracted

### 0.6.1

- add detection for duplicate msgids
    - create_pot task will fail if duplicate is detected
    - primary key for items are msgctxt and msgid, not msgid_plural
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
