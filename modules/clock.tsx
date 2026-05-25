import { Astal } from "ags/gtk4";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";
import Gtk from "gi://Gtk"
import { toggleClockPopup } from "./popups/clockPopup";


export default function Clock(){
    const clock = createPoll("", 1000, () => {
        const now = GLib.DateTime.new_now_local();
        return now.format("%H:%M • %d/%m") ?? "";
    });


    const popover = new Gtk.Popover({has_arrow: false});
    popover.set_child(new Gtk.Calendar({show_day_names: true, show_heading: true, show_week_numbers: true}))
    return(
        <box>
            <button 
        cssClasses={['clock']}
        onClicked={toggleClockPopup}>
            {/* () => popover.popup() */}
                <label label={clock} />
            </button>
            {popover}
        </box>
    );

}