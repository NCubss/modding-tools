// States
const statePicker = 0;
const stateEditor = 1;

// Button values
const btnVariant = 0;
const btnMushroom = 1;
const btnWings = 2;
const btnParachute = 3;

let state = statePicker;

let editor = {
    data: [],
    number: -1,
    selected: 0,
    windowSprite: null,
    scale: 4
};

// called once all the stuff in res.js is loaded
function main() {
    generateState(state);
}

$(window).on("beforeunload", event => {
    if (state == stateEditor) {
        event.preventDefault();
    }
});

// generate content depending on state in #app
function generateState(st) {
    switch (st) {

        case statePicker:
            const picker = $('<div class="picker"></div>');
            // Template Buttons
            addTemplateBtn(5, [btnVariant, btnVariant, btnMushroom, btnWings, btnParachute], picker); // obj_ventana default
            addTemplateBtn(1, [btnWings], picker);
            addTemplateBtn(2, [btnWings, btnParachute], picker);
            addTemplateBtn(2.1, [btnVariant, btnVariant], picker);
            addTemplateBtn(3, [btnMushroom, btnWings, btnParachute], picker);
            addTemplateBtn(3.1, [btnVariant, btnVariant, btnParachute], picker);
            addTemplateBtn(3.2, [btnVariant, btnVariant, btnWings], picker);
            addTemplateBtn(4, [btnVariant, btnVariant, btnWings, btnParachute], picker);
            addTemplateBtn(6, [btnVariant, btnVariant, btnVariant, btnVariant, btnVariant], picker); // #184 = make pipe pair sprite
            addTemplateBtn(7, [btnVariant, btnVariant, btnVariant], picker);
            addTemplateBtn(10, [btnVariant, btnVariant, btnWings], picker);
            addTemplateBtn(11, [btnVariant, btnVariant, btnVariant, btnVariant], picker);
            addTemplateBtn(12, [btnMushroom, btnWings, btnVariant, btnVariant, btnVariant, btnVariant], picker);
            addTemplateBtn(13, [btnMushroom, btnVariant, btnVariant], picker);
            addTemplateBtn(14, [btnWings, btnParachute, btnVariant, btnVariant], picker);

            $('#app').empty().append('<h2 class="center">Pick a Template</h2>', picker);
            break;
        
        case stateEditor:
            redrawView();
            $('#app').empty().append(
                $('<h2 class="center">Editor</h2>'),
                $('<div class="btngroup right"></div>')
                    .append(
                        $('<button>Save As Image</button>')
                            .on("click", event => {
                                const canvas = new OffscreenCanvas(editor.windowSprite.width, editor.windowSprite.height);
                                genImage(editor.data, 1, canvas);

                                const download = $('<a download="window"></a>');
                                canvas.convertToBlob().then(val => {
                                    download.attr("href", URL.createObjectURL(val));
                                    download[0].click();
                                    URL.revokeObjectURL(download.attr("href"));
                                });
                            }),
                        $('<button>Get Code</button>')
                            .on("click", event => {
                                const guide = buildGuide();
                                if (guide != null) {
                                    $('.options').replaceWith(generateOptions());
                                    $('.options').after(guide);
                                    guide[0].scrollIntoView({ behavior: "smooth", block: "start" });
                                }
                            })
                    ),
                $('<canvas id="view" width="934" height="250" class="view"></canvas>')
                    .on("click", selectCheck),
                generateOptions()
            );
    }
}

// generate and add template button
function addTemplateBtn(number, items, parent) {
    const canvas = $('<canvas width="400" height="200"></canvas>');
    genImage(items.map(val => { return { type: val, frame: 0 } }), 2, canvas[0]);
    const btn = $('<button></button')
        .attr("data-number", number.toString())
        .attr("data-buttons", "")
        .on("click", event => {
            const buttons = event.currentTarget.dataset.buttons.split(",").map(v => Number(v));
            editor.number = Number(event.currentTarget.dataset.number);
            editor.data = Array(buttons.length);
            
            buttons.forEach((val, idx) => {
                editor.data[idx] = { type: val };
                switch (val) {

                    case btnMushroom:
                        editor.data[idx].regularRes = "";
                        editor.data[idx].bigRes = "";
                        break;
                    
                    case btnVariant:
                        editor.data[idx].frame = 0;
                        editor.data[idx].selected = false;
                        editor.data[idx].behavior = {
                            type: "changeObject",
                            newRes: ""
                        };
                        break;
                }
            });

            state = stateEditor;
            generateState(state);
        });
    
    items.forEach((val, idx) => {
        if (idx != 0) btn[0].dataset.buttons += ",";
        btn[0].dataset.buttons += String(val);
    });
    btn.append(canvas);
    parent.append(btn);
}

