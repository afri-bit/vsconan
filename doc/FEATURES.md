# Features

## Table of Contents
- [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Explorer](#explorer)
    - [Conan - Recipe](#conan---recipe)
    - [Conan - Package](#conan---package)
    - [Conan - Profile](#conan---profile)
    - [Conan - Remote](#conan---remote)
  - [Workspace](#workspace)
  - [General](#general)

## Explorer
### Conan - Recipe
* Show list of conan recipe in local cache
* Show list of editable package recipes
* Show information about the recipe (also available for editable mode)
* Open recipe in explorer (also available for editable mode)
* Open recipe in VS Code (also available for editable mode)
* Remove
  * Remove recipe from local cache
  * Remove editable package recipe from editable mode
  
### Conan - Package
* Show list of binary packages from a recipe
* Open in Explorer
* Open in VS Code
* Remove package
* Dirty package
  * Show list of dirty packages
  * Open in Explorer

### Conan - Profile
* Add new profile
* Edit profile in VS Code editor
* Open in Explorer
* Rename profile
* Duplicate profile 
* Remove profile

### Conan - Remote
* Edit remote fils in VS Code editor
* Add new remote
* Rename remote
* Update URL of remote
* Enable / Disable remote
* Remove remote

## Workspace
* Execution of conan comand from workspace configuration:
  * create
  * install
  * build
  * source
  * package
  * export-pkg
* Add editable package
* Remove editable package

## General
* Option to overwrite the `CONAN_USER_HOME` environment variable within the VS Code using the setting `vsconan.general.conanUserHome` in `settings.json`. Possible input:
  * `null`  
    This is a default value of the configuration. If this is set, the predefined value for `CONAN_USER_HOME` will be used.
  * `string` - User defined path