const MarkdownIt = require('markdown-it');
const cheerio = require('cheerio');
const path = require('path');
const postcss = require('postcss');
const vue = require('vue');

const isVue3 = vue.version && vue.version[0] > 2;
const defaultOptions = {
  cheerioLoadOptions: {
    decodeEntities: false,
    lowerCaseAttributeNames: false,
    lowerCaseTags: false,
  },
  configureMarkdownIt: null,
  componentNamespace: 'component',
  componentWrapper: '',
  exportSource: false,
  languages: ['vue', 'html'],
  markdownItOptions: {
    html: true,
    linkify: true,
    typographer: true,
  },
  preClass: '',
  preWrapper: '',
  tableClass: '',
  tableWrapper: '',
};

// RegExps
const REGEXP_COMMENT_OPTIONS = /^(?:no-)?vue-component$/;
const REGEXP_HYPHENS_END = /-*$/;
const REGEXP_HYPHENS_START = /^-*/;
const REGEXP_LANGUAGE_CLASS = /\blang(?:uage)?-(\w+)\b/;
const REGEXP_MODULE_EXPORTS = /(?:export\s+default|(?:module\.)?exports\s*=)/g;
const REGEXP_MODULE_IMPORTS = /(?:import)(?:\s+((?:[\s\S](?!import))+?)\s+(?:from))?\s+["']([^"']+)["']/g;
const REGEXP_NOT_WORDS = /\W/g;

/**
 * Normalize script to valid Vue Component.
 * @param {string} script - The raw script code of component.
 * @param {string} mixin - The mixin to component.
 * @returns {string} The normalize component.
 */
function normalizeComponent(script, mixin) {
  script = script.replace(REGEXP_MODULE_IMPORTS, (matched, moduleExports, moduleName) => {
    if (moduleExports) {
      return `var ${moduleExports} = require('${moduleName}')`;
    }

    return `require('${moduleName}')`;
  }).replace(REGEXP_MODULE_EXPORTS, 'return');

  return `(function () {
    var component = (function () {
      ${script}
    }());

    if (typeof component === 'function') {
      component = component();
    }

    if (typeof component !== 'object') {
      component = {};
    }

    return Object.assign(component, ${mixin});
  }())`;
}

