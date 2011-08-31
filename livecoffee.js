/**
 * Live Coffee dock module
 *
 * @copyright 2010 Tane Piper
 * @author Tane Piper <piper.tane@gmail.com>
 */

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
      
        livecoffee: function(editor) {
            console.log(editor);
            var _self = this;

            var matchLine = extSettings.model.queryValue("livecoffee/livecoffee/@matchLines") == "true" ? true : false;
            
            editor.ceEditor.addEventListener('keydown', function() {
                _self.compile(editor.getDocument());
            });
            editor.ceEditor.$ext.addEventListener('click', function() {
              if (matchLine) {
                  livecoffeeCode.firstChild.$editor.gotoLine(editor.ceEditor.line);
              }
            });
        },
      
        compile: function(doc) {
            var _self = this;
            var value = doc.getValue();
        
            var matchLine = extSettings.model.queryValue("livecoffee/livecoffee/@matchLines") == "true" ? true : false;
            var compileBare = extSettings.model.queryValue("livecoffee/livecoffee/@compileBare") == "true" ? true : false;
            var compileNodes = extSettings.model.queryValue("livecoffee/livecoffee/@compileNodes") == "true" ? true : false;
            var compileTokens = extSettings.model.queryValue("livecoffee/livecoffee/@compileTokens") == "true" ? true : false;
  
            var output;
  
            try {
                output = CoffeeScript.compile(value, {bare: compileBare});
            } catch (exp) {
                output = exp.message;
            }
            livecoffeeCode.firstChild.setValue(output);
  
            if (compileNodes) {
                livecoffeeNodes.firstChild.setValue(CoffeeScript.nodes(value));
            }
            if (compileTokens) {
                livecoffeeTokens.firstChild.setValue(CoffeeScript.tokens(value));
            }
        },
      
        hook: function() {
            var _self = this;

            ide.addEventListener("afteropenfile", function(e) {
              _self.livecoffee(editors.currentEditor);
            });
            
            var name = "ext/livecoffee/livecoffee";
            
            dock.addDockable({
                hidden: false,
                buttons : [
                    { caption: "Live Code", ext : [name, "livecoffeeCode"] },
                    { caption: "CoffeeScript Nodes", ext : [name, "livecoffeeNodes"] },
                    { caption: "CoffeeScript Tokens", ext : [name, "livecoffeeTokens"] },
                ] 
            });
            
            dock.register(name, 'livecoffeeCode', {
                menu : "Live Coffee/Live Code",
                primary : {
                    backgroundImage: "/static/ext/livecoffee/img/livecoffee.png",
                    defaultState: { x: -6, y: -10 },
                    activeState: { x: -6, y: -10 },
                }
            }, function(type) {
                ext.initExtension(_self);
                return livecoffeeCode;
            });
            
            dock.register(name, 'livecoffeeNodes', {
                menu : "Live Coffee/CoffeeScript Nodes",
                primary : {
                    backgroundImage: "/static/ext/livecoffee/img/livecoffee.png",
                    defaultState: { x: -6, y: -80 },
                    activeState: { x: -6, y: -80 },
                }
            }, function(type) {
                ext.initExtension(_self);
                return livecoffeeNodes;
            });
            
            dock.register(name, 'livecoffeeTokens', {
                menu : "Live Coffee/CoffeeScript Tokens",
                primary : {
                    backgroundImage: "/static/ext/livecoffee/img/livecoffee.png",
                    defaultState: { x: -6, y: -80 },
                    activeState: { x: -6, y: -80 },
                }
            }, function(type) {
                ext.initExtension(_self);
                return livecoffeeTokens;
            });
            
            this.hotitems.livecoffee = [this.nodes[1]];
            
            ide.addEventListener("init.ext/settings/settings", function(e) {
                e.ext.addSection("livecoffee", _self.name, "livecoffee", function() {});
                barSettings.insertMarkup(settings);
            });
        },
      
        init: function(amlNode) {
            //this.livecoffee();
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
