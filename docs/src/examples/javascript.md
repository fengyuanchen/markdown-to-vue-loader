# JavaScript code blocks

> JavaScript code block will **NOT** be loaded as a Vue component by default.

```js
export default {
  template: '<p>This is a code block of JavaScript.</p>'
};
```

<!-- vue-component -->

```js
export default {
  template: '<p style="border-radius: .25rem; border: 1px solid #eee; color: green; margin-bottom: 1rem; padding: .5rem 1rem;">This is a code block of JavaScript too, and will be loaded as a Vue component because of the predefined <code>&lt;!-- vue-component --&gt;</code> comment.</p>'
};
```
