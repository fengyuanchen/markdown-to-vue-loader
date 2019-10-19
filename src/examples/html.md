# HTML code blocks

> HTML code block will be loaded as a Vue component by default.

```html
<p class="html-code-block">This is a code block of HTML.</p>

<script>
window.onload = function () {
  document.querySelector('.html-code-block').style.color = 'green';
};
</script>

<style>
.html-code-block {
  border: 1px solid #eee;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
}
</style>
```

<!-- no-vue-component -->

```html
<p>This is a code block of HTML too, but will not be loaded as a Vue component because of the predefined <code>&lt;!-- vue-component --&gt;</code> comment.</p>
```
