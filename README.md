# 5 in column.
## Rules
In order to win this game, you need to place colored chips in vertical lines.
There are colored indicators in top of the field. They show the color of the line that must be build under it.
Use arrows to move the focus frame around the field. Use shift + arrow to lock focus on chip and move them both.
You can move focus quite anywhere but focus with chip can be moved only to empty slots. There are permanently blocked slots where chips can not be moved to.
## Configuration
Game field configuration is stored in config.json. One can modify this file, but while doing so, one should keep in mind that game will check if this configuration is valid. Field should be larger then zero in every direction, can not be larger, then screen and game has to be winable.
## Play game
Game server can be started with the help of Node.js:
`node server.js`.
After that one could proceed to `localhost:8000` to play the game. Alternatively, server could be started with the help of python module http.server:
`python3 -m http.server`.
In this case one could enjoy the game on `localhost:8000/index.html`.