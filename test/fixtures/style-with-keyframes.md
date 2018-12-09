# Style with keyframes

```vue
<template>
  <p>Hello, World!</p>
</template>

<style scoped>
@keyframes fade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

p {
  animation: fade .15s infinite;
}
</style>
```
