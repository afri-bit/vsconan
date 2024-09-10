# Contributing to VSConan
We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features

## We Develop with Github
We use github to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html), So All Code Changes Happen Through Pull Requests
Pull requests are the best way to propose changes to the codebase (we use [Github Flow](https://guides.github.com/introduction/flow/index.html)). We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issues](https://github.com/afri-bit/vsconan/issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/afri-bit/vsconan/issues/new), it's that easy!

## Write bug reports with detail, background, and sample code
**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Coding Style
* 4 spaces for indentation rather than tabs
* Run `npm run lint` to confirm to our lint rules

## License
By contributing, you agree that your contributions will be licensed under its MIT License.

## References
This document was adapted from the open-source contribution guidelines for [Facebook's Draft]()

## Setup

This repository follows the standard layout of a VS Code extension.
More information can be found [here](https://code.visualstudio.com/api/get-started/extension-anatomy).

### Tests

In addition to the standard setup for VS Code extension development [./test/conan/readEnv.test.ts](./test/conan/readEnv.test.ts) requires a proper Conan 2 installation.
This can be achieved e.g. by using a Python virtual environment:

```sh
python -m venv .venv
. .venv/bin/activate
# or on Windows
# .venv/Scripts/activate
pip install "conan>=2"
```
