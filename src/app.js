import { createApp, h } from 'vue';
import App from './app.vue';

const app = createApp({
  render: () => h(App),
});

app.mount('#app');

export default app;
