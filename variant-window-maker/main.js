const content = document.getElementById("app");

// States
const statePicker = 0;
const stateEditor = 1;

// Button values (S = Selected)
const btnNone = 0.01;
const btnNoneS = -0.01;
const btnBig = 0.1;
const btnBigS = -0.1;
const btnWings = 0.2;
const btnWingsS = -0.2;
const btnParachute = 0.3;
const btnParachuteS = -0.3;

let state = statePicker;

let editor = {
    data: [],
    behaviorData: [],
    number: -1,
    view: null,
    selected: 0,
    windowSprite: null,
    scale: 4
};

// called in res.js
function main() {
    generateState(state);
}

window.addEventListener("beforeunload", event => {
    if (state == stateEditor) {
        event.preventDefault();
    }
});

// wait for an event
/*
function waitForEvent(item, event) {
    return new Promise(resolve => {
        const listener = () => {
            item.removeEventListener(event, listener);
            resolve();
        }
        item.addEventListener(event, listener);
    });
}
*/

// load images


// generate content depending on state in #app
function generateState(st) {
    switch (st) {

        case statePicker:
            const titlePicker = document.createElement("h2");
            titlePicker.textContent = "Pick a Template";
            titlePicker.className = "center";

            const picker = document.createElement("div");
            picker.className = "picker";
            // Template Buttons
            addTemplateBtn(1, [btnNone, btnNone, btnNone, btnBig, btnWings, btnParachute], picker);
            addTemplateBtn(2, [btnWings], picker);
            addTemplateBtn(2.1, [btnWings, btnParachute], picker);
            addTemplateBtn(3, [btnNone, btnNone], picker);
            addTemplateBtn(3.1, [btnBig, btnWings, btnParachute], picker);
            addTemplateBtn(3.2, [btnNone, btnNone, btnParachute], picker);
            addTemplateBtn(4, [btnNone, btnNone, btnWings], picker);
            addTemplateBtn(6, [btnNone, btnNone, btnWings, btnParachute], picker);
            addTemplateBtn(7, [btnNone, btnNone, btnNone, btnNone, 184], picker); // 184 = make pipe pair sprite
            addTemplateBtn(10, [btnNone, btnNone, btnNone], picker);
            addTemplateBtn(11, [btnNone, btnNone, btnNone, btnNone], picker);
            addTemplateBtn(12, [btnBig, btnWings, btnNone, btnNone, btnNone, btnNone], picker);
            addTemplateBtn(13, [btnBig, btnNone, btnNone], picker);
            addTemplateBtn(14, [btnWings, btnParachute, btnNone, btnNone], picker);

            content.textContent = "";
            content.append(titlePicker, picker);
            break;
        
        case stateEditor:
            const titleEditor = document.createElement("h2");
            titleEditor.textContent = "Editor";
            titleEditor.className = "center";

            editor.view = document.createElement("canvas");
            editor.view.width = 934;
            editor.view.height = 250;
            editor.view.className = "view";
            editor.view.addEventListener("click", selectCheck);

            redrawView();
            content.textContent = "";
            content.append(titleEditor, editor.view, generateOptions());
    }
}

// generate and add template button
function addTemplateBtn(number, items, parent) {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 200;
    genImage(items, 2, canvas);

    const btn = document.createElement("button");
    btn.dataset.number = number.toString();
    btn.dataset.buttons = "";
    btn.addEventListener("click", () => {
        editor.number = Number(btn.dataset.number);
        editor.data = btn.dataset.buttons.split(",").map(v => Number(v));
        editor.behaviorData = Array(editor.data.length);

        for (let i in items) {
            switch (items[i]) {

                case btnBig:
                case btnBigS:
                    editor.behaviorData[i] = {
                        type: "automatic",
                        autoRegRes: "",
                        autoBigRes: ""
                    }

                case btnWings:
                case btnWingsS:
                case btnParachute:
                case btnParachuteS:
                    // WIP
                    break;
                
                default:
                    editor.behaviorData[i] = {
                        type: "changeObject",
                        newRes: ""
                    };
                    break;
            }
        }

        state = stateEditor;
        generateState(state);
    });

    for (let i in items) {
        if (i != 0) {
            btn.dataset.buttons += ",";
        }
        btn.dataset.buttons += items[i].toString();
    }
    btn.append(canvas);
    parent.append(btn);
}

