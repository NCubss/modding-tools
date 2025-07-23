let stuffToDecode = [];

const imgWindow1 = importImage("/files/window/spr_windows_1.png");
const imgWindow2 = importImage("/files/window/spr_windows_2.png");
const imgWindow3 = importImage("/files/window/spr_windows_3.png");
const imgWindow4 = importImage("/files/window/spr_windows_4.png");
const imgWindow5 = importImage("/files/window/spr_windows_5.png");
const imgWindow6 = importImage("/files/window/spr_windows_6.png");
const imgCards = importImage("/files/window/spr_cards_SMW.png");
const imgButton = importImage("/files/window/spr_window_button.png");
const imgButtonSelected = importImage("/files/window/spr_window_button_selected.png");
const imgButtonAdd = importImage("/files/window/spr_window_button_add.png");
const imgButtonRemove = importImage("/files/window/spr_window_button_remove.png");
const imgButtonBig = importImage("/files/window/spr_window_button_big.png");
const imgButtonWings = importImage("/files/window/spr_window_button_wings.png");
const imgButtonParachute = importImage("/files/window/spr_window_button_parachute.png");
const imgButtonOther = importImage("/files/window/spr_window_button_other.png");

function importImage(path) {
    const img = new Image();
    img.src = path;
    stuffToDecode.push(img);
    return img;
}

window.addEventListener("load", async event => {
    // make sure everything is loaded first and then start app
    for (let i of stuffToDecode) {
        await i.decode();
    }
    main();
});