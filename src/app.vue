<template>
  <div class="app">
    <header class="navbar navbar-light navbar-expand-md">
      <nav class="container-fluid">
        <a
          class="navbar-brand"
          href="./"
        >
          {{ pkg.name }}
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon" />
        </button>
        <div
          id="navbarCollapse"
          class="collapse navbar-collapse justify-content-end"
          role="navigation"
        >
          <nav class="nav navbar-nav">
            <a
              class="nav-link"
              href="https://github.com/fengyuanchen/markdown-to-vue-loader/blob/master/README.md"
              title="View the documentation"
            >
              Docs
            </a>
            <a
              class="nav-link"
              href="https://github.com/fengyuanchen/markdown-to-vue-loader"
              title="View the GitHub project"
            >
              GitHub
            </a>
            <a
              class="nav-link"
              href="https://fengyuanchen.github.io/"
              title="Explore more projects"
            >
              Explore
            </a>
            <a
              class="nav-link"
              href="https://github.com/fengyuanchen"
              title="About the author"
            >
              About
            </a>
          </nav>
        </div>
      </nav>
    </header>
    <main>
      <div class="bg-primary text-white py-5">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md">
              <h1>
                {{ pkg.name }} <small class="h6">
                  v{{ pkg.version }}
                </small>
              </h1>
              <p class="lead">
                {{ pkg.description }}
              </p>
            </div>
            <div class="col-md">
              <div
                ref="carbonads"
                class="carbonads"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="container-fluid">
        <h2 class="mb-4">
          Examples
        </h2>
        <section class="row example">
          <pre class="col-lg-6 example__code"><code
            class="markdown"
            v-html="vue"
          /></pre>
          <div class="col-lg-6 markdown-body example__demo">
            <ExampleVue />
          </div>
        </section>
        <section class="row example">
          <pre class="col-lg-6 example__code"><code
            class="markdown"
            v-html="html"
          /></pre>
          <div class="col-lg-6 markdown-body example__demo">
            <ExampleHtml />
          </div>
        </section>
        <section class="row example">
          <pre class="col-lg-6 example__code"><code
            class="markdown"
            v-html="javascript"
          /></pre>
          <div class="col-lg-6 markdown-body example__demo">
            <ExampleJavascript />
          </div>
        </section>
        <section class="row example">
          <pre class="col-lg-6 example__code"><code
            class="markdown"
            v-html="others"
          /></pre>
          <div class="col-lg-6 markdown-body example__demo">
            <ExampleOthers />
          </div>
        </section>
      </div>
    </main>
    <footer class="footer">
      <div class="container">
        <nav class="nav flex-wrap justify-content-center my-3">
          <a
            class="nav-link"
            href="https://github.com/fengyuanchen/markdown-to-vue-loader"
          >
            GitHub
          </a>
          <a
            class="nav-link"
            href="https://github.com/fengyuanchen/markdown-to-vue-loader/blob/master/LICENSE"
          >
            License
          </a>
          <a
            class="nav-link"
            href="https://chenfengyuan.com/"
          >
            About
          </a>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script>
import ExampleVue from './examples/vue.md';
import ExampleHtml from './examples/html.md';
import ExampleJavascript from './examples/javascript.md';
import ExampleOthers from './examples/others.md';
import pkg from '../package.json';

export default {
  components: {
    ExampleVue,
    ExampleHtml,
    ExampleJavascript,
    ExampleOthers,
  },

  data: () => ({
    pkg,
    vue: ExampleVue.source,
    html: ExampleHtml.source,
    javascript: ExampleJavascript.source,
    others: ExampleOthers.source,
  }),

  mounted() {
    const script = document.createElement('script');

    script.id = '_carbonads_js';
    script.src = 'https://cdn.carbonads.com/carbon.js?serve=CKYI55Q7&placement=fengyuanchengithubio';
    this.$refs.carbonads.appendChild(script);
  },
};
</script>

<style>
.example {
  border-bottom: 1px solid #ddd;
  border-top: 1px solid #ddd;
}

.example + .example {
  margin-top: -1px;
}

.example__code {
  background-color: #f8f8f8;
  margin-bottom: 0;
}

@media (min-width: 992px) {
  .example__code {
    padding: 3rem 4rem;
  }

  .example__demo {
    padding: 1.5rem 4rem;
  }
}

.footer {
  font-size: 0.875rem;
}

.carbonads {
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  overflow: hidden;
  padding: 1rem;
}

.carbon-wrap {
  overflow: hidden;
}

.carbon-img {
  clear: left;
  display: block;
  float: left;
}

.carbon-text,
.carbon-poweredby {
  display: block;
  margin-left: 140px;
}

.carbon-text,
.carbon-text:hover,
.carbon-text:focus {
  color: #fff;
  text-decoration: none;
}

.carbon-poweredby,
.carbon-poweredby:hover,
.carbon-poweredby:focus {
  color: #ddd;
  text-decoration: none;
}

@media (min-width: 768px) {
  .carbonads {
    float: right;
    margin-bottom: -1rem;
    margin-top: -1rem;
    max-width: 360px;
  }
}
</style>
