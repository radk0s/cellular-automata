"use strict";
var size = 1024;
var cellSize = 32;

var grid = createGrid('wrapper', size, cellSize);

var N = size/cellSize;

var automata = createAutomata(N, 248, N*N);

$(document).keypress(function(e) {
    if(e.which == 32) {
        automata.step(grid.draw);
    }
});


