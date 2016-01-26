"use strict";
var size = 1000;
var cellSize = 20;

var grid = createGrid('wrapper', size, cellSize);

var N = size/cellSize;

var automata = createAutomata(N, 10, N*N,
    function(world, energyToDisperse, collisions) {
        var energyToAdd = Math.floor(energyToDisperse/collisions);
        for(var i = 0; i < N; i++) {
            for (var j = 0; j < N; j++) {
                var specimensInCell = 0;
                for (var specimenId in world[i][j].specimens) {
                    if (world[i][j].specimens.hasOwnProperty(specimenId)) {
                        specimensInCell +=1;
                    }
                }
                if (specimensInCell < 2 ) continue;
                for (var specimenId in world[i][j].specimens) {
                    if (world[i][j].specimens.hasOwnProperty(specimenId)) {
                        world[i][j].specimens[specimenId] += Math.floor(energyToAdd);
                    }
                }
            }
        }

        return energyToDisperse - energyToAdd * collisions;
    });



var interval = setInterval(function() {
    automata.step(function(state, step, accEnergy) {
        if (step % 10 === 0) grid.draw(state);
        if(accEnergy === N*N) {
            console.log("Step no. " + step);
            clearInterval(interval);
        }
    })
},0);

//$(document).keypress(function(e) {
//    if(e.which == 32) {
//        automata.step(grid.draw);
//    }
//});


