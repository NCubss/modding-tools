async function genImage(items, scale, canvas) {
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    let x = 0;
    let y = 0;
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
    x = Math.floor(((canvas.width / scale) - win.width) / 2);
    y = Math.floor(((canvas.height / scale) - win.height) / 2);
    ctx.drawImage(win, x, y);
    x += 4;
    y += 5;
    let fontSize = 11;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < items.length; i++) {
        if (items[i] > -1 && items[i] != btnNoneS) {
            ctx.drawImage(imgButton, x, y);
            ctx.fillStyle = "black";
        } else {
            ctx.drawImage(imgButtonSelected, x, y);
            ctx.fillStyle = "white";
        }
        if (items[i] < 1 && items[i] > -1 && items[i] != btnNone && items[i] != btnNoneS) {
            switch (items[i]) {
                case btnBig:
                case btnBigS:
                    ctx.drawImage(imgButtonBig, x, y);
                    break;
                case btnWings:
                case btnWingsS:
                    ctx.drawImage(imgButtonWings, x, y);
                    break;
                case btnParachute:
                case btnParachuteS:
                    ctx.drawImage(imgButtonParachute, x, y);
                    break;
            }
            if (items[i] > 0) { 
                ctx.drawImage(imgButtonAdd, x, y);
            } else {
                ctx.drawImage(imgButtonRemove, x, y);
            }
        } else if (items[i] != btnNone && items[i] != btnNoneS) {
            if (Math.abs(items[i]) < 235) {
                ctx.drawImage(imgCards, (Math.abs(items[i]) - 1) * 22, 0, 22, 34, x + 1, y - 5, 22, 34);
            } else {
                while (ctx.measureText(Math.abs(items[i]).toString()).width > 20 && fontSize > 0) {
                    fontSize -= 0.5;
                    ctx.font = `${fontSize}px sans-serif`;
                }
                ctx.fillText(Math.abs(items[i]), x + 12, y + 13);
                fontSize = 11;
                ctx.font = `${fontSize}px sans-serif`;
            }
        } else {
            ctx.fillText("x", x + 12, y + 12);
        }
        x += 25;
    }
}

function drawSelected() {
    const ctx = editor.view.getContext("2d");
    const x = Math.floor(((editor.view.width / editor.scale) - editor.windowSprite.width) / 2) + 4 + (editor.selected * 25);
    const y = Math.floor(((editor.view.height / editor.scale) - editor.windowSprite.height) / 2) + 5;
    ctx.strokeStyle = "aqua";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 24, 24);
}

function redrawView() {
    requestAnimationFrame(async event => {
        editor.view.getContext("2d").clearRect(0, 0, editor.view.width / editor.scale, editor.view.height / editor.scale);
        await genImage(editor.data, editor.scale, editor.view);
        drawSelected();
    });
}