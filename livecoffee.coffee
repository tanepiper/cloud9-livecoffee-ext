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
                bare = @coffeeoptBare.checked
                compiledJS = CoffeeScript.compile value, {bare}
                @coffeeCode.setValue compiledJS
                
                if @coffeeoptMatchLines.checked
                    @coffeeCode.$editor.gotoLine editor.ceEditor.line
                
                if @coffeeoptNodes.checked
                    @coffeeNodes.setValue CoffeeScript.nodes value
                    
                if @coffeeoptTokens.checked
                    @coffeeTokens.setValue CoffeeScript.tokens value
                
                return
            catch exp
                @coffeeCode.setValue exp.message
                return
        
        hook: () ->
            @nodes.push ide.mnuEdit.appendChild new apf.divider()
            @nodes.push ide.mnuEdit.appendChild new apf.item
                caption: 'View CoffeeScript Output'
                onclick: () =>
                    ext.initExtension @
                    @compile()
                    @coffeeOutput.show()
                    if @coffeeOutput.visible
                        editor = editors.currentEditor
                        editor.ceEditor.addEventListener 'keyup', () =>
                            @compile()
                    
                    return

            @hotitems.livecoffee = [@nodes[0]]
            return
            
        init: (amlNode) ->
            
            coffeeoptBare.addEventListener 'click', () =>
                @compile()
            @coffeeoptBare = coffeeoptBare
                
            coffeeoptNodes.addEventListener 'click', () =>
                console.log arguments
                if coffeeoptNodes.checked
                    @coffeeNodeView.enable()
                    @compile()
                else
                    coffeeoptNodes.disable()
            @coffeeoptNodes = coffeeoptNodes  
                
            coffeeoptTokens.addEventListener 'click', () =>
                if coffeeoptTokens.checked
                    @coffeeTokenView.enable()
                    @compile()
                else
                    @coffeeTokenView.disable()
            @coffeeoptTokens = coffeeoptTokens
                
            @coffeeoptMatchLines = coffeeoptMatchLines
            
            coffeeCode.syntax = 'javascript'
            @coffeeCode = coffeeCode
            @coffeeOutput = coffeeOutput
            
        
            coffeeNodeView.disable()
            @coffeeNodeView = coffeeNodeView
            @coffeeNodes = coffeeNodes
            
            coffeeTokenView.disable()
            @coffeeTokenView = coffeeTokenView
            @coffeeTokens = coffeeTokens
            
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