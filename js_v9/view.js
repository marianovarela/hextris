// t: current time, b: begInnIng value, c: change In value, d: duration
function easeOutCubic(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
}

function renderText(x, y, fontSize, color, text, font) {
    ctx.save();
    if (!font) {
        font = 'px/0 Roboto';
    }

    fontSize *= settings.scale;
    ctx.font = fontSize + font;
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.fillText(text, x, y + (fontSize / 2) - 9 * settings.scale);
    ctx.restore();
}

function drawScoreboard() {
    if (scoreOpacity < 1) {
        scoreOpacity += 0.01;
        textOpacity += 0.01;
    }

    ctx.globalAlpha = textOpacity;
    var scoreSize = 50;
    var scoreString = String(score);
    if (scoreString.length == 6) {
        scoreSize = 43;
    } else if (scoreString.length == 7) {
        scoreSize = 35;
    } else if (scoreString.length == 8) {
        scoreSize = 31;
    } else if (scoreString.length == 9) {
        scoreSize = 27;
    }
    if (rush ==1){
        var color = "rgb(236, 240, 241)";
    }
    else{
        var color = "#e74c3c";
    }
    if (gameState === 0) {
        renderText(trueCanvas.width / 2 + gdx + 6 * settings.scale, trueCanvas.height / 2 + gdy, 60, "rgb(236, 240, 241)", String.fromCharCode("0xf04b"), 'px FontAwesome');
        renderText(trueCanvas.width / 2 + gdx + 6 * settings.scale, trueCanvas.height / 2 + gdy - 170 * settings.scale, 150, "#2c3e50", "Hextris");
        renderText(trueCanvas.width / 2 + gdx + 5 * settings.scale, trueCanvas.height / 2 + gdy + 100 * settings.scale, 20, "rgb(44,62,80)", '¡Jugar!');
    } else if (gameState != 0 && textOpacity > 0) {
        textOpacity -= 0.05;
        renderText(trueCanvas.width / 2 + gdx + 6 * settings.scale, trueCanvas.height / 2 + gdy, 60, "rgb(236, 240, 241)", String.fromCharCode("0xf04b"), 'px FontAwesome');
        renderText(trueCanvas.width / 2 + gdx + 6 * settings.scale, trueCanvas.height / 2 + gdy - 170 * settings.scale, 150, "#2c3e50", "Hextris");
        renderText(trueCanvas.width / 2 + gdx + 5 * settings.scale, trueCanvas.height / 2 + gdy + 100 * settings.scale, 20, "rgb(44,62,80)", '¡Jugar!');
        ctx.globalAlpha = scoreOpacity;
        renderText(trueCanvas.width / 2 + gdx, trueCanvas.height / 2 + gdy, scoreSize, color, score);
    } else {
        ctx.globalAlpha = scoreOpacity;
        renderText(trueCanvas.width / 2 + gdx, trueCanvas.height / 2 + gdy, scoreSize, color, score);
    }

    ctx.globalAlpha = 1;
}

function clearGameBoard() {
    drawPolygon(trueCanvas.width / 2, trueCanvas.height / 2, 6, trueCanvas.width / 2, 30, hexagonBackgroundColor, 0, 'rgba(0,0,0,0)');
}

function drawPolygon(x, y, sides, radius, theta, fillColor, lineWidth, lineColor) {
    ctx.fillStyle = fillColor;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;

    ctx.beginPath();
    var coords = rotatePoint(0, radius, theta);
    ctx.moveTo(coords.x + x, coords.y + y);
    var oldX = coords.x;
    var oldY = coords.y;
    for (var i = 0; i < sides; i++) {
        coords = rotatePoint(oldX, oldY, 360 / sides);
        ctx.lineTo(coords.x + x, coords.y + y);
        oldX = coords.x;
        oldY = coords.y;
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0)';
}

function toggleClass(element, active) {
    if ($(element).hasClass(active)) {
        $(element).removeClass(active);
    } else {
        $(element).addClass(active);
    }
}

