(function (module) {
    "use strict";

    module.createGrid = function(parentId, size, cellSize) {
        var canvas = $(`<canvas width="${size}" height="${size}"/>`)[0];
        $('#' + parentId).append(canvas);

        var ctx = canvas.getContext("2d");
        var N = size/cellSize;

        return {
                draw: function(state, cb) {
                    for(var i = 0; i < N; i++) {
                        for(var j = 0; j < N; j++) {
                            ctx.fillStyle = state[i][j].color;
                            ctx.fillRect(i * cellSize, j * cellSize, (i + 1) * cellSize, (j + 1) * cellSize);
                            if (!state[i][j].label) continue;
                            ctx.fillStyle = 'white';
                            ctx.font = cellSize/2 + "px Arial";
                            ctx.fillText(state[i][j].label, i * cellSize, j * cellSize + cellSize);
                        }
                    }
                    if (cb) cb();
                }
            };
        };

    module.generateEmptyWorld = function(size, color) {
        var state = [];
        for(var i = 0; i < N; i++) {
            state[i] = [];
            for(var j = 0; j < N; j++) {
                state[i][j] = {
                    color: palette[0],
                    specimens: {}
                };
            }
        }
        return state;
    };

    module.createAutomata = function(N, pointsNumber, totalEnergy, collision) { // totalEnergy = N*N
        var world = module.generateEmptyWorld(N, 'black');
        var pointEnergy = Math.floor(totalEnergy/pointsNumber);
        var accEnergy = totalEnergy - pointEnergy * pointsNumber;
        var steps = 0;

        for( var i = 0; i < pointsNumber; i ++) {
            var x = randomInt(N);
            var y = randomInt(N);

            world[x][y].specimens['spec' +i] = pointEnergy;
            world[x][y].color = palette[sumEnergy(world[x][y].specimens) % palette.length];
            world[x][y].label = sumEnergy(world[x][y].specimens)
        }

        function sumEnergy(obj) {
            var sum = 0;
            for (var specimenId in obj) {
                if (obj.hasOwnProperty(specimenId)) {
                    sum += obj[specimenId];
                }
            }
            return sum;
        }

        function move(world, x, y) {
            var moves = ['stay']
            if (x + 1 < N) moves.push('top');
            if (x - 1 >= 0) moves.push('bottom');
            if (y - 1 >= 0) moves.push('left');
            if (y + 1 < N) moves.push('right');

            return moves[module.randomInt(moves.length)]

        }

        function applyMove(world, specimenId,  x, y, x2, y2) {
            world[x2][y2].specimens[specimenId] = world[x][y].specimens[specimenId];
            delete world[x][y].specimens[specimenId];
            recalculateColorAndLabel(world, x2, y2);
            recalculateColorAndLabel(world, x, y);
        }

        function recalculateColorAndLabel(world, x, y) {
            world[x][y].color = palette[sumEnergy(world[x][y].specimens) % palette.length];
            world[x][y].label =sumEnergy(world[x][y].specimens)
        }

        return {
            step: function(callback) {
                //var tmpWorld = world;
                var tmpAcc = 0;
                var tmpWorld = $.extend(true, {}, world);
                //console.log(JSON.stringify(world))
                for(var i = 0; i < N; i++) {
                    for(var j = 0; j < N; j++) {
                        var cell = tmpWorld[i][j];
                        for (var specimenId in cell.specimens) {
                            var specimenEnergy = world[i][j].specimens;
                            if (cell.specimens.hasOwnProperty(specimenId)  && cell.specimens[specimenId] > 0) {
                                var mov = move(tmpWorld, i, j);
                                switch(mov) {
                                    case 'top': {
                                        applyMove(world, specimenId, i, j, i + 1, j);
                                        specimenEnergy = world[i+1][j].specimens;
                                        break;
                                    }
                                    case 'bottom': {
                                        applyMove(world, specimenId, i, j, i - 1, j);
                                        specimenEnergy = world[i-1][j].specimens;
                                        break;
                                    }
                                    case 'left': {
                                        applyMove(world, specimenId, i, j, i, j - 1);
                                        specimenEnergy = world[i][j-1].specimens;
                                        break;
                                    }
                                    case 'right': {
                                        applyMove(world, specimenId, i, j, i, j + 1);
                                        specimenEnergy = world[i][j+1].specimens;
                                        break;
                                    }
                                }
                                specimenEnergy[specimenId] = specimenEnergy[specimenId] - 1;
                                tmpAcc++;
                            }
                        }

                    }
                }
                var collisions = 0;
                for(var i = 0; i < N; i++) {
                    for (var j = 0; j < N; j++) {
                        var specimensInCell = 0;
                        for (var specimenId in world[i][j].specimens) {
                            if (world[i][j].specimens.hasOwnProperty(specimenId)) {
                                specimensInCell +=1;
                            }
                        }
                        if (specimensInCell > 1) collisions +=specimensInCell;
                    }
                }

                var restEnergy = collision(world, tmpAcc, collisions);

                if (!collisions) accEnergy += tmpAcc;
                else accEnergy +=  restEnergy;

                for(var i = 0; i < N; i++) {
                    for (var j = 0; j < N; j++) {
                        recalculateColorAndLabel(world, i, j)
                    }
                }
                steps++;
                callback(world, steps, accEnergy);
            },
            world: world
        }
    };

    module.randomInt = function(max) {
        return Math.floor(Math.random()*max);
    };

})(window);
