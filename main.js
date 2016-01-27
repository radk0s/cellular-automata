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

    var size = parseInt($('input[name="grid_size"]').val()) || 700;
    var cellSize = parseInt($('input[name="cell_size"]').val()) || 25;

    var specimens = parseInt($('input[name="specimens_number"]').val()) || 50;

    runAutomata(size, cellSize, specimens, disperse_type, collision_scenario)
        .run()
        .then(function(steps) {
            console.log('Steps to distinct' + steps)
        });
})

function runAutomata(size, cellSize, specimens, disperese_type, collision_scenario) {
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
        run: function(stepOffset) {
            var delay = $('input[name="step_delay"]').val() || 20;
            return new Promise(function(resolve, reject) {
                var interval = setInterval(function() {
                    automata.step(function (state, step, accEnergy) {
                        $('#accumulator').html(accEnergy);
                        $('#steps').html(step);

                        if (step % (stepOffset || 1) === 0) grid.draw(state);
                        if (accEnergy === N * N) {
                            resolve(step);
                            clearInterval(interval);
                        }
                    });
                },delay);
            });
        }
    }

}


//$(document).keypress(function(e) {
//    if(e.which == 32) {
//        automata.step(grid.draw);
//    }
//});


