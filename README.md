# Multiplayer-RPG
Base code was downloaded from: [Rawkes](http://rawkes.com/articles/creating-a-real-time-multiplayer-game-with-websockets-and-node.html) (After following the tutorial)        
Credit to the sprite maker: [Reddit Page](https://www.reddit.com/r/PixelArt/comments/23m4hs/ocwipcc_some_rpgdungeon_crawler_sprites_im/) (Some tweaks were made for sizing)

#### TODO
- Make player face movement direction
- Add enemies 
- Add screen prompting you to enter the ip
- Disallow player movement before connection to the server is established
- More textures more awesome

*Sorry for the huge gifs!*

**Original Game: (It did have multiple squares, but I broke something)**
![](/ReadmeStuff/Orig.gif)


**Current Game: (Works across multiple computers)**
![](/ReadmeStuff/Game.gif)

**Creating The Main Server:**     
First you have to run the main server, this connects all of the clients and handles most of the data transfer.

Navigate to the main folder (containing the readme file) and type

    node game.js

You should then get a message along the lines of        

    socket.io started

*TroubleShooting*
Socket.io might not be correctly installed, if not type.      
Note: *The newest version of socket.io doesn't appear to work*

    npm install socket.io@0.7

**Creating The Client:**    
This can be done one of two ways, the first is to simply open the index.html file located in the 'public' directory.

The second is to set up a server clients can connect to. This can be achieved by navigating to the public directory of the project folder in terminal. Then typing:

    python -m SimpleHTTPServer 8080

Now connecting to your localhost (or IP or you can port-forward) and specifying the port :8080 (:8000 takes you to the socket.io server) should give you the client page.
