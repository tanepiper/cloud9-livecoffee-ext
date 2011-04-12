define((require, exports, module) ->
    ide = require 'core/ide'
    ext = require 'core/ext'
    util = require 'core/util'
    editors = require 'ext/editors/editors'

    markup = require 'text!ext/livecoffee/livecoffee.xml'
    CoffeeScript = require 'ext/livecoffee/coffeescript'
    
    return ext.register 'ext/livecoffee/livecoffee',
        name: 'Live CoffeeScript'
        dev: 'Tane Piper'
        type: ext.GENERAL
        alone: yes
        markup: markup
        
        commands:
            "livecoffee": hint: "Compile the current coffeescript document"
        
        hotitems : {}

        nodes: []
        
        compile: () ->
            editor = editors.currentEditor
            doc = editor.getDocument()
            value = doc.getValue()
            
            compiledJS = ''
            try
                compiledJS = CoffeeScript.compile value, bare: on
                @coffeeCode.setValue compiledJS
                return
            catch exp
                util.alert exp.message
                return
        
        hook: () ->
            @nodes.push ide.mnuEdit.appendChild new apf.divider()
            @nodes.push ide.mnuEdit.appendChild new apf.item
                caption: 'View CoffeeScript Output'
                onclick: () =>
                    ext.initExtension @
                    @compile()
                    @coffeeOutput.show()
                    
                    editor = editors.currentEditor
                    editor.keyup () =>
                        @compile()
                    
                    return

            @hotitems["livecoffee"] = [@nodes[0]]
            return
                    
        init: (amlNode) ->
            @coffeeStatusOutput = coffeeStatusOutput
            @coffeeCode = coffeeCode
            @coffeeOutput = coffeeOutput
            return
            
        enable : () ->
            @nodes.each (item) ->
                item.enable()
                return
            return
        
        disable: () ->
            @nodes.each (item) ->
                item.disable()
                return
            return
                    
        destroy : () ->
            @nodes.each (item) ->
                item.destroy true, true
                return
        
            @nodes = [];
            @coffeeOutput.destroy true, true
            return
)