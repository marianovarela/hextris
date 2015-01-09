function Strings () {
	this.ipScores = 'http://54.183.184.126/';   
}

var $HEX = new Strings();
$HEX.gameName = 'HEXTRIS';

function scaleCanvas() {
    canvas.width = $(window).width();
    canvas.height = $(window).height();

    if (canvas.height > canvas.width) {
        settings.scale = (canvas.width / 800) * settings.baseScale;
    } else {
        settings.scale = (canvas.height / 800) * settings.baseScale;
    }

    trueCanvas = {
        width: canvas.width,
        height: canvas.height
    };

    if (window.devicePixelRatio) {
        var cw = $("#canvas").attr('width');
        var ch = $("#canvas").attr('height');

        $("#canvas").attr('width', cw * window.devicePixelRatio);
        $("#canvas").attr('height', ch * window.devicePixelRatio);
        $("#canvas").css('width', cw);
        $("#canvas").css('height', ch);

        trueCanvas = {
            width: cw,
            height: ch
        };

        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
}

function toggleDevTools() {
    $('#devtools').toggle();
}

function resumeGame() {
    gameState = 1;
    hideUIElements();
    $('#pauseBtn').show();
    $('#restartBtn').hide();
    importing = 0;
    startTime = Date.now();
    setTimeout(function() {
        if ((gameState == 1 || gameState == 2) && !$('#helpScreen').is(':visible')) {
            $('.helpText').fadeOut(150, "linear");
        }
    }, 7000);

    checkVisualElements();
}

function checkVisualElements() {
    if (!$('.helpText').is(":visible")) $('.helpText').fadeIn(150, "linear");
    if (!$('#pauseBtn').is(':visible')) $('#pauseBtn').fadeIn(150, "linear");
    if (!$('#restartBtn').is(':visible')) $('#restartBtn').fadeOut(150, "linear");
}

function hideUIElements() {
    $('#pauseBtn').hide();
    $('#restartBtn').hide();
    $('#startBtn').hide();
    $("#attributions").hide();
    $("#bottombar").hide();
}

function init(b) {
    if (b) {
        hidebottombar();


        if ($('#helpScreen').is(":visible")) {
            $('#helpScreen').fadeOut(150, "linear");
        }

        setTimeout(function() {
            $('.helpText').fadeOut(150, "linear");
                infobuttonfading = false;
        }, 7000);
        clearSaveState();
    }

    infobuttonfading = true;
    $("#pauseBtnInner").html('<i class="fa fa-pause fa-2x"></i>');
    hideUIElements();
    var saveState = localStorage.getItem("saveState") || "{}";
    saveState = JSONfn.parse(saveState);
    document.getElementById("canvas").className = "";
    history = {};
    importedHistory = undefined;
    importing = 0;
    isGameOver = 2;
    score = saveState.score || 0;
    prevScore = 0;
    spawnLane = 0;
    op = 0;
    tweetblock=false;
    scoreOpacity = 0;
    gameState = 1;
    $("#restartBtn").hide();
    $("#pauseBtn").show();
    if (saveState.hex !== undefined) gameState = 1;

    settings.blockHeight = settings.baseBlockHeight * settings.scale;
    settings.hexWidth = settings.baseHexWidth * settings.scale;
    MainHex = saveState.hex || new Hex(settings.hexWidth);
    if (saveState.hex) {
        MainHex.playThrough += 1;
    }
    MainHex.sideLength = settings.hexWidth;

    var i;
    var block;
    if (saveState.blocks) {
        saveState.blocks.map(function(o) {
            if (rgbToHex[o.color]) {
                o.color = rgbToHex[o.color];
            }
        });

        for (i = 0; i < saveState.blocks.length; i++) {
            block = saveState.blocks[i];
            blocks.push(block);
        }
    } else {
        blocks = [];
    }

    gdx = saveState.gdx || 0;
    gdy = saveState.gdy || 0;
    comboTime = saveState.comboTime || 0;

    for (i = 0; i < MainHex.blocks.length; i++) {
        for (var j = 0; j < MainHex.blocks[i].length; j++) {
            MainHex.blocks[i][j].height = settings.blockHeight;
            MainHex.blocks[i][j].settled = 0;
        }
    }

    MainHex.blocks.map(function(i) {
        i.map(function(o) {
            if (rgbToHex[o.color]) {
                o.color = rgbToHex[o.color];
            }
        });
    });

    MainHex.y = -100;

    startTime = Date.now();
    waveone = saveState.wavegen || new waveGen(MainHex);

    MainHex.texts = []; //clear texts
    MainHex.delay = 15;
    hideText();
}

function addNewBlock(blocklane, color, iter, distFromHex, settled) { //last two are optional parameters
    iter *= settings.speedModifier;
    if (!history[MainHex.ct]) {
        history[MainHex.ct] = {};
    }

    history[MainHex.ct].block = {
        blocklane: blocklane,
        color: color,
        iter: iter
    };

    if (distFromHex) {
        history[MainHex.ct].distFromHex = distFromHex;
    }
    if (settled) {
        blockHist[MainHex.ct].settled = settled;
    }
    blocks.push(new Block(blocklane, color, iter, distFromHex, settled));
}

function exportHistory() {
    $('#devtoolsText').html(JSON.stringify(history));
    toggleDevTools();
}

function setStartScreen() {
    $('#startBtn').show();
    init();
    if (isStateSaved()) {
        importing = 0;
    } else {
        importing = 1;
    }

    $('#pauseBtn').hide();
    $('#restartBtn').hide();
    $('#startBtn').show();
    $('#attributions').show();
    showbottombar();

    gameState = 0;
    requestAnimFrame(animLoop);
}

var spd = 1;

function animLoop() {
    switch (gameState) {
        case 1:
            requestAnimFrame(animLoop);
            render();
            var now = Date.now();
            var dt = (now - lastTime)/16.666 * rush;
            if (spd > 1) {
                dt *= spd;
            }

            if(gameState == 1 ){
                if(!MainHex.delay) {
                    update(dt);
                }
                else{
                    MainHex.delay--;
                }
            }

            lastTime = now;

            if (checkGameOver() && !importing) {
                var saveState = localStorage.getItem("saveState") || "{}";
                saveState = JSONfn.parse(saveState);
                gameState = 2;

                setTimeout(function() {
                    enableRestart();
                }, 150);

                if ($('#helpScreen').is(':visible')) {
                    $('#helpScreen').fadeOut(150, "linear");
                }

                if ($('#pauseBtn').is(':visible')) $('#pauseBtn').fadeOut(150, "linear");
                if ($('#restartBtn').is(':visible')) $('#restartBtn').fadeOut(150, "linear");
                if (!$('.helpText').is(':visible')) $('.helpText').fadeIn(150, "linear");

                showbottombar();
                canRestart = 0;
                clearSaveState();
            }
            break;

        case 0:
            requestAnimFrame(animLoop);
            render();
            break;

        case -1:
            requestAnimFrame(animLoop);
            render();
            break;

        case 2:
            var now = Date.now();
            var dt = (now - lastTime)/16.666 * rush;
            requestAnimFrame(animLoop);
            update(dt);
            render();
            lastTime = now;
            break;

        case 3:
            requestAnimFrame(animLoop);
            fadeOutObjectsOnScreen();
            render();
            break;

        case 4:
            setTimeout(function() {
                initialize(1);
            }, 1);
            render();
            return;

        default:
            initialize();
            setStartScreen();
            break;
    }

    if (!(gameState == 1 || gameState == 2)) {
        lastTime = Date.now();
    }
}

function enableRestart() {
    canRestart = 1;
}

function isInfringing(hex) {
    for (var i = 0; i < hex.sides; i++) {
        var subTotal = 0;
        for (var j = 0; j < hex.blocks[i].length; j++) {
            subTotal += hex.blocks[i][j].deleted;
        }

        if (hex.blocks[i].length - subTotal > settings.rows) {
            return true;
        }
    }
    return false;
}

function checkGameOver() {
    for (var i = 0; i < MainHex.sides; i++) {
        if (isInfringing(MainHex)) {
            $.get($HEX.ipScores + String(score));
            if (highscores.indexOf(score) == -1) {
                highscores.push(score);
            }
            writeHighScores();
            gameOverDisplay();
            return true;
        }
    }
    return false;
}

function showHelp() {
    $("#inst_main_body").html("El objetivo de Hextris es parar los bloques en el interior del hexagono gris<br><br>" 
    						+ (settings.platform != 'mobile' ? 'Pulse las teclas flecha izquierda o derecha' : 'tap the left and right sides of the screen') + "  para girar el hexagono<br><br>"
    						+ "Se borran los bloques y se obtienen puntos al conseguir que 3(tres) o mas bloques del mismo color sean contiguos<br><br>"
    						+ "El tiempo restante antes del combo desaparece y es indicado por <span style='color:#f1c40f;'>las</span> <span style='color:#e74c3c'>lineas de </span> <span style='color:#3498db'>colores</span> <span style='color:#2ecc71'>en</span> el exterior del hexagono<br><br>"
    						+ (settings.platform == 'mobile' ? 'Toggle speeding up the game by tapping the inner hexagon' : "Acelerar el juego 2x presionando la flecha hacia abajo")
    						+ "<br><br> Presione &uarr;(flecha arriba) para pausar y reanudar el juego"
    						+ "<br><br> Presione enter para reiniciar el juego");
    if (gameState == 1) {
        pause();
    }

    if($($("#pauseBtnInner").children()[0]).hasClass("fa-pause") && gameState != 0 && !infobuttonfading) {
        return;
    }

    $("#openSideBar").fadeIn(150,"linear");
    $('#helpScreen').fadeToggle(150, "linear");
}
