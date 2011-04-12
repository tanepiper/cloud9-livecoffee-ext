Cloud9 Live CoffeeScript Extension
==================================

This live CoffeeScript extension for Cloud9 provides a window view of the live
formatted JavaScript output of a CoffeeScript file as you type.

The window provided has the option to view the output with bare compiling (i.e
not closure) on or off via a checkbox.

Installation
------------
    git clone git://github.com/tanepiper/cloud9-livecoffee-ext.git cloud9/client/ext/livecoffee

Open the `Windows -> Extension Manager` window, put the path to the extension in
    ext/livecoffee/livecoffee

Click add.  You can now view the window via the Edit menu.

Shortcut Keys & Command
-----------------------
This extension comes with the `livecoffee` command that you can type into the
command area to launch the window.

You can also add shortcut keys to your `ext/keybindings_default` files.  Edit
`default_win.js` or `default_mac.js` depending on your platform.  To enable
it add the following:

    return keys.onLoad({
        "ext" : {
            "livecoffee": {
                "livecoffee": "Ctrl-Shift-K"   
            }
        }
    })

For the Mac, use `Command-Option-K`, or choose your own key shortcuts.

Author: Tane Piper <piper.tane@gmail.com>

Thanks to Matt Pardee for helping solve the key and command issues.