# Vue code blocks

> Vue code block will be loaded as a Vue component by default.

```vue
<template>
  <p :style="{ color: 'green' }">{{ message }}</p>
</template>

<script>
export default {
  data() {
    return {
      message: 'This is a code block of Vue component.',
    };
  },
};
</script>

<style scoped>
p {
  border-radius: .25rem;
  border: 1px solid #eee;
  margin-bottom: 1rem;
  padding: .5rem 1rem;
}
</style>
```

<!-- no-vue-component -->

```vue
<template>
  <p>This is a code block of Vue component too, but will not be loaded as a Vue component because of the predefined <code>&lt;!-- vue-component --&gt;</code> comment.</p>
</template>
```
