# markdown-to-vue-loader

[![Build Status](https://img.shields.io/travis/fengyuanchen/markdown-to-vue-loader.svg)](https://travis-ci.org/fengyuanchen/markdown-to-vue-loader) [![Coverage Status](https://img.shields.io/codecov/c/github/fengyuanchen/markdown-to-vue-loader.svg)](https://codecov.io/gh/fengyuanchen/markdown-to-vue-loader) [![Downloads](https://img.shields.io/npm/dm/markdown-to-vue-loader.svg)](https://www.npmjs.com/package/markdown-to-vue-loader) [![Version](https://img.shields.io/npm/v/markdown-to-vue-loader.svg)](https://www.npmjs.com/package/markdown-to-vue-loader) [![Dependencies](https://img.shields.io/david/fengyuanchen/markdown-to-vue-loader.svg)](https://www.npmjs.com/package/markdown-to-vue-loader)

> Markdown to Vue component loader for [Webpack](https://webpack.js.org).

- The built-in markdown parser is [**markdown-it**](https://github.com/markdown-it/markdown-it).
- [Examples](https://fengyuanchen.github.io/markdown-to-vue-loader).

## Features

- Supports to load a markdown file as a Vue component.
- Supports to load code blocks (Vue and HTML by default) as Vue components.
- Supports 10 [options](#options).

## Getting started

### Install

```shell
npm install markdown-to-vue-loader vue-loader webpack --save-dev
```

### Usage

Within your webpack configuration object, you'll need to add the **markdown-to-vue-loader** to the list of modules, like so:

```js
module: {
  rules: [
    {
      test: /\.md$/,
      exclude: /(node_modules|bower_components)/,
      use: [
        'vue-loader',
        {
          loader: 'markdown-to-vue-loader',
          options: {
            // ...
          },
        },
      ],
    },
  ],
}
```

## Options

### cheerioLoadOptions

- Type: `Object`
- Default:

    ```js
    {
      decodeEntities: false,
      lowerCaseAttributeNames: false,
      lowerCaseTags: false,
    }
    ```

The options for the `load` method of the [**cheerio**](https://github.com/cheeriojs/cheerio).

### configureMarkdownIt

- Type: `Function`
- Default: `null`
- Example:

    ```js
    {
      configureMarkdownIt(md) {
        md.set(...)
          .use(...);
      }
    }
    ```

Checkout the documentation of [MarkdownIt](https://markdown-it.github.io/markdown-it/) for more information.

### componentNamespace

- Type: `String`
- Default: `'component'`

The namespace for component name.

For example, if this is set to `'awesome-component'`, then given this input (`example.md`):

````markdown
# Example

```vue
<template>
  <p>Hello, World!</p>
</template>
```
````

will generate (`example.vue`):

```html
<template>
  <div>
    <h1>Example</h1>
    <awesome-component-example-0></awesome-component-example-0>
    <pre><code class="language-vue">&lt;template&gt;
  &lt;p&gt;Hello, World!&lt;/p&gt;
&lt;/template&gt;</code></pre>
  </div>
</template>
<script>
  module.exports = {
    components: {
      'awesome-component-example-0': {
        template: '<p>Hello, World!</p>'
      }
    }
  };
</script>
```

### componentWrapper

- Type: `String`
- Default: `''`

The wrapper for component content. Supports to use Vue component as the wrapper.

For example, if this is set to `'<section></section>'`, then given this input (`example.md`):

````markdown
# Example

```html
<p>Hello, World!</p>
```
````

will generate (`example.vue`):

```html
<template>
  <div>
    <h1>Example</h1>
    <section><component-example-0></component-example-0></section>
    <pre><code class="language-html">&lt;p&gt;Hello, World!&lt;/p&gt;</code></pre>
  </div>
</template>
<script>
  module.exports = {
    components: {
      'component-example-0': {
        template: '<p>Hello, World!</p>'
      }
    }
  };
</script>
```

### exportSource

- Type: `Boolean`
- Default: `false`

Export source markdown text.

If this is set to `true`, then you can get the source from the Vue component's `source` property.

For example (`example.md`):

```markdown
# Hello, World!
```

```js
import Example from 'example.md';

console.log(Example.source);
// > # Hello, World!
```

### languages

- Type: `Array`
- Default: `['vue', 'html']`

The code blocks of these languages will be loaded as Vue components be default.

For example, if this is set to `['js']`, then given this input (`example.md`):

````markdown
# Example

```js
export default {
  template: '<p>Hello, World!</p>'
}
```
````

will generate (`example.vue`):

```html
<template>
  <div>
    <h1>Example</h1>
    <component-example-0></component-example-0>
    <pre><code class="language-js">export default {
  template: '&lt;p&gt;Hello, World!&lt;/p&gt;'
}</code></pre>
  </div>
</template>
<script>
  module.exports = {
    components: {
      'component-example-0': {
        template: '<p>Hello, World!</p>'
      }
    }
  };
</script>
```

### markdownItOptions

- Type: `Object`
- Default:

    ```js
    {
      html: true,
      linkify: true,
      typographer: true,
    }
    ```

- Example:

    ```js
    {
      typographer: false,
      highlight(str, lang) {
        return '';
      },
    }
    ```

The options for the built-in markdown parser [**markdown-it**](https://github.com/markdown-it/markdown-it).

### preClass

- Type: `String`
- Default: `''`
- Example: `'prettyprint'`

The class name for each `<pre></pre>` element.

### preWrapper

- Type: `String`
- Default: `''`
- Example: `'<div class="example-code"></div>'`

The wrapper for each `<pre></pre>` element. Supports to use Vue component as the wrapper.

### tableClass

- Type: `String`
- Default: `''`
- Example: `'table table-bordered border-striped'`

The class name for each `<table></table>` element.

### tableWrapper

- Type: `String`
- Default: `''`
- Example: `'<div class="table-container"></div>'`

The wrapper for each `<table></table>` element. Supports to use Vue component as the wrapper.

## Inline comment options

- `<!-- vue-component -->`
- `<!-- no-vue-component -->`

If a code block has a `<!-- vue-component -->` comment before it, then the loader will load it as a Vue component, even though its language is **NOT** specified in the [`languages`](#languages) option.

Conversely, if a code block has a `<!-- no-vue-component -->` comment before it, then the loader will **NOT** load it as a Vue component, even though its language is specified in the [`languages`](#languages) option.

For example, given this input (`example.md`):

````markdown
# Example

<!-- vue-component -->

```js
export default {
  template: '<p>Hello, World!</p>'
};
```

<!-- no-vue-component -->

```vue
<template>
  <p>Hello, World!</p>
</template>
```
````

will generate (`example.vue`):

```html
<template>
  <div>
    <h1>Example</h1>
    <component-example-0></component-example-0>
    <pre><code class="language-js">export default {
  template: '&lt;p&gt;Hello, World!&lt;/p&gt;'
};</code></pre>
    <pre><code class="language-vue">&lt;template&gt;
  &lt;p&gt;Hello, World!&lt;/p&gt;
&lt;/template&gt;</code></pre>
  </div>
</template>
<script>
  module.exports = {
    components: {
      'component-example-0': {
        template: '<p>Hello, World!</p>'
      }
    }
  };
</script>
```

## Scoped CSS

When a `<style>` tag has the `scoped` attribute, its CSS will apply to elements of the current component only.

For example, given this input:

```html
<template>
  <p>Hello, World!</p>
</template>

<style scoped>
  p {
    color: green;
  }
</style>
```

will render as this:

```html
<div class="component-example-0">
  <p>Hello, World!</p>
</div>

<style>
  .component-example-0 p {
    color: green;
  }
</style>
```

## Versioning

Maintained under the [Semantic Versioning guidelines](https://semver.org).

## License

[MIT](https://opensource.org/licenses/MIT) © [Chen Fengyuan](https://chenfengyuan.com)
