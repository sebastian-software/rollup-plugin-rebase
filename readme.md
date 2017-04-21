# Rollup Rebase <br/>[![Sponsored by][sponsor-img]][sponsor] [![Version][npm-version-img]][npm] [![Downloads][npm-downloads-img]][npm] [![Build Status Unix][travis-img]][travis] [![Build Status Windows][appveyor-img]][appveyor] [![Dependencies][deps-img]][deps]

The Rollup Rebase Plugin copies static assets as required from your JavaScript code to the destination folder and adjusts the references in there to point to the new location.

The plugin is meant as a tool for preparing a library for being published. In this it differs from plugins like [Rollup URL Plugin](https://github.com/Swatinem/rollup-plugin-url) as it is designed for usage in *libraries* and not for *applications*. The output of this plugin can be used by tools like Webpacks [File Loader](https://github.com/webpack/file-loader), [URL Loader](https://github.com/webpack/url-loader) or the already mentioned [Rollup URL Plugin](https://github.com/Swatinem/rollup-plugin-url).

[sponsor-img]: https://img.shields.io/badge/Sponsored%20by-Sebastian%20Software-692446.svg
[sponsor]: https://www.sebastian-software.de
[deps]: https://david-dm.org/sebastian-software/rollup-plugin-rebase
[deps-img]: https://david-dm.org/sebastian-software/rollup-plugin-rebase.svg
[npm]: https://www.npmjs.com/package/rollup-plugin-rebase
[npm-downloads-img]: https://img.shields.io/npm/dm/rollup-plugin-rebase.svg
[npm-version-img]: https://img.shields.io/npm/v/rollup-plugin-rebase.svg
[travis-img]: https://img.shields.io/travis/sebastian-software/rollup-plugin-rebase/master.svg?branch=master&label=unix%20build
[appveyor-img]: https://img.shields.io/appveyor/ci/swernerx/rollup-plugin-rebase/master.svg?label=windows%20build
[travis]: https://travis-ci.org/sebastian-software/rollup-plugin-rebase
[appveyor]: https://ci.appveyor.com/project/swernerx/rollup-plugin-rebase/branch/master

## Features

- Copies over asset files references from JavaScript into the given output folder.
- Adjust asset references in the output JavaScript files to map to the relative new location.
- Transforms CSS files to inline all includes from `@import` via [PostCSS Smart Import](https://github.com/sebastian-software/postcss-smart-import) into the origin files.
- Renames all assets based on their hash (SHA256 + Base62) so that conflicts are automatically eliminated while producing a flat zero depth output structure.
- Supports *normal* CSS, but also [SugarSS](https://github.com/postcss/sugarss), [SCSS](https://github.com/postcss/postcss-scss) and [Sass](https://github.com/aleshaoleg/postcss-sass) via the standard PostCSS parser plugins.
- Processes all files which do not match this extension list: `.jsx`, `.js`, `.tsx`, `.ts`, `.json`, `.vue`.


## Installation

```console
$ npm install --save-dev rollup-plugin-rebase
```

or 

```console
$ yarn add --dev rollup-plugin-rebase
```


## Usage

Rollup rebase comes with a binary which can be called from within your `scripts` section
in the `package.json` file.

```js
import rebasePlugin from "rollup-plugin-rebase"

const outputFolder = "./lib";
const rebase = rebasePlugin({ outputFolder })

rollup({
  entry: entry,
  ...
  external: rebase.isExternal,
  ...
  plugins: [
    ...
    rebase
  ]
})
.then((bundle) =>
  bundle.write({
    ...
    dest: `${outputFolder}/index.js`
  })
)
```



## Copyright

<img src="assets/sebastiansoftware.png" alt="Sebastian Software GmbH Logo" width="250" height="200"/>

Copyright 2016-2017<br/>[Sebastian Software GmbH](http://www.sebastian-software.de)
