# Rollup Rebase <br/>[![Sponsored by][sponsor-img]][sponsor] [![Version][npm-version-img]][npm] [![Downloads][npm-downloads-img]][npm] [![Build Status Unix][travis-img]][travis] [![Build Status Windows][appveyor-img]][appveyor] [![Dependencies][deps-img]][deps]

<a target='_blank' rel='nofollow' href='https://app.codesponsor.io/link/Nehv39FW5U4NHEn7axuGx4CE/sebastian-software/rollup-plugin-rebase'>  <img alt='Sponsor' width='888' height='68' src='https://app.codesponsor.io/embed/Nehv39FW5U4NHEn7axuGx4CE/sebastian-software/rollup-plugin-rebase.svg' /></a>

The Rollup Rebase Plugin copies static assets as required from your JavaScript code to the destination folder and adjusts the references in there to point to the new location.


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
- Transforms CSS files to inline all includes from `@import` via [PostCSS Import](https://github.com/postcss/postcss-import) into the origin files.
- Detects and processes assets referenced from both, JavaScript and CSS.
- Renames all assets based on their hash (XXHash + Base62) so that conflicts are automatically eliminated while producing a flat output structure.
- Supports *normal* CSS, but also [SugarSS](https://github.com/postcss/sugarss), [SCSS](https://github.com/postcss/postcss-scss) and [Sass](https://github.com/aleshaoleg/postcss-sass) via the standard PostCSS parser plugins.



## Comparison

The plugin is meant as a tool for preparing a library for being published. In this it differs from plugins like [Rollup URL Plugin](https://github.com/Swatinem/rollup-plugin-url) as it is designed for usage in *libraries* and not for *applications*. The output of this plugin can be used by tools like Webpacks [File Loader](https://github.com/webpack/file-loader), [URL Loader](https://github.com/webpack/url-loader) or the already mentioned [Rollup URL Plugin](https://github.com/Swatinem/rollup-plugin-url).



## Installation

```console
$ npm install --save-dev rollup-plugin-rebase
```

or

```console
$ yarn add --dev rollup-plugin-rebase
```


## Usage

You can configure Rollup Rebase as part of your Rollup configuration. This can be either done in a `rollup.config.js` or by scripting the whole thing by using the Rollup API:

```js
import { rollup } from "rollup"
import rebasePlugin from "rollup-plugin-rebase"

const input = "./src/index.js"
const outputFolder = "./lib";
const rebase = rebasePlugin({ outputFolder, input })

rollup({
  input: input,
  external: rebase.isExternal,
  plugins: [
    rebase
  ]
})
.then((bundle) =>
  bundle.write({
    dest: `${outputFolder}/index.js`
  })
)
```

### Options
* input (required): The location of your entry point for rollup
* outputFolder (required): The location that assets will be written to
* prependName: If true, generated filenames will be ORIGINALFILENAME_HASH instead of just HASH
* verbose: If true, increases log level
* include: Standard include option for rollup plugins. Supports a minimatch string.
* exlude: Standard exclude option for rollup plugins. Supports a minimatch string.


## Copyright

<img src="assets/sebastiansoftware.png" alt="Sebastian Software GmbH Logo" width="250" height="200"/>

Copyright 2016-2017<br/>[Sebastian Software GmbH](http://www.sebastian-software.de)
