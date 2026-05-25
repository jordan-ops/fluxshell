import { Astal } from "ags/gtk4";
import Wp from "gi://AstalWp"
import {createBinding, createComputed, createState} from "ags"
import Gtk from "gi://Gtk";
import { version } from "system";

const speaker = Wp.get_default()!.audio.default_speaker!;

export function AudioSection() {
    const volume = createBinding(speaker, "volume");
    const mute = createBinding(speaker, "mute");

    const icon = createComputed([volume, mute], (v, m) => {
        if (m) return "";
        if (v < 0.33) return "";
        if (v < 0.66) return "";
        return "";
    });

    const slider = new Gtk.Scale({
        orientation: Gtk.Orientation.HORIZONTAL,
        drawValue: false,
        hexpand: true,
    });
    slider.set_range(0, 1);
    slider.set_increments(0.01, 0.1);

    let settingFromBinding = false;
    
    volume.subscribe((v) => {
        settingFromBinding = true;
        slider.set_value(v);
        settingFromBinding = false;
    });

    slider.connect("value-changed", () => {
        if (settingFromBinding) return;
        speaker.volume = slider.get_value();
    });


    const muteLabel = createComputed([mute], (m) => m ? "Muted" : "On");

    return (
    <box cssClasses={["qs-section"]} 
    orientation={Gtk.Orientation.VERTICAL}
    spacing={8}>
        {/* Top row: icon, label, mute button */}
        <box spacing={12}>
            <label label={icon} cssClasses={["qs-icon"]} />
            <label label="Volume" hexpand halign={Gtk.Align.START} />
            <button
                cssClasses={["qs-toggle"]}
                onClicked={() => { speaker.mute = !speaker.mute; }}
            >
                <label label={muteLabel} />
            </button>
        </box>
        {/* Bottom row: slider */}
        <box cssClasses={["Slider"]}>
            {slider}
        </box>
    </box>
);
}