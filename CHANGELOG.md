# Change Log

## 1.0.0 - Unreleased

### Breaking Changes

Following settings in `settings.json` are **OBSOLETE**
* `vsconan.general.pythonInterpreter`
* `vsconan.general.conanExecutable`
* `vsconan.general.conanExecutionMode`

Instead, you can define multiple profiles according to your need in the `settings.json`. See example below:

```json
"vsconan.conan.profile.configurations": {
  "myprofile_1": {
    "conanVersion": "1",
    "conanPythonInterpreter": "python",
    "conanExecutable": "conan",
    "conanExecutionMode": "pythonInterpreter",
  },
  "myprofile_2": {
    "conanVersion": "2",
    "conanPythonInterpreter": "/home/user/.venv/bin/conan",
    "conanExecutable": "/home/user/.venv/bin/conan",
    "conanExecutionMode": "conanExecutable",
    "conanUserHome": "/home/user/your/path/to/.conan2"
  }
},
"vsconan.conan.profile.default": "myprofile_2",
```

Using `vsconan.conan.profile.default` you can switch the profile easily, in case you have multiple conan setup or multiple python virtual environments with different conan versions. `conanUserHome` is optional parameter, in case you want to have a different location for `conan` home folder.

### Added
* Conan 2 - Browsing the recipe with UI
  * Delete recipe
  * Open in VSCode
  * Open in explorer
* Conan 2 - Browsing the packages with UI
  * Delete Package
  * Open in VSCode
  * Open in explorer
* Conan 2 - Browsing the package revisions with UI
  * Delete package revision
  * Open in VSCode
  * Open in explorer
* Conan 2 - Working with remotes with tree view
  * Same functionality as conan1
* Conan 2 - Working with profiles with Tree view
  * Same functionality as conan1
* Multiple profile definition for conan configuration in `settings.json`
* Easy switch between conan configuration profile using status bar
* Status bar view of selected conan configuration profile
* Added new treeview for package revision (Only meant for conan2)

### Changed
* New color palette for the VSConan logo :) Adapted the color according to the new official conan logo (roughly)

## 0.4.0 - 2022-09-11

### Added
* [#24](https://github.com/afri-bit/vsconan/issues/24) Open different folders under recipe folder
  * User has the possibility to access different folders that are located under the recipe folder itself, such as `build`, `dl`, `source`, etc.
  * User can open the folder either in the explorer or in a new VS Code window. The option to open the folders can be found by using right click on the recipe item from the explorer.
* [#17](https://github.com/afri-bit/vsconan/issues/17) Filter recipes based on a selected remote
* [#18](https://github.com/afri-bit/vsconan/issues/18) Filter binary packages based on a selected remote

## 0.3.0 - 2022-06-06

### Added
* [#16](https://github.com/afri-bit/vsconan/issues/16) Configuration in settings.json for `CONAN_USER_HOME`
  * Enable possibility to overwrite the pre defined `CONAN_USER_HOME` environment variable using `vsconan.general.conanUserHome` configuration option
  * User can set home directory to conan local cache within the VS Code using `settings.json` file

## 0.2.0 - 2022-05-30

### Added
* [#10](https://github.com/afri-bit/vsconan/issues/10) Enable option to list dirty packages from a recipe  
  * `vsconan.explorer.treeview.package.showDirtyPackage` is available to set the flag persistent
* [#14](https://github.com/afri-bit/vsconan/issues/14) Support non-pip conan installation  
  * Enable possibility for user to use the extension using alternative conan installation (e.g. conan executable)
  * Provide mode switch between python interpreter and conan executable (User can still use the python interpreter to execute conan CLI)
* Configuration for the extension in `settings.json`
  * `vsconan.general.conanExecutable`
  * `vsconan.general.conanExecutionMode`
  * `vsconan.general.pythonInterpreter`
* Right click option for recipe and package treeview item to copy its path
* [#13](https://github.com/afri-bit/vsconan/issues/13) Managing editable packages
  * List editable packages in the treeview
  * Remove editable package via Treeview
  * Open editable package in VS Code
  * Open editable package in Explorer
  * Copy editable path to clipboard
  * Remove editable package via command and quickpick (simple option)
  * Add editable package from the workspace
  * Enable layout file input for the editable package  
    **!!!** Currently only supporting the manual input from the user for the layout.


### Changed
* The configuration for extension is migrated to official VS Code `settings.json`. Custom global `config.json` under `~/.vsconan` is now **deprecated**.

### Removed
* `VSConan: Create Global Configuration (JSON)`  
  Command to create global configuration file in your home directory
* `VSConan: Open Global Configuration (JSON)`  
  Open the global configuration file in editor

## 0.1.0 - 2022-04-21
* Initial Release
* Conan Explorer
    * Conan Recipe
        * Recipe information
        * Open in explorer
        * Open in VS Code
        * Remove recipe
    * Conan Binary Packages
        * Open in explorer
        * Open in VS Code
        * Remove binary package
    * Conan Profile
        * Add new profile
        * Edit profile
        * Open in explorer
        * Rename profile
        * Duplicate profile
        * Remove profile
    * Conan Remote
        * Edit `remotes.json` file in VS Code
        * Rename remote
        * Update remote URL
        * Enable remote
        * Disable remote
        * Remove remote
* Conan Workspace
    * `conan create`
    * `conan install`
    * `conan build`
    * `conan source`
    * `conan package`
    * `conan export-pkg`
* Additional Support Features
    * Create global configuration file
    * Open global configuration file
    * Create workspace configuration file
    * Open workspace configuration file