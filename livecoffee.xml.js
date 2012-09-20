// Wrapped in JavaScript, to avoid cross-origin restrictions, created using wrap-in-js.sh
define(function() {
return '<a:application xmlns:a="http://ajax.org/2005/aml">\n' +
'    <a:window\n' +
'      id = "liveCoffeeOutput"\n' +
'      title = "LiveCoffee"\n' +
'      center = "true"\n' +
'      modal = "false"\n' +
'      buttons = "close"\n' +
'      kbclose = "true"\n' +
'      width = "800"\n' +
'      height = "500">\n' +
'        <a:tab id="liveCoffeeTabs" height="415">\n' +
'            <a:page id="liveCoffeeCoffeeScript" caption="CoffeeScript Output">\n' +
'                <a:codeeditor\n' +
'                    id="liveCoffeeCodeOutput"\n' +
'                    flex="1"\n' +
'                    realtime="true"\n' +
'                    border="0"\n' +
'                    showprintmargin="false"\n' +
'                    printmargincolumn="0"\n' +
'                    width="780"\n' +
'                    height="340" />\n' +
'                    <a:divider />\n' +
'                    <a:hbox pack="start" padding="5" edge="10 10 5 10">\n' +
'                        <a:label for="liveCoffeeOptMatchLines">Approx. Line Match</a:label>\n' +
'                        <a:checkbox id="liveCoffeeOptMatchLines" />\n' +
'                        \n' +
'                        <a:label for="liveCoffeeOptCompileBare">Compile Bare?</a:label>\n' +
'                        <a:checkbox id="liveCoffeeOptCompileBare" />\n' +
'                        \n' +
'                        <a:label for="liveCoffeeOptCompileNodes">Compile Nodes?</a:label>\n' +
'                        <a:checkbox id="liveCoffeeOptCompileNodes" />\n' +
'                        \n' +
'                        <a:label for="liveCoffeeOptCompileTokens">Compile Tokens?</a:label>\n' +
'                        <a:checkbox id="liveCoffeeOptCompileTokens" />\n' +
'                    </a:hbox>\n' +
'            </a:page>\n' +
'            <a:page id="liveCoffeeNodes" caption="Nodes">\n' +
'                <a:textarea\n' +
'                    id="liveCoffeeNodeOutput"\n' +
'                    flex="1"\n' +
'                    realtime="true"\n' +
'                    border="0"\n' +
'                    showprintmargin="false"\n' +
'                    printmargincolumn="0"\n' +
'                    width="780"\n' +
'                    height="350" />\n' +
'            </a:page>\n' +
'            <a:page id="liveCoffeeTokens" caption="Tokens">\n' +
'                <a:textarea\n' +
'                    id="liveCoffeeTokenOutput"\n' +
'                    flex="1"\n' +
'                    realtime="true"\n' +
'                    border="0"\n' +
'                    showprintmargin="false"\n' +
'                    printmargincolumn="0"\n' +
'                    width="780"\n' +
'                    height="350" />\n' +
'            </a:page>\n' +
'        </a:tab>\n' +
'        <a:button onclick="require(\'core/ext\').extLut[\'ext/livecoffee/livecoffee\'].closeCodeOutput()">Close</a:button>\n' +
'    </a:window>\n' +
'</a:application>\n' +
'';});
