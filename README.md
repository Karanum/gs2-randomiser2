# Golden Sun: The Lost Age Randomiser 2
Rework of the original GS:TLA randomiser, now in a handy web-based format

Special thanks to MarvinXLII, who created the original randomiser, and Teawater and Salanewt, who have thoroughly documented the game itself.

## Info for Players
If you're just looking to play the randomiser, you can find it over at https://gs2randomiser.com. You can report bugs and request features in the Issue Tracker: https://github.com/Karanum/gs2-randomiser2/issues. Other than that, this place is mainly for development purposes so you shouldn't have to worry about it.

## Requirements
NodeJS is required to run this application, with v12.x or above being recommended. In addition, NPM is used to install dependencies.

## Installation and running
Navigate to this directory with the terminal/shell of your choice and run `npm install` to install dependencies.
Next, acquire an unmodified ROM file of Golden Sun: The Lost Age and add this to the `randomiser/rom` directory and follow the instructions in the `readme.txt` file there.

The application can then be run with `node app.js`. The application will be running on port 3000 by default.

After running the application for the first time, the file `config.json` will be generated in this directory. This can be used to change the default port, as well as configure HTTPS for the server which allows it to accept secure connections.
