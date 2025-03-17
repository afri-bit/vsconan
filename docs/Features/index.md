# Features

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
* Filter list of recipe based on a remote
  
### Conan - Package

* Show list of binary packages from a recipe
* Open in Explorer
* Open in VS Code
* Remove package
* Dirty package  
    * Show list of dirty packages
    * Open in Explorer
* Filter list of binary packages that belong to a recipe based on a remote

### Conan - Package Revision

* Show list of binary packages revision from a package
* Open in Explorer
* Open in VS Code
* Remove package
* Filter list of binary packages that belong to a recipe based on a remote

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
* Automatic selection of Python interpreter using the ms-python.python extension
* Application of Conan's buildEnv/runEnv

## General

* Define multiple conan profiles inside `settings.json` that you can use for the extension.
  ```json
  {
    "vsconan.conan.profile.configurations": {
        "my_conan1": {
            "conanVersion": "1",
            "conanExecutable": ".venv1/Scripts/conan.exe",
            "conanPythonInterpreter": ".venv1/Scripts/python.exe",
            "conanExecutionMode": "pythonInterpreter"
        },
        "my_conan2": {
            "conanVersion": "2",
            "conanExecutable": ".venv2/Scripts/conan.exe",
            "conanPythonInterpreter": ".venv2/Scripts/python.exe",
            "conanExecutionMode": "pythonInterpreter",
            "conanUserHome": "/path/to/conan/home
        },
    },
    "vsconan.conan.profile.default": "my_conan1"
  }
  ```
* Overwrite conan home folder inside the profile with `conanUserHome`
* Status bar to ease the switching between your predefined profiles
* Status bar buttons for the following commands:  
    * `vsconan.conan.install`
    * `vsconan.conan.build`
    * `vsconan.conan.create`
    * `vsconan.conan.buildenv`
    * `vsconan.conan.runenv`
    * `vsconan.conan.deactivateenv`
