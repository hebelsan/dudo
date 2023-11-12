# Dudo
Dudo (Spanish for I doubt), also known as Cacho, Pico, Perudo, Liar's Dice, Cachito or Dadinho is a popular dice game played in South America.  
This is a browser adaption which lets you play the game with up to 12 players in one network.  
The game can be played in any browser since it runs on the react framework and adapts to any screen size.

## Screenshots
### start screen

<img width="501" alt="Screenshot 2023-11-13 at 00 36 42" src="https://github.com/hebelsan/dudo/assets/17873127/0ec99b1b-ce71-4b1e-b042-86cdda479597">

### lobby

<img width="1108" alt="Screenshot 2023-11-13 at 00 39 49" src="https://github.com/hebelsan/dudo/assets/17873127/742331c2-0c81-4585-b847-653f5cf68195">

### in game

<img width="1449" alt="Screenshot 2023-11-13 at 00 41 53" src="https://github.com/hebelsan/dudo/assets/17873127/b1b20912-f2b3-4227-833d-5b12dfa439ff">



# How to run
Debug mode:
```sh
(cd client && npm install)
(cd server && npm install)
make debug
```
Release mode:
```sh
(cd client && npm install)
(cd server && npm install)
export Port=5000
export HOST=$(e.g. YOUR_IP)
make release
```

