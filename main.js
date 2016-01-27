"use strict";
var disperse_type = 'equal';
var collision_scenario = 'norm';

$("input:radio[name=disperse_type]").click(function() {
    disperse_type = $(this).val();
});

$("input:radio[name=collision_scenario]").click(function() {
    collision_scenario = $(this).val();
});

var steps_distinct = [];


$("button#start_simulation").click(function() {

    var size = parseInt($('input[name="grid_size"]').val()) || 700;
    var cellSize = parseInt($('input[name="cell_size"]').val()) || 25;

    var specimens = parseInt($('input[name="specimens_number"]').val()) || 50;
    (function () {
        runAutomata(size, cellSize, specimens, disperse_type, collision_scenario)
            .run()
            .then(function(steps) {
                steps_distinct.push(steps);
                var sum = steps_distinct.reduce(function(sum, val) {
                    return sum + val;
                }, 0);

                $('#steps_extinction_avg').html((sum / steps_distinct.length).toFixed(2) + " (" + steps_distinct.length + " attempts)");
            });
    })();
});

$("button#reset_avg").click(function() {
    steps_distinct = [];
    $('#steps_extinction_avg').html('');
});

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
                                world[i][j].specimens[specimenId] += energyToAdd;
                            }
                        }
                    }
                }
                return energyToDisperse - energyToAdd * collisions;
            };
            break;
        }
        case 'bad': {
            collision = function(world, energyToDisperse, collisions) {
                var energyToAdd = Math.floor(energyToDisperse/collisions);
                var counter = 0;
                var total_best = 0;
                for(var i = 0; i < N; i++) {
                    for (var j = 0; j < N; j++) {
                        var specimensInCell = 0;
                        for (var specimenId in world[i][j].specimens) {
                            if (world[i][j].specimens.hasOwnProperty(specimenId)) {
                                specimensInCell +=1;
                            }
                        }
                        if (specimensInCell < 2 ) continue;
                        var max_energy = 0;
                        var best_specimen;
                        for (var specimenId in world[i][j].specimens) {
                            if (world[i][j].specimens.hasOwnProperty(specimenId)) {
                                if( max_energy <= world[i][j].specimens[specimenId]) {
                                    max_energy = world[i][j].specimens[specimenId];
                                    best_specimen = specimenId;
                                }
                                world[i][j].specimens[specimenId] += energyToAdd;
                            }
                        }
                        console.log(best_specimen, max_energy);

                        for (var specimenId in world[i][j].specimens) {
                            if (world[i][j].specimens.hasOwnProperty(specimenId)) {
                                if( specimenId != best_specimen) {
                                    world[i][j].specimens[specimenId] -= energyToAdd;
                                    world[i][j].specimens[best_specimen] += energyToAdd;

                                }
                            }
                        }
                    }
                }
                return energyToDisperse - energyToAdd * collisions;
            };
            break;
        }
        case 'vbad': {
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
                        var max_energy = 0;
                        var best_specimen;
                        for (var specimenId in world[i][j].specimens) {
                            if (world[i][j].specimens.hasOwnProperty(specimenId)) {
                                if( max_energy <= world[i][j].specimens[specimenId]) {
                                    max_energy = world[i][j].specimens[specimenId];
                                    best_specimen = specimenId;
                                }
                                world[i][j].specimens[specimenId] += energyToAdd;
                            }
                        }

                        for (var specimenId in world[i][j].specimens) {
                            if (world[i][j].specimens.hasOwnProperty(specimenId)) {
                                if( specimenId != best_specimen) {
                                    world[i][j].specimens[best_specimen] += world[i][j].specimens[specimenId];
                                    world[i][j].specimens[specimenId] = 0;
                                }
                            }
                        }
                    }
                }
                return energyToDisperse - energyToAdd * collisions;
            };
            break;
        }
        case 'altr': {
            collision = function(world, energyToDisperse, collisions) {
                var energyToAdd = Math.floor(energyToDisperse/collisions);
                var rest_energy = 0;
                for(var i = 0; i < N; i++) {
                    for (var j = 0; j < N; j++) {
                        var specimensInCell = 0;
                        var total_energy = 0;
                        var tmp_total = 0;
                        for (var specimenId in world[i][j].specimens) {
                            if (world[i][j].specimens.hasOwnProperty(specimenId)) {
                                specimensInCell +=1;
                            }
                        }
                        if (specimensInCell < 2 ) continue;

                        for (var specimenId in world[i][j].specimens) {
                            if (world[i][j].specimens.hasOwnProperty(specimenId)) {
                                world[i][j].specimens[specimenId] += energyToAdd;
                            }
                        }
                        var total_energy = 0;
                        var counter = 0;
                        for (var specimenId in world[i][j].specimens) {
                            if (world[i][j].specimens.hasOwnProperty(specimenId)) {
                                total_energy +=world[i][j].specimens[specimenId];
                                counter++;
                            }
                        }
                        var energy_cell = Math.floor(total_energy / counter);
                        rest_energy += total_energy - energy_cell*counter;

                        for (var specimenId in world[i][j].specimens) {
                            if (world[i][j].specimens.hasOwnProperty(specimenId)) {
                                world[i][j].specimens[specimenId] = energy_cell;
                            }
                        }
                    }
                }
                return energyToDisperse - energyToAdd * collisions + rest_energy;
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


