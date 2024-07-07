# Change Log

## 1.1.0 - 2024-07-07

### Added

* [#38](https://github.com/afri-bit/vsconan/issues/38) Support whitespace for project and configuration path  
  You can now use whitespace in your configuration file and *VSConan* can still parse the path and use it for executing conan command.
  > Additional to this feature, internal the command builder is changed to separate the command and arguments. For further detail of the issue please refer to [#38](https://github.com/afri-bit/vsconan/issues/38).  
  *This change should not affect the current configuration file.*
  
  Thanks to [torsknod-the-caridian](https://github.com/torsknod-the-caridian).

## 1.0.1 - 2024-02-04

### Changed

* [#35](https://github.com/afri-bit/vsconan/issues/35) Extension cannot be activated after installation  
  Due to missing dependencies or unability to find the dependencies, the extension cannot be started. So I replaced the small function that I used from this dependency with internal utility function.
  > Midnight programming mistake :P


## 1.0.0 - 2024-02-03

### Breaking Changes

* Following settings in `settings.json` are **OBSOLETE**
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

* The workspace configuration to execute conan command, such as `build`, `install`, etc., is slightly changed, but it has a big impact to your workflow / usage of this configuration. 
  > The `python` attribute is no longer available!

  Instead of using hard coded `python` path inside this json file, it will rely on the selected conan configuration profile. So with this change, you can use the same json file but using in the different conan version (Easy switch between conan 1 and 2).

  ```json
  {
    "commandContainer": {
        "create": [
            {
                "name": "create",
                "description": "Create command",
                "detail": "Create command detail",
                "conanRecipe": "conanfile.py",
                "profile": "default",
                "user": "",
                "channel": "",
                "args": []
            }
        ],
        "install": [
            {
                "name": "install",
                "description": "Install command",
                "detail": "Install command detail",
                "conanRecipe": "conanfile.py",
                "installFolder": "install",
                "profile": "default",
                "user": "",
                "channel": "",
                "args": []
            }
        ],
        .
        .
        .
        .
    }
  }
  ```

  Due to the fact that there are some differences in the commands between conan 1 and 2, some attributes are added to some commands, that might not be used in one conan version or the other.
  Following example might give you clarity.

  * Conan 1 - `conan source`
    ```shell
    optional arguments:
      -h, --help
      -sf SOURCE_FOLDER, --source-folder SOURCE_FOLDER
      -if INSTALL_FOLDER, --install-folder INSTALL_FOLDER
    ```

  * Conan 2 - `conan source`
    ```shell
    optional arguments:
      --name NAME
      --version VERSION
      --user USER
      --channel CHANNEL
    ```

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