// generate the options pane below the editor view
function generateOptions() {
    const options = $('<div class="options"></div>');

    switch (selected().type) {

        case btnMushroom:
            options.append(
                $('<div><h3>Behavior</h3></div>').append(
                    $('<label for="regularRes" class="full">Regular res object:</label>'),
                    $('<input id="regularRes" type="text" required placeholder="obj_..._res" class="full code">')
                        .val(selected().regularRes)
                        .on("change", event => {
                            selected().regularRes = event.target.value;
                        }),
                    $('<label for="bigRes" class="full">Big res object:</label>'),
                    $('<input id="bigRes" type="text" required placeholder="obj_..._b_res" class="full code">')
                        .val(selected().bigRes)
                        .on("change", event => {
                            selected().bigRes = event.target.value;
                        })
                )
            );
            break;

        case btnWings:
        case btnParachute:
            options.append(
                $('<p class="center italic">This button is handled automatically and provides no options.</p>')
            );
            break;
        
        case btnVariant:
            options.append(
                $('<div><h3>General</h3></div>').append(
                    $('<label for="frame" class="full">Frame number (from <code>spr_cards_...</code>, starting from 1)</label>'),
                    $('<input id="frame" type="number" required min="1" placeholder="0">')
                        .val(selected().frame)
                        .on("change", event => {
                            if (event.target.checkValidity()) {
                                selected().frame = event.target.value;
                                redrawView();
                            }
                        }),
                    $('<div class="check"></div>').append(
                        $('<input id="selected" type="checkbox">')
                            .prop("checked", selected().selected)
                            .on("change", event => {
                                selected().selected = event.target.checked;
                                $('.options').replaceWith(generateOptions());
                                redrawView();
                            }),
                        $('<label for="selected">Already Selected</label>')
                    )
                ),
                $('<div><h3>Behavior</div>').append(
                    $('<select id="behavior" class="full"></select>')
                        .append(
                            $('<option value="changeObject">Change Object</option>'),
                            $('<option value="custom">Custom / None</option>')
                        )
                        .val(selected().behavior.type)
                        .prop("disabled", selected().selected)
                        .on("change", event => {
                            selected().behavior.type = event.target.value;
                            $('.options').replaceWith(generateOptions());
                        }),
                    $('<hr>'),
                    generateBehaviorOptions()
                )
            )
            break;
    }
    return options;
}

function generateBehaviorOptions() {
    if (selected().selected) {
        return $('<div id="behaviorOptions"></div>').append(
            $('<p class="center italic">Already selected buttons can\'t have a behavior.</p>')
        );
    }
    switch (selected().behavior.type) {

        case "changeObject":
            return $('<div id="behaviorOptions"></div>').append(
                $('<label for="newRes" class="full">New res object:</label>'),
                $('<input id="newRes" type="text" required placeholder="obj_..._res" class="full code">')
                    .val(selected().behavior.newRes)
                    .on("change", event => {
                        selected().behavior.newRes = event.target.value;
                    })
            );
        
        case "custom":
            return $('<div id="behaviorOptions"></div>').append(
                $('<p class="center italic">By default, no code is supplied for this behavior. You will be able to add code once you go through the guide.</p>')
            );
    }
}

// check if user selected a different button in editor
function selectCheck(event) {
    const mouseX = event.pageX - $('#view').offset().left;
    const mouseY = event.pageY - $('#view').offset().top;
    const winX = Math.floor(($('#view').attr('width') - (editor.windowSprite.width * editor.scale)) / 2) + (4 * editor.scale);
    const winY = Math.floor(($('#view').attr('height') - (editor.windowSprite.height * editor.scale)) / 2) + (5 * editor.scale);
    for (let i in editor.data) {
        if (pointInRect(mouseX, mouseY, winX + (i * 25 * editor.scale) + editor.scale, winY + editor.scale, (22 * editor.scale), (22 * editor.scale))) {
            editor.selected = i;
            redrawView();
            $('.options').replaceWith(generateOptions());
            break;
        }
    }
}

function pointInRect(px, py, rx, ry, rw, rh) {
    return px < rx + rw && px > rx && py < ry + rh && py > ry;
}

function selected() {
    return editor.data[editor.selected];
}