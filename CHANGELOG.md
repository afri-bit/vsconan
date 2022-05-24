# Change Log

## Unreleased

### Added
- [#10](https://github.com/afri-bit/vsconan/issues/10) Enable option to list dirty packages from a recipe
- [#14](https://github.com/afri-bit/vsconan/issues/14) Support non-pip conan installation  
  - Enable possibility for user to use the extension using alternative conan installation (e.g. conan executable)
  - Provide mode switch between python interpreter and conan executable (User can still use the python interpreter to execute command CLI)

## [0.1.0]
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