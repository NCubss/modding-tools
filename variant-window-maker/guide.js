function buildGuide() {
    let selected = -1;
    let firstVariant = -1;
    let addonsExist = false;

    if (!checkData()) {
        return null;
    }
    editor.guideData = genGuideData();

    const select = $('<select class="full center"></select>')
        .on("change", event => {
            $("#code").text(editor.guideData.events[event.target.value]);
        });

    for (const key of Object.keys(editor.guideData.events)) {
        select.append(
            $('<option></option>')
                .val(key)
                .text(key)
        );
    }
    return $('<div id="guide"></div>').append(
        $('<hr>'),
        $('<h2 class="center">Generated Code</h2>'),
        $('<p>Put these events into the res object you are making the variant window for.<p>'),
        $('<ul></ul>').append(
            $('<li>If the event appears gray, right click it and override the event.</li>'),
            $('<li>If the event appears white, open it and replace the entire contents.</li>')
        ),
        select,
        $('<pre id="code" class="view"></div>')
            .text(editor.guideData.events[select.val()])
    );

    function checkData() {
        let refreshed = false;
        let shouldBreak = false;
        // Check for button data first
        for (const [idx, val] of editor.data.entries()) {
            if (val.selected) {
                if (selected == -1) {
                    selected = idx;
                } else {
                    errorCheck(idx, true, '.check', "Only one button must be already selected");
                }
            }
            if (shouldBreak) {
                continue;
            }
            if (val.type == btnVariant && firstVariant == -1) {
                firstVariant = idx;
            } else if (val.type != btnVariant) {
                addonsExist = true;
            }
            errorCheck(idx,
                val.frame === 0,
                '#frame', "Frame number missing"
            );
            errorCheck(idx,
                val.type == btnVariant && val.behavior.type == "changeObject" && val.behavior.newRes === "" && !val.selected,
                '#newRes', "Res object missing"
            );
            errorCheck(idx,
                val.regularRes === "",
                '#regularRes', "Res object missing"
            );
            errorCheck(idx,
                val.bigRes === "",
                '#bigRes', "Res object missing"
            );
        }
        errorCheck(firstVariant,
            selected == -1 && firstVariant != -1,
            '.check', "One button must already be selected"
        );
        return !shouldBreak;

        function errorCheck(idx, bad, selector, text) {
            if (!bad) return;

            if (!refreshed) {
                editor.selected = idx;
                generateState(state);
                refreshed = true;
            }

            $(selector).after($('<div class="error"></div>').text(text));
            shouldBreak = true;
        }
    }

    function genGuideData() {
        const newData = {
            events: {
                "User Event 0": 
`/// @description Create variant window
with (instance_create(x + 8, y + 9, obj_ventana)) {
\tid_object = other.id;\n`
            }
        };
        event0();
        event1();

        return newData;

        function event0() {
            let frameCode = "\t// Set up button icons\n";
            let selectedCode = "\t// Set up selected buttons\n";
            let addonCode = "\t// Set up mushroom, wings and parachute buttons\n";
            let idxVariant = -1;
            let addonExists = false;
            editor.data.forEach(val => {
                switch (val.type) {

                    case btnMushroom:
                        addonCode += `\ts_hongo_1 = other.object_index == ${val.bigRes};\n`;
                        addonExists = true;
                        break;

                    case btnWings:
                        addonCode += `\ts_contorno_1 = other.wings;\n`;
                        addonExists = true;
                        break;

                    case btnParachute:
                        addonCode += `\ts_paracaidas = other.paracaidas;\n`;
                        addonExists = true;
                        break;
                        
                    case btnVariant:
                        idxVariant++;
                        frameCode += `\tindex_object${idxVariant + 1} = ${val.frame - 1};\n`;
                        selectedCode += `\tselected_${idxVariant + 1} = ${val.selected};\n`;
                        break;
                }
            });
            if (idxVariant != -1) {
                newData.events["User Event 0"] += frameCode + selectedCode;
            }
            if (addonExists) {
                newData.events["User Event 0"] += addonCode;
            }
            newData.events["User Event 0"] += `\t// Magic number that determines the window template\n\tnumber = ${editor.number};\n}`;
        }

        function event1() {
            if (firstVariant == -1) {
                return;
            }
            newData.events["User Event 1"] = "/// @description Transform\n\n";
            if ([6, 7, 11, 12].includes(editor.number)) {
                newData.events["User Event 1"] += `switch (transform) {\n`;
                let transform = -1;
                for (const val of editor.data) {
                    if (val.type == btnVariant) {
                        transform++;
                        if (val.behavior.type == "custom") return;
                        newData.events["User Event 1"] +=
`\t// Button #${transform + 1} with frame number #${Math.floor(Math.abs(editor.data[i]))}
\tcase ${transform}:
\t\t${transformCode(i).replaceAll("\n", "\n\t\t")}
\t\tbreak;\n`;
                    }
                }
                newData.events["User Event 1"] += "}";
            } else {
                let unselected = -1;
                editor.data.forEach((val, idx) => {
                    if (val.type == btnVariant && !val.selected) {
                        unselected = idx;
                        return;
                    }
                });
                newData.events["User Event 1"] += transformCode(unselected);
            }
        }

        function event3() {
            
        }

        function transformCode(idx) {
            const val = editor.data[idx];
            if (val.type == btnVariant && val.behavior.type == "custom") {
                return `// You can put your custom code here`
            }
            switch (val.type) {

                case btnMushroom:
                    return `// Play powerup sound
audio_play_sound(scr_snd_powerup(), 0, false);
// Create the big res object
with (instance_create(x, y, ${val.bigRes}) {
\t// Positioning
\tx -= sprite_get_width(mask_index) - sprite_get_width(other.mask_index);
\ty -= sprite_get_height(mask_index) - sprite_get_height(other.mask_index);
\t// Copy over settings (you can add or change copied settings here)
\twings = other.wings;
\tparacaidas = other.paracaidas;
\tkey = other.key;
}

instance_destroy();`

                case btnVariant:
                    return `// Create the transform animation
with (instance_create(x, y, obj_smoke)) {
\tsprite_index = spr_effect_transform;
\timage_index = 0.3;
}
// Create the new res object
with (instance_create(x, y, ${val.behavior.newRes})) {
\twings = other.wings;
\tparacaidas = other.paracaidas;
\tkey = other.key;
\t// You can add or change copied over settings here
}
// Replace icon in the cards bar
with (obj_card_item) {
\tif (obj == object_index) {
\t\tobj = ${val.behavior.newRes};
\t\tobj_draw = ${val.frame - 1};
\t}
}

instance_destroy();`;
            }
        }
    }

}