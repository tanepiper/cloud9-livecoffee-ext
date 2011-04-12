(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define(function(require, exports, module) {
    var CoffeeScript, editors, ext, ide, markup, util;
    ide = require('core/ide');
    ext = require('core/ext');
    util = require('core/util');
    editors = require('ext/editors/editors');
    markup = require('text!ext/livecoffee/livecoffee.xml');
    CoffeeScript = require('ext/livecoffee/coffeescript');
    return ext.register('ext/livecoffee/livecoffee', {
      name: 'LiveCoffee',
      dev: 'Tane Piper',
      type: ext.GENERAL,
      alone: true,
      markup: markup,
      commands: {
        'livecoffee': {
          hint: 'Compile the current coffeescript document'
        }
      },
      hotitems: {},
      nodes: [],
      hook: function() {
        this.nodes.push(mnuEdit.appendChild(new apf.divider()));
        this.nodes.push(mnuEdit.appendChild(new apf.item({
          caption: 'LiveCoffee',
          onclick: __bind(function() {
            return this.livecoffee();
          }, this)
        })));
        this.hotitems['livecoffee'] = [this.nodes[1]];
      },
      livecoffee: function() {
        var editor;
        ext.initExtension(this);
        this.compile();
        this.liveCoffeeOutput.show();
        if (this.liveCoffeeOutput.visible) {
          editor = editors.currentEditor;
          editor.ceEditor.addEventListener('keyup', __bind(function() {
            return this.compile();
          }, this));
          editor.ceEditor.addEventListener('contextmenu', __bind(function() {
            if (this.liveCoffeeOptMatchLines.checked) {
              return this.liveCoffeeCodeOutput.$editor.gotoLine(editor.ceEditor.line);
            }
          }, this));
        }
      },
      compile: function() {
        var bare, compiledJS, doc, editor, value;
        editor = editors.currentEditor;
        doc = editor.getDocument();
        value = doc.getValue();
        compiledJS = '';
        try {
          bare = this.liveCoffeeOptCompileBare.checked;
          compiledJS = CoffeeScript.compile(value, {
            bare: bare
          });
          this.liveCoffeeCodeOutput.setValue(compiledJS);
          if (this.liveCoffeeOptMatchLines.checked) {
            this.liveCoffeeCodeOutput.$editor.gotoLine(editor.ceEditor.line);
          }
          if (this.liveCoffeeOptCompileNodes.checked) {
            this.liveCoffeeNodeOutput.setValue(CoffeeScript.nodes(value));
          }
          if (this.liveCoffeeOptCompileTokens.checked) {
            this.liveCoffeeTokenOutput.setValue(CoffeeScript.tokens(value));
          }
        } catch (exp) {
          this.liveCoffeeCodeOutput.setValue(exp.message);
        }
      },
      init: function(amlNode) {
        liveCoffeeOptCompileBare.addEventListener('click', __bind(function() {
          return this.compile();
        }, this));
        this.liveCoffeeOptCompileBare = liveCoffeeOptCompileBare;
        liveCoffeeOptCompileNodes.addEventListener('click', __bind(function() {
          if (liveCoffeeOptCompileNodes.checked) {
            this.liveCoffeeNodes.enable();
            return this.compile();
          } else {
            return liveCoffeeNodes.disable();
          }
        }, this));
        this.liveCoffeeOptCompileNodes = liveCoffeeOptCompileNodes;
        liveCoffeeOptCompileTokens.addEventListener('click', __bind(function() {
          if (liveCoffeeOptCompileTokens.checked) {
            this.liveCoffeeTokens.enable();
            return this.compile();
          } else {
            return this.liveCoffeeTokens.disable();
          }
        }, this));
        this.liveCoffeeOptCompileTokens = liveCoffeeOptCompileTokens;
        this.liveCoffeeOptMatchLines = liveCoffeeOptMatchLines;
        liveCoffeeCodeOutput.syntax = 'javascript';
        this.liveCoffeeCodeOutput = liveCoffeeCodeOutput;
        this.liveCoffeeOutput = liveCoffeeOutput;
        liveCoffeeNodes.disable();
        this.liveCoffeeNodes = liveCoffeeNodes;
        this.liveCoffeeNodeOutput = liveCoffeeNodeOutput;
        liveCoffeeTokens.disable();
        this.liveCoffeeTokens = liveCoffeeTokens;
        this.liveCoffeeTokenOutput = liveCoffeeTokenOutput;
      },
      enable: function() {
        this.nodes.each(function(item) {
          item.enable();
        });
      },
      disable: function() {
        this.nodes.each(function(item) {
          item.disable();
        });
      },
      destroy: function() {
        this.nodes.each(function(item) {
          item.destroy(true, true);
        });
        this.nodes = [];
        this.liveCoffeeOutput.destroy(true, true);
      }
    });
  });
}).call(this);
