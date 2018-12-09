'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var cheerio = _interopDefault(require('cheerio'));
var loaderUtils = _interopDefault(require('loader-utils'));
var MarkdownIt = _interopDefault(require('markdown-it'));
var postcss = _interopDefault(require('postcss'));

var path = require('path');

var defaultOptions = {
  componentNamespace: 'component',
  componentWrapper: '',
  escapeApostrophes: false,
  exportSource: false,
  languages: ['vue', 'html'],
  markdownItOptions: {},
  preClass: '',
  preWrapper: '',
  tableClass: '',
  tableWrapper: ''
}; // RegExps

var REGEXP_APOSTROPHES = /&apos;/g;
var REGEXP_COMMENT_OPTIONS = /^(no-)?vue-component$/;
var REGEXP_HYPHENS_END = /-*$/;
var REGEXP_HYPHENS_START = /^-*/;
var REGEXP_LANGUAGE_PREFIXES = /lang(uage)-?/;
var REGEXP_MODULE_EXPORTS = /(?:export\s+default|(?:module\.)?exports\s*=)/g;
var REGEXP_MODULE_IMPORTS = /(?:import)(?:\s+((?:[\s\S](?!import))+?)\s+(?:from))?\s+["']([^"']+)["']/g;
var REGEXP_NOT_WORDS = /\W/g;
/**
 * Normalize script to valid Vue Component.
 * @param {string} script - The raw script code of component.
 * @param {string} mixin - The mixin to component.
 * @returns {string} The normalize component.
 */

function normalizeComponent(script, mixin) {
  script = script.replace(REGEXP_MODULE_IMPORTS, function (matched, moduleExports, moduleName) {
    if (moduleExports) {
      return "var ".concat(moduleExports, " = require('").concat(moduleName, "')");
    }

    return "require('".concat(moduleName, "')");
  }).replace(REGEXP_MODULE_EXPORTS, 'return');
  return "(function () {\n    var component = (function () {\n      ".concat(script, "\n    }());\n\n    if (typeof component === 'function') {\n      component = component();\n    }\n\n    if (typeof component !== 'object') {\n      component = {};\n    }\n\n    component.mixins = (component.mixins || []).concat([").concat(mixin, "]);\n\n    return component;\n  }())");
}

function markdownToVueLoader(source, map) {
  var options = Object.assign({}, defaultOptions, loaderUtils.getOptions(this));
  var markdown = new MarkdownIt(Object.assign({
    html: true,
    linkify: true,
    typographer: true
  }, options.markdownItOptions));
  var $ = cheerio.load(markdown.render(source), {
    decodeEntities: true,
    lowerCaseTags: false
  });
  var resourceName = path.basename(this.resourcePath, '.md');
  var normalizedResourceName = resourceName.toLowerCase().replace(REGEXP_NOT_WORDS, '-').replace(REGEXP_HYPHENS_START, '').replace(REGEXP_HYPHENS_END, '');
  var components = [];
  $('pre').each(function (index, pre) {
    var $pre = $(pre);
    var componentName = [options.componentNamespace, normalizedResourceName, index].join('-');
    var commentNode = pre.previousSibling;
    var commentOption = '';

    while (commentNode) {
      var _commentNode = commentNode,
          nodeType = _commentNode.nodeType;

      if (nodeType === 8) {
        commentOption = commentNode.data.trim();

        if (REGEXP_COMMENT_OPTIONS.test(commentOption)) {
          break;
        }
      }

      commentNode = nodeType === 3 || nodeType === 8 ? commentNode.previousSibling : null;
    }

    if (commentOption !== 'no-vue-component') {
      $pre.children('code').each(function (i, code) {
        var $code = $(code);
        var language = $code.attr('class').replace(REGEXP_LANGUAGE_PREFIXES, '');

        if (options.languages.indexOf(language) === -1 && commentOption !== 'vue-component') {
          return;
        }

        var mixin = [];
        var component;
        var scoped;
        var style;
        var template;

        switch (language) {
          case 'vue':
            {
              var $html = cheerio.load($code.text());
              var $style = $html('style');
              component = $html('script').html() || 'module.exports = {};';
              scoped = $style.attr('scoped');
              style = $style.html();
              template = $html('template').html();
              break;
            }

          case 'html':
            {
              var _$html = cheerio.load($code.text());

              var $body = _$html('body');

              var $script = _$html('script');

              var _$style = _$html('style');

              component = $script.html() || 'module.exports = {};';
              scoped = _$style.attr('scoped');
              style = _$style.html();
              $script.remove();

              _$style.remove(); // Move <template> from <head> to <body>


              $body.append(_$html('head template'));
              template = $body.html();
              break;
            }
          // case 'javascript':
          // case 'js':

          default:
            component = $code.text();
        }

        if (component) {
          mixin.push("name: ".concat(JSON.stringify(componentName)));

          if (template) {
            template = "<div class=\"".concat(componentName, "\">").concat(template, "</div>");
            mixin.push("template: ".concat(JSON.stringify(template)));
          }

          if (style) {
            if (typeof scoped !== 'undefined') {
              var root = postcss.parse(style);
              root.walkRules(function (rule) {
                if (rule.parent && rule.parent.name === 'keyframes') {
                  return;
                }

                rule.selectors = rule.selectors.map(function (selector) {
                  return ".".concat(componentName, " ").concat(selector);
                });
              });
              style = root.toResult().css;
            }

            mixin.push("beforeCreate: function () {\n              var style = document.createElement('style');\n              style.textContent = ".concat(JSON.stringify(style), ";\n              document.head.appendChild(style);\n              this.$styleInjectedByMarkdownToVueLoader = style;\n            }"));
            mixin.push("beforeDestroy: function () {\n              var $style = this.$styleInjectedByMarkdownToVueLoader;\n              $style.parentNode.removeChild($style);\n            }");
          }

          components.push("".concat(JSON.stringify(componentName), ": ").concat(normalizeComponent(component, "{".concat(mixin.join(), "}"))));
          var $component = $("<".concat(componentName, "></").concat(componentName, ">"));
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
  $('table').each(function (i, table) {
    var $table = $(table);

    if (options.tableClass) {
      $table.addClass(options.tableClass);
    }

    if (options.tableWrapper) {
      $table.wrap(options.tableWrapper);
    }
  });
  var output = "<template>\n  <div class=\"".concat(normalizedResourceName, "\">").concat($('body').html(), "</div>\n</template>");

  if (options.exportSource || components.length > 0) {
    output += "<script>\n  module.exports = {\n    ".concat(options.exportSource ? "source: ".concat(JSON.stringify(markdown.utils.escapeHtml(source)), ",") : '', "\n    ").concat(components.length > 0 ? "components: {".concat(components.join(), "}") : '', "\n  };\n</script>");
  }

  if (!options.escapeApostrophes) {
    output = output.replace(REGEXP_APOSTROPHES, '\'');
  }

  this.callback(null, output, map);
}

module.exports = markdownToVueLoader;