// generate the options pane below the editor view
function generateOptions() {
    const options = document.createElement("div");
    options.className = "options";
    const customize = document.createElement("div");
    const behavior = document.createElement("div");

    switch (editor.data[editor.selected]) {

        case btnBig:
        case btnBigS:
            optionsBig();
            break;

        case btnWings:
        case btnWingsS:
        case btnParachute:
        case btnParachuteS:
            optionsWIP();
            break;
        
        default:
            optionsRegular();
            break;
    }
    return options;

    // WIP options pane
    function optionsWIP() {
        const text = document.createElement("p");
        text.className = "center italic";
        text.textContent = "Work in Progress";
        options.append(text);
    }

    // Mushroom button options pane
    function optionsBig() {

        // CUSTOMIZE PANE

        const text = document.createElement("p");
        text.className = "center italic";
        text.textContent = "This button doesn't support customization";
        customize.append(text);

        // BEHAVIOR PANE

        const behaviorSelect = buildBehaviorSelect(behavior);

        const behaviorAutomatic = document.createElement("option");
        behaviorAutomatic.value = "automatic";
        behaviorAutomatic.textContent = "Automatic";

        const behaviorManual = document.createElement("option");
        behaviorManual.value = "manual";
        behaviorManual.textContent = "Manual";

        behaviorSelect.append(behaviorAutomatic, behaviorManual);
        behaviorSelect.value = editor.behaviorData[editor.selected].type;

        switch (editor.behaviorData[editor.selected].type) {
            
            case "automatic":
                editor.data[editor.selected] = Math.abs(editor.data[editor.selected]);
                redrawView();

                const autoRegLabel = document.createElement("label");
                autoRegLabel.className = "full";
                autoRegLabel.textContent = "Regular size res object:";
                autoRegLabel.htmlFor = "regularRes";

                const autoRegInput = document.createElement("input");
                autoRegInput.id = "regularRes";
                autoRegInput.className = "full code";
                autoRegInput.type = "text";
                autoRegInput.required = true;
                autoRegInput.placeholder = "obj_..._res";
                autoRegInput.value = editor.behaviorData[editor.selected].autoRegRes;
                autoRegInput.addEventListener("change", event => {
                    if (event.target.checkValidity()) {
                        editor.behaviorData[editor.selected].autoRegRes = event.target.value;
                    }
                });

                const autoBigLabel = document.createElement("label");
                autoBigLabel.className = "full";
                autoBigLabel.textContent = "Big size res object:";
                autoBigLabel.htmlFor = "bigRes";

                const autoBigInput = document.createElement("input");
                autoBigInput.id = "bigRes";
                autoBigInput.className = "full code";
                autoBigInput.required = true;
                autoBigInput.placeholder = "obj_..._b_res";
                autoBigInput.value = editor.behaviorData[editor.selected].autoBigRes;
                autoBigInput.addEventListener("change", event => {
                    if (event.target.checkValidity()) {
                        editor.behaviorData[editor.selected].autoBigRes = event.target.value;
                    }
                });

                behavior.append(autoRegLabel, autoRegInput, autoBigLabel, autoBigInput);
                break;
            
            case "manual":
                const selectedFrame = document.createElement("div");
                selectedFrame.className = "check";

                const selectedBox = document.createElement("input");
                selectedBox.id = "bigSelected";
                selectedBox.type = "checkbox";
                selectedBox.checked = editor.data[editor.selected] < 0;
                selectedBox.addEventListener("change", event => {
                    editor.data[editor.selected] = Math.abs(editor.data[editor.selected]) * (Number(!event.target.checked) * 2 - 1);
                    options.replaceWith(generateOptions());
                    redrawView();
                });
                
                const selectedLabel = document.createElement("label");
                selectedLabel.textContent = "Already Selected";
                selectedLabel.htmlFor = "bigSelected";
                
                selectedFrame.append(selectedBox, selectedLabel);
                behavior.append(selectedFrame);
                break;

            default:
                const error = document.createElement("p");
                error.className = "error";
                error.textContent = "Invalid behavior type!";
                behavior.append(error);
                console.error(`Error: ${error.textContent}`);
                break;
        }

        options.append(customize, behavior);
    }

    // Regular options pane
    function optionsRegular() {

        // CUSTOMIZE PANE

        const frameLabel = document.createElement("label");
        frameLabel.className = "full";
        frameLabel.innerHTML = "Frame Number (in <code>spr_cards_*</code>)";
        frameLabel.htmlFor = "frame";

        const frameInput = document.createElement("input");
        frameInput.id = "frame";
        frameInput.className = "full";
        frameInput.type = "number";
        frameInput.required = true;
        frameInput.min = 1;
        frameInput.step = 1;
        frameInput.placeholder = "0";
        frameInput.value = Math.floor(Math.abs(editor.data[editor.selected]));
        frameInput.addEventListener("change", event => {
            const selected = document.getElementById("selected").checked;
            const val = Number(event.target.value) == 0 ? (selected ? btnNoneS : btnNone) : (selected ? -Math.abs(Number(event.target.value)) : Math.abs(Number(event.target.value)));
            if (event.target.checkValidity()) {
                editor.data[editor.selected] = val;
                redrawView();
            }
        });

        const selectedFrame = document.createElement("div");
        selectedFrame.className = "check";

        const selectedBox = document.createElement("input");
        selectedBox.id = "selected";
        selectedBox.type = "checkbox";
        selectedBox.checked = editor.data[editor.selected] < 0;
        selectedBox.addEventListener("change", event => {
            editor.data[editor.selected] = Math.abs(editor.data[editor.selected]) * (Number(!event.target.checked) * 2 - 1);
            options.replaceWith(generateOptions());
            redrawView();
        });

        const selectedLabel = document.createElement("label");
        selectedLabel.textContent = "Already Selected";
        selectedLabel.htmlFor = "selected";

        selectedFrame.append(selectedBox, selectedLabel);
        customize.append(frameLabel, frameInput, selectedFrame);

        // BEHAVIOR PANE

        const behaviorSelect = buildBehaviorSelect(behavior);

        const behaviorChangeObject = document.createElement("option");
        behaviorChangeObject.value = "changeObject";
        behaviorChangeObject.textContent = "Change Object";

        const behaviorCustom = document.createElement("option");
        behaviorCustom.value = "custom";
        behaviorCustom.textContent = "Custom / None";

        behaviorSelect.append(behaviorChangeObject, behaviorCustom);
        behaviorSelect.value = editor.behaviorData[editor.selected].type;

        if (behaviorSelect.disabled) {
            const text = document.createElement("p");
            text.className = "center italic";
            text.textContent = "Already selected buttons can't have a behavior.";
            behavior.append(text);
        } else {
            switch (behaviorSelect.value) {
                
                case "changeObject":
                    const newResLabel = document.createElement("label");
                    newResLabel.className = "full";
                    newResLabel.textContent = "Name of the res object this will change into:";
                    newResLabel.htmlFor = "newRes";

                    const newResInput = document.createElement("input");
                    newResInput.id = "newRes";
                    newResInput.className = "full code";
                    newResInput.type = "text";
                    newResInput.required = true;
                    newResInput.placeholder = "obj_..._res"; 
                    newResInput.value = editor.behaviorData[editor.selected].newRes;
                    newResInput.addEventListener("change", event => {
                        if (event.target.checkValidity()) {
                            editor.behaviorData[editor.selected].newRes = event.target.value;
                        }
                    });

                    behavior.append(newResLabel, newResInput);
                    break;
                
                case "custom":
                    const text = document.createElement("p");
                    text.className = "center italic";
                    text.textContent = "By default, no code for this button will be supplied. You will be able to add code once you go through the guide.";
                    behavior.append(text);
                    break;

                default:
                    const error = document.createElement("p");
                    error.className = "error";
                    error.textContent = "Invalid behavior type!";
                    behavior.append(error);
                    console.error(`Error: ${error.textContent}`);
                    break;
            }
        }

        options.append(customize, behavior);
    }

    function buildBehaviorSelect(pane) {
        const behaviorLabel = document.createElement("label");
        behaviorLabel.className = "full";
        behaviorLabel.htmlFor = "behavior";
        behaviorLabel.textContent = "Behavior";

        const behaviorSelect = document.createElement("select");
        behaviorSelect.id = "behavior";
        behaviorSelect.className = "full";
        behaviorSelect.disabled = isNormal(editor.data[editor.selected]) && editor.data[editor.selected] < 0;
        behaviorSelect.addEventListener("change", event => {
            editor.behaviorData[editor.selected].type = event.target.value;
            options.replaceWith(generateOptions());
        });

        pane.append(behaviorLabel, behaviorSelect, document.createElement("hr"));

        return behaviorSelect;
    }
}

// check if user selected a different button in editor
function selectCheck(event) {
    const mouseX = event.pageX - editor.view.offsetLeft;
    const mouseY = event.pageY - editor.view.offsetTop;
    const winX = Math.floor((editor.view.width - (editor.windowSprite.width * editor.scale)) / 2) + (4 * editor.scale);
    const winY = Math.floor((editor.view.height - (editor.windowSprite.height * editor.scale)) / 2) + (5 * editor.scale);
    for (let i in editor.data) {
        if (pointInRect(mouseX, mouseY, winX + (i * 25 * editor.scale) + editor.scale, winY + editor.scale, (22 * editor.scale), (22 * editor.scale))) {
            editor.selected = i;
            generateState(state);
            break;
        }
    }
}

function pointInRect(px, py, rx, ry, rw, rh) {
    return px < rx + rw && px > rx && py < ry + rh && py > ry;
}

function isNormal(val) {
    return val < -1 || val > 1 || val == btnNone || val == btnNoneS;
}