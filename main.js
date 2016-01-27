"use strict";
var disperse_type = 'equal';
var collision_scenario = 'norm';

$("input:radio[name=disperse_type]").click(function() {
    disperse_type = $(this).val();
});

$("input:radio[name=collision_scenario]").click(function() {
    collision_scenario = $(this).val();
});

$("button#start_simulation").click(function() {

    prepareAutomata(size, cellSize, specimens)
})

function prepareAutomata(size, cellSize, specimens, disperese_type, collision_scenario) {
    var grid = createGrid('wrapper', size, cellSize);
    var N = size/cellSize;

    var collision;

    switch(collision_scenario) {
        case 'norm': {
            collision = function(world, energyToDisperse, collisions) {
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
            };
            break;
        }
    }

    var automata = createAutomata(N, specimens, N*N,collision);
    var accumulator = 0;


    return {
        run: function() {
            var interval = setInterval(function() {
                automata.step(function (state, step, accEnergy) {
                    console.log(accEnergy);
                    $('#accumulator').html(accEnergy);
                    $('#steps').html(step);

                    if (step % 10 === 0) grid.draw(state);
                    if (accEnergy === N * N) {
                        console.log("Step no. " + step);
                        clearInterval(interval);
                    }
                });
            },50);
        }
    }

}


//$(document).keypress(function(e) {
//    if(e.which == 32) {
//        automata.step(grid.draw);
//    }
//});


