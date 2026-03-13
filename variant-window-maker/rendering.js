function genImage(items, scale, canvas) {
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    let win;
    switch (items.length) {
        case 1:
            win = imgWindow1;
            break;
        case 2:
            win = imgWindow2;
            break;
        case 3:
            win = imgWindow3;
            break;
        case 4:
            win = imgWindow4;
            break;
        case 5:
            win = imgWindow5;
            break;
        case 6:
            win = imgWindow6;
            break;
    }
    editor.windowSprite = win;

    let x = Math.floor(((canvas.width / scale) - win.width) / 2);
    let y = Math.floor(((canvas.height / scale) - win.height) / 2);
    ctx.drawImage(win, x, y);

    x += 4;
    y += 5;
    let fontSize = 11;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    items.forEach(val => {
        if (val.selected) {
            ctx.drawImage(imgButtonSelected, x, y);
            ctx.fillStyle = "white";
        } else {
            ctx.drawImage(imgButton, x, y);
            ctx.fillStyle = "black";
        }
        switch (val.type) {

            case btnMushroom:
                ctx.drawImage(imgButtonMushroom, x, y);
                ctx.drawImage(imgButtonAdd, x, y);
                break;
            
            case btnWings:
                ctx.drawImage(imgButtonWings, x, y);
                ctx.drawImage(imgButtonAdd, x, y);
                break;

            case btnParachute:
                ctx.drawImage(imgButtonParachute, x, y);
                ctx.drawImage(imgButtonAdd, x, y);
                break;
            
            default:
                if (val.frame == 0) {
                    ctx.fillText("x", x + 12, y + 12);
                } else if (val.frame > 235) {
                    while (ctx.measureText(String(val.frame).width > 20 && fontSize > 0)) {
                        fontSize -= 0.5;
                        ctx.font = `${fontSize}px sans-serif`;
                    }

                    ctx.fillText(val.frame, x + 12, y + 13);
                    fontSize = 11;
                    ctx.font = `${fontSize}px sans-serif`;
                } else {
                    ctx.drawImage(imgCards, (val.frame - 1) * 22, 0, 22, 34, x + 1, y - 5, 22, 34);
                }
                break;
        }
        x += 25;
    });
}

function drawSelected() {
    const ctx = $('#view')[0].getContext("2d");
    const x = Math.floor((($('#view').attr("width") / editor.scale) - editor.windowSprite.width) / 2) + 4 + (editor.selected * 25);
    const y = Math.floor((($('#view').attr("height") / editor.scale) - editor.windowSprite.height) / 2) + 5;

    ctx.strokeStyle = "aqua";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 24, 24);
}

function redrawView() {
    requestAnimationFrame(event => {
        $('#view')[0].getContext("2d").clearRect(0, 0, $('#view').attr("width") / editor.scale, $('#view').attr("height") / editor.scale);
        genImage(editor.data, editor.scale, $('#view')[0]);
        drawSelected();
    });
}