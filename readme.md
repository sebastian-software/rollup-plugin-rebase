# Rollup Rebase <br/>[![Sponsored by][sponsor-img]][sponsor] [![Version][npm-version-img]][npm] [![Downloads][npm-downloads-img]][npm] [![Build Status][github-img]][github]

The Rollup Rebase Plugin copies static assets as required from your JavaScript code to the destination folder and adjusts the references in there to point to the new location. It also respects assets referenced from your CSS/SCSS files.

[sponsor]: https://www.sebastian-software.de
[npm]: https://www.npmjs.com/package/rollup-plugin-rebase
[sponsor-img]: https://badgen.net/badge/Sponsored%20by/Sebastian%20Software/692446
[npm-downloads-img]: https://badgen.net/npm/dm/rollup-plugin-rebase
[npm-version-img]: https://badgen.net/npm/v/rollup-plugin-rebase
[github]: https://github.com/sebastian-software/rollup-plugin-rebase/actions
[github-img]: https://badgen.net/github/status/sebastian-software/rollup-plugin-rebase?label=tests&icon=github

## Features

- Copies over asset files references from JavaScript into the given output folder.
- Adjust asset references in the output JavaScript files to map to the relative new location.
- Transforms CSS files to inline all includes from `@import` via [PostCSS Import](https://github.com/postcss/postcss-import) into the origin files.
- Detects and processes assets referenced from both, JavaScript and CSS.
- Renames all assets based on their hash (XXHash + Base62) so that conflicts are automatically eliminated while producing a flat output structure.
- Supports _normal_ CSS, but also [SugarSS](https://github.com/postcss/sugarss), [SCSS](https://github.com/postcss/postcss-scss) and [Sass](https://github.com/aleshaoleg/postcss-sass) via the standard PostCSS parser plugins.

## Comparison

The plugin is meant as a tool for preparing a library for being published. In this it differs from plugins like [Rollup URL Plugin](https://github.com/Swatinem/rollup-plugin-url) as it is designed for usage in _libraries_ and not for _applications_. The output of this plugin can be used by tools like Webpacks [File Loader](https://github.com/webpack/file-loader), [URL Loader](https://github.com/webpack/url-loader) or the already mentioned [Rollup URL Plugin](https://github.com/Swatinem/rollup-plugin-url).

## Installation

```console
$ npm install --save-dev rollup-plugin-rebase
```

or

```console
$ yarn add --dev rollup-plugin-rebase
```

## Usage

You can configure Rollup Rebase as part of your Rollup configuration. This can be either done in a `rollup.config.js` or by scripting using the Rollup API:

```js
import { rollup } from "rollup"
import rebasePlugin from "rollup-plugin-rebase"

async function config() {
  const bundle = await rollup({
    input: "./src/index.js",
    plugins: [rebasePlugin()]
  })

  await bundle.write({
    dest: "./lib/index.js"
  })
}

config()
```

### Options (all optional)

- `assetFolder`: When set assets are placed inside a sub folder with that name.
- `keepName`: If `true`, generated filenames will be `${filename}~${hash}.${ext}` instead of just `${hash}.${ext}`
- `skipHash`: If `true`, filenames will not include hash and will keep names
- `verbose`: If `true`, increases log level
- `include`: Standard include option for rollup plugins.
- `exclude`: Standard exclude option for rollup plugins.

## Copyright

<img src="https://cdn.rawgit.com/sebastian-software/sebastian-software-brand/0d4ec9d6/sebastiansoftware-en.svg" alt="Logo of Sebastian Software GmbH, Mainz, Germany" width="460" height="160"/>

Copyright 2016-2022<br/>[Sebastian Software GmbH](http://www.sebastian-software.de)
