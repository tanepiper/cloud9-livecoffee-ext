define(function(require, exports, module) {

var ide          = require('core/ide');
var ext          = require('core/ext');
var util         = require('core/util');
var editors      = require('ext/editors/editors');
var markup       = require('text!ext/livecoffee/livecoffee.xml');
var CoffeeScript = require('ext/livecoffee/coffeescript');

return ext.register('ext/livecoffee/livecoffee', {
    name   : 'LiveCoffee',
    dev    : 'Tane Piper',
    type   : ext.GENERAL,
    alone  : true,
    markup : markup,

    commands : {
        "livecoffee": {hint: "Compile the current coffeescript document"}
    },

    hotitems : {},
    nodes    : [],

    hook : function() {
        var _self = this;

        this.nodes.push(ide.mnuEdit.appendChild(new apf.divider()));
        this.nodes.push(
            mnuEdit.appendChild(new apf.item({
                caption: 'LiveCoffee',
                onclick: function() {            
                    _self.livecoffee();
                }
            }))
        );
        
        this.hotitems["livecoffee"] = [this.nodes[1]];
    },

    livecoffee : function() {
        var editor;
        ext.initExtension(this);
        this.compile();
        this.liveCoffeeOutput.show();
        
        var _self = this;
        if (this.liveCoffeeOutput.visible) {
            editor = editors.currentEditor;
            editor.ceEditor.addEventListener('keyup', function() {
                return _self.compile();
            })
        }
    },
    
    compile : function() {
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

    init : function(amlNode) {
        var _self = this;

        liveCoffeeOptCompileBare.addEventListener('click', function() {
            return _self.compile();
        });

        this.liveCoffeeOptCompileBare = liveCoffeeOptCompileBare;

        liveCoffeeOptCompileNodes.addEventListener('click', function() {
            if (liveCoffeeOptCompileNodes.checked) {
                _self.liveCoffeeNodes.enable();
                return _self.compile();
            } else {
                return liveCoffeeNodes.disable();
            }
        });
        
        this.liveCoffeeOptCompileNodes = liveCoffeeOptCompileNodes;
        liveCoffeeOptCompileTokens.addEventListener('click', function() {
            if (liveCoffeeOptCompileTokens.checked) {
                _self.liveCoffeeTokens.enable();
                return _self.compile();
            } else {
                return _self.liveCoffeeTokens.disable();
            }
        });
        
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

    enable : function() {
        this.nodes.each(function(item) {
            item.enable();
        });
    },
    
    disable : function() {
        this.nodes.each(function(item) {
            item.disable();
        });
    },
    
    destroy : function() {
        this.nodes.each(function(item) {
            item.destroy(true, true);
        });

        this.nodes = [];
        this.liveCoffeeOutput.destroy(true, true);
    }
});

});