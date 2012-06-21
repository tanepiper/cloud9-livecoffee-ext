# TODO intercept tab change, then compile!!!!!

define (require, exports, module) ->
    ide = require 'core/ide'
    ext = require 'core/ext'
    util = require 'core/util'
    editors = require 'ext/editors/editors'
    markup = require 'text!ext/livecoffee/livecoffee.xml'
    menus = require "ext/menus/menus" 
    commands = require "ext/commands/commands"
    CoffeeScript = require 'ext/livecoffee/vendor/coffeescript'
    console.log CoffeeScript
    lineMatching = require 'ext/livecoffee/vendor/cs_js_source_mapping'
    console.log lineMatching
    css = require "text!ext/livecoffee/livecoffee.css"
    
    DIVIDER_POSITION = 2100
    MENU_ENTRY_POSITION = 2200
    CSS_CLASS_NAME = "livecoffee-highlight"
    
    module.exports = ext.register 'ext/livecoffee/livecoffee',
        name: 'LiveCoffee'
        dev: 'Tane Piper'
        type: ext.GENERAL
        alone: yes
        markup: markup
        commands:
            'livecoffee': hint: 'Compile the current coffeescript document'
        hotitems : {}
        nodes: []
        css: css

        hook: () ->
            _self = @
            commands.addCommand(
                name: "livecoffee"
                hint: "start livecoffee plugin"
                bindKey: 
                    mac: "Command-K"
                    win: "Ctrl-K"
                exec: -> _self.livecoffee()
            )
            @nodes.push menus.addItemByPath("Edit/~", new apf.divider(), DIVIDER_POSITION)
            @nodes.push menus.addItemByPath("Edit/LiveCoffee", new apf.item({command: "livecoffee"}), MENU_ENTRY_POSITION)

            @hotitems['livecoffee'] = [@nodes[1]]
            return
                
        livecoffee: () ->
            ext.initExtension @
            @compile()
            @liveCoffeeOutput.show()
            if @liveCoffeeOutput.visible
                editor = editors.currentEditor
                aceEditor = editor.amlEditor.$editor
                liveCoffeeEditor = @liveCoffeeCodeOutput.$editor
                editor.ceEditor.addEventListener 'keyup', () =>
                    @compile()
                aceEditor.addEventListener 'click', () =>
                    if @liveCoffeeOptMatchLines.checked
                        @highlightBlockFromCoffee()
                liveCoffeeEditor.addEventListener 'click', () =>
                    if @liveCoffeeOptMatchLines.checked
                        @highlightActualBlock aceEditor
                        
            return

        compile: () ->
            editor = editors.currentEditor
            aceEditor = editor.amlEditor.$editor
            doc = editor.getDocument()
            value = doc.getValue()
            compiledJS = ''
            try
                bare = @liveCoffeeOptCompileBare.checked
                compiledJS = CoffeeScript.compile value, {bare}
                @matchingLines = lineMatching.source_line_mappings value.split("\n"), compiledJS.split("\n")
                @liveCoffeeCodeOutput.setValue compiledJS
                
                if @liveCoffeeOptMatchLines.checked
                   @highlightActualBlock aceEditor 
                
                if @liveCoffeeOptCompileNodes.checked
                    @liveCoffeeNodeOutput.setValue CoffeeScript.nodes value
                    
                if @liveCoffeeOptCompileTokens.checked
                    @liveCoffeeTokenOutput.setValue CoffeeScript.tokens value
                
                return
            catch exp
                @liveCoffeeCodeOutput.setValue exp.message
                return

        findMatchingBlocks: (lineNumber, matchingLines) ->
            matchingBlocks = {}
            for line in matchingLines
                if lineNumber < line[0]
                    # some counting weirdnes therefore ++
                    matchingBlocks["js_end"] = line[1]
                    matchingBlocks["coffee_end"] = line[0]
                    return matchingBlocks
                matchingBlocks["coffe_start"] = line[0]
                matchingBlocks["js_start"] = line[1]
        
        # Gets the current line of the main editor (with CoffeeScript code)
        # and highlights the matching block in the compiled JavaScript output        
        highlightBlockFromCoffee: (aceEditor) ->
            @removeHighlightedBlocks()

            currentLine = @getAceEditor().getCursorPosition().row
            matchingBlocks = @findMatchingBlocks currentLine, @matchingLines
            liveCoffeeEditor = @liveCoffeeCodeOutput.$editor
            liveCoffeeEditor.gotoLine matchingBlocks["js_start"]+1
            
            @decorateBlocks matchingBlocks
            
                
        removeHighlightedBlocks: ->
            if @decoratedLines?
                for lineNumber in @decoratedLines["js"]
                    @getLiveCoffeeEditor().renderer.removeGutterDecoration lineNumber, CSS_CLASS_NAME
                for lineNumber in @decoratedLines["coffee"]
                    @getAceEditor().renderer.removeGutterDecoration lineNumber, CSS_CLASS_NAME
                    
        decorateBlocks: (matchingBlocks) ->
            @decoratedLines = 
            	js: [matchingBlocks["js_start"]...matchingBlocks["js_end"]]
            	coffee: [matchingBlocks["coffe_start"]...matchingBlocks["coffee_end"]]
            	
            for lineNumber in @decoratedLines["js"]
                @getLiveCoffeeEditor().renderer.addGutterDecoration lineNumber, CSS_CLASS_NAME
            for lineNumber in @decoratedLines["coffee"]
                @getAceEditor().renderer.addGutterDecoration lineNumber, CSS_CLASS_NAME
            
        getAceEditor: ->
            editor = editors.currentEditor
            aceEditor = editor.amlEditor.$editor
            
        getLiveCoffeeEditor: ->
            @liveCoffeeCodeOutput.$editor
           
        init: (amlNode) ->
            apf.importCssString(css);
            
            liveCoffeeOptCompileBare.addEventListener 'click', () =>
                @compile()
            @liveCoffeeOptCompileBare = liveCoffeeOptCompileBare
                
            liveCoffeeOptCompileNodes.addEventListener 'click', () =>
                if liveCoffeeOptCompileNodes.checked
                    @liveCoffeeNodes.enable()
                    @compile()
                else
                    liveCoffeeNodes.disable()
            @liveCoffeeOptCompileNodes = liveCoffeeOptCompileNodes  
                
            liveCoffeeOptCompileTokens.addEventListener 'click', () =>
                if liveCoffeeOptCompileTokens.checked
                    @liveCoffeeTokens.enable()
                    @compile()
                else
                    @liveCoffeeTokens.disable()
            @liveCoffeeOptCompileTokens = liveCoffeeOptCompileTokens
                
            @liveCoffeeOptMatchLines = liveCoffeeOptMatchLines
            
            liveCoffeeCodeOutput.syntax = 'javascript'
            @liveCoffeeCodeOutput = liveCoffeeCodeOutput
            @liveCoffeeOutput = liveCoffeeOutput
            
            liveCoffeeNodes.disable()
            @liveCoffeeNodes = liveCoffeeNodes
            @liveCoffeeNodeOutput = liveCoffeeNodeOutput
            
            liveCoffeeTokens.disable()
            @liveCoffeeTokens = liveCoffeeTokens
            @liveCoffeeTokenOutput = liveCoffeeTokenOutput
            
            return

        enable : () ->
            @nodes.each (item) ->
                item.enable()
                
            @disabled = false

        disable: () ->
            @nodes.each (item) ->
                item.disable()
                
            @disabled = true
                        
        destroy : () ->
            @nodes.each (item) ->
                item.destroy true, true
                return
            @nodes = [];
            
            @liveCoffeeOptCompileBare.destroy true, true
            @liveCoffeeOptCompileNodes.destroy true, true
            @liveCoffeeOptCompileTokens.destroy true, true
            @liveCoffeeOptMatchLines.destroy true, true
            @liveCoffeeCodeOutput.destroy true, true
            @liveCoffeeOutput.destroy true, true
            @liveCoffeeNodes.destroy true, true
            @liveCoffeeNodeOutput.destroy true, true
            @liveCoffeeTokens.destroy true, true
            @liveCoffeeTokenOutput.destroy true, true
            return
        
        closeCodeOutput: () ->
            @liveCoffeeOptMatchLines.uncheck()
            @removeHighlightedBlocks()
            @liveCoffeeOutput.hide()
