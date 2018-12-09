# Vue code block

```vue
<template>
  <p :style="{ color: 'blue' }">Hello, {{ name }}!</p>
</template>

<script>
export default {
  data() {
    return {
      name: 'World',
    };
  },
};
</script>

<style>
p {
  color: green;
}
</style>
```
