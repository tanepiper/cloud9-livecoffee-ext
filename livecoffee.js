define(function(require, exports, module) {
    
    var ide             = require('core/ide');
    var ext             = require('core/ext');
    var util            = require('core/util');
    var dock            = require('ext/dockpanel/dockpanel');
    var editors         = require('ext/editors/editors');
    var markup          = require('text!ext/livecoffee/livecoffee.xml');
    var settings        = require('text!ext/livecoffee/settings.xml');
    var extSettings     = require("ext/settings/settings");
    var CoffeeScript    = require('ext/livecoffee/vendor/coffeescript');
    
    
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
      
        livecoffee: function() {
            //ext.initExtension(this);
            
            var _self = this;
            var editor = editors.currentEditor;
            
            var matchLine = extSettings.model.queryValue("livecoffee/livecoffee/@matchLines") == "true" ? true : false;
            editor.ceEditor.addEventListener('keyup', function() {
                _self.compile();
            });
            editor.ceEditor.$ext.addEventListener('click', function() {
                if (matchLine) {
                    livecoffeeCode.firstChild.$editor.gotoLine(editor.ceEditor.line);
                }
            });
        },
      
        compile: function() {
            var _self = this;
            var editor = editors.currentEditor;
            console.log(editor);
            var doc = editor.getDocument();
            var value = doc.getValue();
        
            var matchLine = extSettings.model.queryValue("livecoffee/livecoffee/@matchLines") == "true" ? true : false;
            var compileBare = extSettings.model.queryValue("livecoffee/livecoffee/@compileBare") == "true" ? true : false;
            var compileNodes = extSettings.model.queryValue("livecoffee/livecoffee/@compileNodes") == "true" ? true : false;
            var compileTokens = extSettings.model.queryValue("livecoffee/livecoffee/@compileTokens") == "true" ? true : false;
            
            try {
                var compiledJS = CoffeeScript.compile(value, {
                    bare: compileBare
                });
                
                livecoffeeCode.firstChild.setValue(compiledJS);
                
                if (matchLine) {
                    livecoffeeCode.firstChild.$editor.gotoLine(editor.ceEditor.line);
                }
                if (compileNodes) {
                    livecoffeeNodes.firstChild.setValue(CoffeeScript.nodes(value));
                }
                if (compileTokens) {
                    livecoffeeTokens.firstChild.setValue(CoffeeScript.tokens(value));
                }
            } catch (exp) {
                livecoffeeCode.firstChild.setValue(exp.message);
            }
        },
      
        hook: function() {
            var _self = this;
            
            var sectionLiveCoffee = dock.getSection("livecoffee");
            
            dock.registerPage(sectionLiveCoffee, null, function() {
               ext.initExtension(_self);
               livecoffeeCode.firstChild.syntax = 'javascript';
               return livecoffeeCode;
            }, {
                primary: {
                    backgroundImage: "/static/style/images/debugicons.png",
                    defaultState: { x: -6, y: -217 },
                    activeState: { x: -6, y: -217 }
                }
            });
            dock.registerPage(sectionLiveCoffee, null, function() {
               ext.initExtension(_self);
               return livecoffeeNodes;
            }, {
                primary: {
                    backgroundImage: "/static/style/images/debugicons.png",
                    defaultState: { x: -6, y: -217 },
                    activeState: { x: -6, y: -217 }
                }
            });
            dock.registerPage(sectionLiveCoffee, null, function() {
               ext.initExtension(_self);
               return livecoffeeTokens;
            }, {
                primary: {
                    backgroundImage: "/static/style/images/debugicons.png",
                    defaultState: { x: -6, y: -217 },
                    activeState: { x: -6, y: -217 }
                }
            });
            
            this.hotitems.livecoffee = [this.nodes[1]];
            
            ide.addEventListener("init.ext/settings/settings", function(e) {
                e.ext.addSection("livecoffee", _self.name, "livecoffee", function() {});
                barSettings.insertMarkup(settings);
            });
        },
      
        init: function(amlNode) {
            this.livecoffee();
        },
      
        enable: function() {
            ext.initExtension(this);
            
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
        }
    });
});