module.exports = function markdownToVueLoader(source, map) {
  const options = { ...defaultOptions, ...this.getOptions() };
  const markdownItOptions = {
    ...defaultOptions.markdownItOptions,
    ...options.markdownItOptions,
  };
  const markdown = new MarkdownIt(markdownItOptions);

  if (typeof options.configureMarkdownIt === 'function') {
    options.configureMarkdownIt.call(markdown, markdown);
  }

  const cheerioLoadOptions = {
    ...defaultOptions.cheerioLoadOptions,
    ...options.cheerioLoadOptions,
  };
  const $ = cheerio.load(markdown.render(source), cheerioLoadOptions);
  const resourceName = path.basename(this.resourcePath, '.md');
  const normalizedResourceName = resourceName.toLowerCase().replace(REGEXP_NOT_WORDS, '-').replace(REGEXP_HYPHENS_START, '').replace(REGEXP_HYPHENS_END, '');
  const components = [];

  $('pre').each((index, pre) => {
    const $pre = $(pre);
    const componentName = [options.componentNamespace, normalizedResourceName, index].join('-');
    let commentNode = pre.previousSibling;
    let commentOption = '';

    while (commentNode) {
      const { nodeType } = commentNode;

      if (nodeType === 8) {
        commentOption = commentNode.data.trim();

        if (REGEXP_COMMENT_OPTIONS.test(commentOption)) {
          break;
        }
      }

      commentNode = (nodeType === 3 || nodeType === 8) ? commentNode.previousSibling : null;
    }

    if (commentOption !== 'no-vue-component') {
      $pre.children('code').each((idx, code) => {
        const $code = $(code);
        const [, language] = ($code.attr('class') || '').match(REGEXP_LANGUAGE_CLASS) || [];

        if (options.languages.indexOf(language) === -1 && commentOption !== 'vue-component') {
          return;
        }

        const mixin = [];
        let template = '';
        let component;
        let scoped;
        let style;

        switch (language) {
          case 'vue': {
            const $$ = cheerio.load($code.text(), cheerioLoadOptions);
            const $body = $$('body');
            const $style = $$('style');

            component = $$('script').html() || 'export default {};';
            scoped = $style.attr('scoped');
            style = $style.html();

            // Move <template> from <head> to <body>
            $body.append($$('head > template'));
            $body.children('template').each((i, element) => {
              template += $(element).html();
            });
            break;
          }

          case 'html': {
            const $$ = cheerio.load($code.text(), cheerioLoadOptions);
            const $body = $$('body');
            const $script = $$('script');
            const $style = $$('style');

            component = $script.html() || 'export default {};';
            scoped = $style.attr('scoped');
            style = $style.html();
            $script.remove();
            $style.remove();

            // Move <template> from <head> to <body>
            $body.append($$('head > template'));
            $body.children('template').each((i, element) => {
              const $element = $(element);

              $element.replaceWith($element.html());
            });
            template = $body.html();
            break;
          }

          // case 'javascript':
          // case 'js':
          default:
            component = $code.text();
        }

        if (component) {
          mixin.push(`name: ${JSON.stringify(componentName)}`);

          if (template) {
            template = `<div class="${componentName}">${template}</div>`;
            mixin.push(`template: ${JSON.stringify(template)}`);
          }

          if (style) {
            if (typeof scoped !== 'undefined') {
              const root = postcss.parse(style);

              root.walkRules((rule) => {
                if (rule.parent && rule.parent.name === 'keyframes') {
                  return;
                }

                rule.selectors = rule.selectors.map((selector) => `.${componentName} ${selector}`);
              });

              style = root.toResult().css;
            }

            mixin.push(`beforeCreate: function () {
              var style = document.createElement('style');
              style.textContent = ${JSON.stringify(style)};
              document.head.appendChild(style);
              this.$styleInjectedByMarkdownToVueLoader = style;
            }`);
            mixin.push(`before${isVue3 ? 'Unmount' : 'Destroyed'}: function () {
              var $style = this.$styleInjectedByMarkdownToVueLoader;
              $style.parentNode.removeChild($style);
            }`);
          }

          components.push(`${JSON.stringify(componentName)}: ${normalizeComponent(component, `{${mixin.join()}}`)}`);

          const $component = $(`<${componentName}></${componentName}>`);

          $pre.before($component);

          if (options.componentWrapper) {
            $component.wrap(options.componentWrapper);
          }
        }
      });
    }

    $pre.attr('v-pre', '');

    if (options.preClass) {
      $pre.addClass(options.preClass);
    }

    if (options.preWrapper) {
      $pre.wrap(options.preWrapper);
    }
  });

  $('table').each((i, table) => {
    const $table = $(table);

    if (options.tableClass) {
      $table.addClass(options.tableClass);
    }

    if (options.tableWrapper) {
      $table.wrap(options.tableWrapper);
    }
  });

  const $$ = cheerio.load('<template></template>');
  const $body = $$('body');

  $('style').each((index, style) => {
    const $style = $(style);

    $body.append($style);
  });

  // Move <template> from <head> to <body>
  $body.append($$('head > template'));
  $body.children('template').html(`<div><div class="${options.componentNamespace}-${normalizedResourceName}">${$('body').html()}</div></div>`);

  if (options.exportSource || components.length > 0) {
    $body.append(`<script>
  export default {
    ${options.exportSource ? `source: ${JSON.stringify(markdown.utils.escapeHtml(source))},` : ''}
    ${components.length > 0 ? `components: {${components.join()}}` : ''}
  };
</script>`);
  }

  this.callback(null, $$('body').html(), map);
};
