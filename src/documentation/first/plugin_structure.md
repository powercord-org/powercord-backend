# Plugin Structure

Basic plugin example:
```js
const { Plugin } = require('powercord/entities');
module.exports = class ExamplePlugin extends Plugin {
    startPlugin() { // Called on load (can be async)
        this.registerCommand(
        "example", // Command name
        [], // Aliases (String Array)
        "Example Command", // Description
        "{c}", // Usage (unused as of now)
        (args) => ({ // Function to call when used (can be a function, args is a string array)
            send: true, // Send in chat?
            result: getResult(args) // Result (Can be a function or string)
        }));
    }
    
    getResult(args) {
        return `Arguments: ${args.join(" ")}`;
    }
       
    pluginWillUnload() { // Called when plugin is being unloaded
        this.call("Unload Called"); // Put your uninjects and stuff here
    }
}
```
