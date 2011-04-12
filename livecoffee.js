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
      name: 'Live CoffeeScript',
      dev: 'Tane Piper',
      type: ext.GENERAL,
      alone: true,
      markup: markup,
      commands: {
        "livecoffee": {
          hint: "Compile the current coffeescript document"
        }
      },
      hotitems: {},
      nodes: [],
      compile: function() {
        var bare, compiledJS, doc, editor, value;
        editor = editors.currentEditor;
        doc = editor.getDocument();
        value = doc.getValue();
        compiledJS = '';
        try {
          bare = this.coffeeoptBare.checked;
          compiledJS = CoffeeScript.compile(value, {
            bare: bare
          });
          this.coffeeCode.setValue(compiledJS);
          if (this.coffeeoptMatchLines.checked) {
            this.coffeeCode.$editor.gotoLine(editor.ceEditor.line);
          }
          if (this.coffeeoptNodes.checked) {
            this.coffeeNodes.setValue(CoffeeScript.nodes(value));
          }
          if (this.coffeeoptTokens.checked) {
            this.coffeeTokens.setValue(CoffeeScript.tokens(value));
          }
        } catch (exp) {
          this.coffeeCode.setValue(exp.message);
        }
      },
      hook: function() {
        this.nodes.push(ide.mnuEdit.appendChild(new apf.divider()));
        this.nodes.push(ide.mnuEdit.appendChild(new apf.item({
          caption: 'View CoffeeScript Output',
          onclick: __bind(function() {
            var editor;
            ext.initExtension(this);
            this.compile();
            this.coffeeOutput.show();
            if (this.coffeeOutput.visible) {
              editor = editors.currentEditor;
              editor.ceEditor.addEventListener('keyup', __bind(function() {
                return this.compile();
              }, this));
            }
          }, this)
        })));
        this.hotitems.livecoffee = [this.nodes[0]];
      },
      init: function(amlNode) {
        coffeeoptBare.addEventListener('click', __bind(function() {
          return this.compile();
        }, this));
        this.coffeeoptBare = coffeeoptBare;
        coffeeoptNodes.addEventListener('click', __bind(function() {
          console.log(arguments);
          if (coffeeoptNodes.checked) {
            this.coffeeNodeView.enable();
            return this.compile();
          } else {
            return coffeeoptNodes.disable();
          }
        }, this));
        this.coffeeoptNodes = coffeeoptNodes;
        coffeeoptTokens.addEventListener('click', __bind(function() {
          if (coffeeoptTokens.checked) {
            this.coffeeTokenView.enable();
            return this.compile();
          } else {
            return this.coffeeTokenView.disable();
          }
        }, this));
        this.coffeeoptTokens = coffeeoptTokens;
        this.coffeeoptMatchLines = coffeeoptMatchLines;
        coffeeCode.syntax = 'javascript';
        this.coffeeCode = coffeeCode;
        this.coffeeOutput = coffeeOutput;
        coffeeNodeView.disable();
        this.coffeeNodeView = coffeeNodeView;
        this.coffeeNodes = coffeeNodes;
        coffeeTokenView.disable();
        this.coffeeTokenView = coffeeTokenView;
        this.coffeeTokens = coffeeTokens;
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
        this.coffeeOutput.destroy(true, true);
      }
    });
  });
}).call(this);
