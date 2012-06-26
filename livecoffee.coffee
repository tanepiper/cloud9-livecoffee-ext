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
    lineMatching = require 'ext/livecoffee/vendor/cs_js_source_mapping'
    css = require "text!ext/livecoffee/livecoffee.css"
    
    DIVIDER_POSITION        = 2100
    MENU_ENTRY_POSITION     = 2200
    CSS_CLASS_NAME          = "livecoffee-highlight"
    OPEN_FILE_TIMEOUT       = 150
    OPEN_LIVECOFFEE_TIMEOUT = 70
    
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
                        @highlightBlockFromJS()
                        
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
                matchingLines = lineMatching.source_line_mappings value.split("\n"), compiledJS.split("\n")
                @matchingBlocks = @convertMatchingLines(matchingLines)
                @liveCoffeeCodeOutput.setValue compiledJS
                
                if @liveCoffeeOptMatchLines.checked
                   @highlightBlockFromCoffee()
                
                if @liveCoffeeOptCompileNodes.checked
                    @liveCoffeeNodeOutput.setValue CoffeeScript.nodes value
                    
                if @liveCoffeeOptCompileTokens.checked
                    @liveCoffeeTokenOutput.setValue CoffeeScript.tokens value
                
                return
            catch exp
                @liveCoffeeCodeOutput.setValue exp.message
                return
        
        # The output from the line matcher isn't totally human readable 
        # so we make a little conversion with objects   
        convertMatchingLines: (matchingLines) ->
            matchingBlocks = 
                fromCoffee: {}
                fromJS: {}
            # I am sorry for this while loop
            for i in [0...matchingLines.length - 1]
                current_line = matchingLines[i]
                next_line = matchingLines[i+1] 
                block = @createBlock(current_line, next_line)
                matchingBlocks = @mapLinesToBlocks(block, matchingBlocks)
            
            matchingBlocks
                
        createBlock:(currentLine, nextLine) ->
            # new line mappings are a bit difficult 
            if currentLine[1] == nextLine[1]
              jsStart = currentLine[1] - 1
              jsEnd = currentLine[1] - 1
            else
              jsStart = currentLine[1]
              jsEnd = nextLine[1] - 1
        
            # lines get adjusted by + 1 because the library starts counting at 0
            coffee_start: currentLine[0]
            coffee_end: nextLine[0] - 1
            js_start: jsStart
            js_end: jsEnd
            
        mapLinesToBlocks: (block, matchingBlocks) ->
            for coffeeLine in [block.coffee_start..block.coffee_end]
                matchingBlocks.fromCoffee[coffeeLine] = block
            for jsLine in [block.js_start..block.js_end]
                matchingBlocks.fromJS[jsLine] = block
            
            matchingBlocks
            
        # Gets the current line of the main editor (with CoffeeScript code)
        # and highlights the matching block in the compiled JavaScript output        
        highlightBlockFromCoffee: ->
            @removeHighlightedBlocks()
            matchingBlock = @getMatchingBlockFromCoffee()
            @adjustLiveCoffeeCursor matchingBlock
            @decorateBlocks matchingBlock
            
        # Gets the current line of the liveCoffee Output (compiled JS)
        # and highlights the matching block in the CoffeeScript main editor       
        highlightBlockFromJS: (line = null) ->
            @removeHighlightedBlocks()
            if line?
                console.log @matchingBlocks
                console.log line
                matchingBlock = @matchingBlocks.fromJS[line]
                console.log matchingBlock
                # evil knievel TODO but sometimes it seems to be null
                return unless matchingBlock?
                @adjustLiveCoffeeCursor matchingBlock
            else
                matchingBlock = @getMatchingBlockFromJS()
            @adjustEditorCursor matchingBlock
            @decorateBlocks matchingBlock
            
                
        removeHighlightedBlocks: ->
            if @decoratedLines?
                for jsLineNumber in @decoratedLines.js
                    @getLiveCoffeeEditor().renderer.removeGutterDecoration jsLineNumber, CSS_CLASS_NAME
                for coffeeLineNumber in @decoratedLines.coffee
                    @getAceEditor().renderer.removeGutterDecoration coffeeLineNumber, CSS_CLASS_NAME
                    
        getMatchingBlockFromCoffee: ->
            currentLine = @getAceEditor().getCursorPosition().row
            matchingBlock = @matchingBlocks.fromCoffee[currentLine]
            
        getMatchingBlockFromJS: ->
            currentLine = @getLiveCoffeeEditor().getCursorPosition().row
            matchingBlock = @matchingBlocks.fromJS[currentLine]
            
        adjustLiveCoffeeCursor: (matchingBlock) ->
            @getLiveCoffeeEditor().gotoLine matchingBlock.js_start + 1
            
        adjustEditorCursor: (matchingBlock) ->
            @getAceEditor().gotoLine matchingBlock.coffee_start + 1
                    
        decorateBlocks: (matchingBlock) ->
            @decoratedLines =
                js: [matchingBlock.js_start..matchingBlock.js_end]
                coffee: [matchingBlock.coffee_start..matchingBlock.coffee_end]
            for jsLineNumber in @decoratedLines.js
                @getLiveCoffeeEditor().renderer.addGutterDecoration jsLineNumber, CSS_CLASS_NAME
            for coffeeLineNumber in @decoratedLines.coffee
                # -1 adjustment for the editor
                @getAceEditor().renderer.addGutterDecoration coffeeLineNumber, CSS_CLASS_NAME
            
        getAceEditor: ->
            editor = editors.currentEditor
            aceEditor = editor.amlEditor.$editor
            
        getLiveCoffeeEditor: ->
            @liveCoffeeCodeOutput.$editor
           
        init: (amlNode) ->
            apf.importCssString(css);
            
            liveCoffeeOptMatchLines.addEventListener 'click', () =>
                if liveCoffeeOptMatchLines.checked
                    @highlightBlockFromCoffee() 
                else
                    @removeHighlightedBlocks()
            @liveCoffeeOptMatchLines = liveCoffeeOptMatchLines
            
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
            
        show: (node, line = 0, column = 0) ->
            ide.dispatchEvent('openfile', {doc: ide.createDocument(node)})
            line = line - 1 # adjustment from 1-based external format to 0-based internal
            setTimeout (=> @startLiveCoffee(line)), OPEN_FILE_TIMEOUT
                
        startLiveCoffee: (line) ->
            if @liveCoffeeOutput?.visible
                @compile()
            else
                @livecoffee()
            @liveCoffeeOptMatchLines.check()
            setTimeout (() => @highlightBlockFromJS line), OPEN_LIVECOFFEE_TIMEOUT
            
            
