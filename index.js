const MarkdownIt = require('markdown-it');
const cheerio = require('cheerio');
const loaderUtils = require('loader-utils');
const path = require('path');
const postcss = require('postcss');

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
const REGEXP_LANGUAGE_PREFIXES = /lang(uage)?-/;
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

    component.mixins = (component.mixins || []).concat([${mixin}]);

    return component;
  }())`;
}

module.exports = function markdownToVueLoader(source, map) {
  const options = { ...defaultOptions, ...loaderUtils.getOptions(this) };
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
      $pre.children('code').each((i, code) => {
        const $code = $(code);
        const language = $code.attr('class').replace(REGEXP_LANGUAGE_PREFIXES, '');

        if (options.languages.indexOf(language) === -1 && commentOption !== 'vue-component') {
          return;
        }

        const mixin = [];
        let component;
        let scoped;
        let style;
        let template;

        switch (language) {
          case 'vue': {
            const $html = cheerio.load($code.text(), cheerioLoadOptions);
            const $style = $html('style');

            component = $html('script').html() || 'export default {};';
            scoped = $style.attr('scoped');
            style = $style.html();
            template = $html('template').html();
            break;
          }

          case 'html': {
            const $html = cheerio.load($code.text(), cheerioLoadOptions);
            const $body = $html('body');
            const $script = $html('script');
            const $style = $html('style');

            component = $script.html() || 'export default {};';
            scoped = $style.attr('scoped');
            style = $style.html();
            $script.remove();
            $style.remove();

            // Move <template> from <head> to <body>
            $body.append($html('head template'));
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
            mixin.push(`beforeDestroy: function () {
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

    $pre.children('code').each((i, code) => {
      const $code = $(code);

      $code.text(markdown.utils.escapeHtml($code.text()));
    });
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

  const $html = cheerio.load('<template></template>');
  const $body = $html('body');

  $body.append($html('head template'));

  $('style').each((i, style) => {
    const $style = $(style);

    $body.append($style);
  });

  $html('template').append(`<div class="${options.componentNamespace}-${normalizedResourceName}">${$('body').html()}</div>`);

  if (options.exportSource || components.length > 0) {
    $body.append(`<script>
  export default {
    ${options.exportSource ? `source: ${JSON.stringify(markdown.utils.escapeHtml(source))},` : ''}
    ${components.length > 0 ? `components: {${components.join()}}` : ''}
  };
</script>`);
  }

  this.callback(null, $html('body').html(), map);
};
