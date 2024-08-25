An implementation of a minesweeper game like this: https://minesweeperonline.com/

# Features
Basic minesweeper functions
start a new mine board with random mines position
left click to detect a mine
right click to mark a mine
mines counter
win or lose check
Users can customize the mine board

# Out of scope
timer
middle-click
keyboard support
mobile support
zoom
a11y
deployment


## How to get started

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.


# High level summary


* GameState contains the state
* GameEngine is the core logic to create and update state
  * // TODO: Move more of the logic from App.tsx into GameEngine.
* GridWorker.worker.ts is a worker that handles computationally expensive work to free up the browser's main thread so it can attend to rendering
* App.tsx: Contains the main rendering logic. It uses react-window to virtualize the grid for performance, snappiness and efficiency
  * // TODO: Break it up into more SOLID components

# Next iterations to be desired

* Support 10Kx10K by memory optimization and looking into using WebAssembly
