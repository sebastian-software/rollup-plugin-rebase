# Rollup Relink <br/>![Downloads][npm-version-img] ![Downloads][npm-downloads-img] [![Build Status Unix][travis-img]][travis] [![Build Status Windows][appveyor-img]][appveyor] ![Dependencies][deps-img]

The Rollup Relink Plugin copies static assets as required from your JavaScript code to the destination folder and adjusts the references in there to point to the new location.

[deps-img]: https://david-dm.org/sebastian-software/rollup-plugin-relink.svg
[npm]: https://www.npmjs.com/package/rollup-plugin-relink
[npm-downloads-img]: https://img.shields.io/npm/dm/rollup-plugin-relink.svg
[npm-version-img]: https://img.shields.io/npm/v/rollup-plugin-relink.svg
[travis-img]: https://img.shields.io/travis/sebastian-software/rollup-plugin-relink/master.svg?branch=master&label=unix%20build
[appveyor-img]: https://img.shields.io/appveyor/ci/swernerx/rollup-plugin-relink/master.svg?label=windows%20build
[travis]: https://travis-ci.org/sebastian-software/rollup-plugin-relink
[appveyor]: https://ci.appveyor.com/project/swernerx/rollup-plugin-relink/branch/master


## Links

- [GitHub](https://github.com/sebastian-software/rollup-plugin-relink)
- [NPM](https://www.npmjs.com/package/rollup-plugin-relink)


## Installation

```console
$ npm install --save-dev rollup-plugin-relink
```


## Usage

Rollup Relink comes with a binary which can be called from within your `scripts` section
in the `package.json` file.

```js
import Relink from "rollup-plugin-relink"

const outputFolder = "./lib";
const relink = Relink(outputFolder)

rollup({
  entry: entry,
  ...
  external: fileMapper.isExternal,
  ...
  plugins: [
    ...
    fileMapper
  ]
}).then((bundle) =>
  bundle.write({
    ...
    dest: `${outputFolder}/index.js`
  })
)
```


## Contributing

* ⇄ Pull requests and ★ Stars are always welcome.
* For bugs and feature requests, please create an issue.
* Pull requests must be accompanied by passing automated tests (`$ npm test`).

## [License](license)


## Copyright

<img src="assets/sebastiansoftware.png" alt="Sebastian Software GmbH Logo" width="250" height="200"/>

Copyright 2016<br/>[Sebastian Software GmbH](http://www.sebastian-software.de)
