# Golden Sun: The Lost Age Randomiser 2
Rework of the original GS:TLA randomiser, now in a handy web-based format

Special thanks to MarvinXLII, who created the original randomiser, and Teawater and Salanewt, who have thoroughly documented the game itself.

## Info for Players
The randomiser is not yet ready for normal use. By following the instructions down below it is possible to run the randomiser and generate a playable ROM. However, many features are still missing and/or incomplete. If you are looking for the full experience, please wait until the official release.

## Requirements
NodeJS is required to run this application, with v12.x or above being recommended. In addition, NPM is used to install dependencies.

## Installation and running
Navigate to this directory with the terminal/shell of your choice and run `npm install` to install dependencies.
Next, acquire an unmodified ROM file of Golden Sun: The Lost Age and add this to the `randomiser/rom` directory and follow the instructions in the `readme.txt` file there.

The application can then be run with `node app.js`. The application will be running on port 3000.