function showText(text) {
    var messages = {
        'paused': "<div class='centeredHeader unselectable'>Pausa</div><br><div class='unselectable centeredSubHeader'>Pulse &uarr;(flecha arriba) para reanudar</div><div style='height:100px;line-height:100px;cursor:pointer;'></div>",
        'pausedAndroid': "<div class='centeredHeader unselectable'>Pausa</div><br><div class='unselectable centeredSubHeader'>Press <i class='fa fa-play'></i> to resume</div><div style='height:100px;line-height:100px;cursor:pointer;'></div><div class='unselectable centeredSubHeader' style='margin-top:-50px;'><a href = 'market://details?id=com.hextris.hextrisadfree' target='_blank'>Don't like ads? Want to support the developer? Tap for the ad-free version.</a></div>",
        'start': "<div class='centeredHeader unselectable' style='line-height:80px;'>Presionar OK para reiniciar!</div>",
        
    };

    if (text == 'paused') {
        if (settings.os == 'android') {
            text = 'pausedAndroid';
        }
    }

    if (text == 'gameover') {
        var allZ = 1;
        var i;
        var scores;
        $.get($HEX.server + "/api/v1/score/search/findByGameOrderByScoreDesc?game=" + $HEX.gameName, function (data){
    		scores = data._embedded.score;
	    	if((scores[2] != null && score >= scores[2].score) || scores[2] == null){
            	messages['gameover'] = "<div class='centeredHeader unselectable'> Juego terminado: " + score + " pts</div><br><div style='font-size:30px;' class='centeredHeader unselectable'> Felicitaciones, entraste en el Top 3!!!</div><div style='font-size:24px;' class='centeredHeader unselectable'> Puntajes altos:</div><table class='tg' style='margin:0px auto'> ";
	    	}else{
	    		messages['gameover'] = "<div class='centeredHeader unselectable'> Juego terminado: " + score + " pts</div><br><div style='font-size:24px;' class='centeredHeader unselectable'> Puntajes altos:</div><table class='tg' style='margin:0px auto'> ";
	    	}
	        for (i = 0; i < 3; i++) {
	            if (scores.length > i) {
	                messages['gameover'] += "<tr> <th class='tg-031e'>" + (i + 1) + ".</th> <th class='tg-031e'>" + scores[i].name + "  </th> <th class='tg-031e'>" + scores[i].score + " pts</th> </tr>";
	            }
	        }
	        var restartText;
	        if (settings.platform == 'mobile') {
	            restartText = 'Tap anywhere to restart!';
	        } else {
	            restartText = 'Presionar OK para reiniciar!';
	        }
	
	        messages['gameover'] += "</table><br><div class='unselectable centeredSubHeader' id = 'tapToRestart'>" + restartText + "</div>";
	        if (allZ) {
	            for (i = 0; i < scores.length; i++) {
	                if (scores[i] !== 0) {
	                    allZ = 0;
	                }
	            }
	        }
	        $(".overlay").html(messages[text]);
    		$(".overlay").fadeIn("1000", "swing");
    	
    	});
        	
    }
    $(".overlay").html(messages[text]);
    $(".overlay").fadeIn("1000", "swing");

    if (text == 'gameover') {
        if (settings.platform == 'mobile') {
            $('.tg').css('margin-top', '6px');
            $("#tapToRestart").css('margin-top','-19px');
        }
    }
}

function setMainMenu() {
    gameState = 4;
    canRestart = false;
    setTimeout(function() {
        canRestart = 's';
    }, 500);
    $('#restartBtn').hide();
    if ($($("#pauseBtn").children()[0]).attr('class').indexOf('pause') == -1) {
        $("#pauseBtnInner").html('<i class="fa fa-pause fa-2x"></i>');
    } else {
        $("#pauseBtnInner").html('<i class="fa fa-play fa-2x"></i>');
    }
}

function hideText() {
    $(".overlay").fadeOut("1000", function() {
        $(".overlay").html("");
    });
}

function gameOverDisplay() {
	//TODO agregar name a formData
	var formData = {score: score, game: $HEX.gameName};
	$.ajax(
	{
		url : $HEX.server + "/score",
		type: "POST",
		contentType:"application/json",
		dataType: "json",
		data: JSON.stringify(formData),
		success: function(data){
		},
		error: function(data){
		    $("#attributions").show();
		    var c = document.getElementById("canvas");
		    c.className = "blur";
		    showText('gameover');
		    showbottombar();
		}
	});
}

function pause(o) {
    writeHighScores();
    var message;
    if (o) {
        message = '';
    } else {
        message = 'paused';
    }

    var c = document.getElementById("canvas");
    if (gameState == -1) {
        $('#restartBtn').fadeOut(150, "linear");
        if ($('#helpScreen').is(':visible')) {
            $('#helpScreen').fadeOut(150, "linear");
        }

        $("#pauseBtnInner").html('<i class="fa fa-pause fa-2x"></i>');
        $('.helpText').fadeOut(200, 'linear');
        hideText();
        hidebottombar();
        setTimeout(function() {
            gameState = prevGameState;
        }, 200);
    } else if (gameState != -2 && gameState !== 0 && gameState !== 2) {
        $('#restartBtn').fadeIn(150, "linear");
        $('.helpText').fadeIn(200, 'linear');
        showbottombar();
        if (message == 'paused') {
            showText(message);
        }

        $("#pauseBtnInner").html('<i class="fa fa-play fa-2x"></i>');
        prevGameState = gameState;
        gameState = -1;
    }
}
