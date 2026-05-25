import { Astal } from "ags/gtk4"
import Gtk from "gi://Gtk";
import Gdk from "gi://Gdk";
import GLib from "gi://GLib";
import { createState, createBinding, With } from "ags";

const {TOP, LEFT } = Astal.WindowAnchor;

let [getOpen, setOpen] = createState(false);
export const toggleClockPopup =() => setOpen(prev => !prev);


//-------------------CALENDAR WIDGET-----------------------
function Calendar() {
    return (
        <box cssClasses={["calendar-section"]}>
            <Gtk.Calendar
                cssClasses={["calendar"]}
                showDayNames={true}
                showHeading={true}
            />
        </box>
    );
}

export default function ClockPopup() {

    return (
        <window
            cssClasses={["clock-popup"]}
            anchor={TOP | LEFT}
            marginTop={10}
            marginLeft={18}
            layer={Astal.Layer.TOP}
            exclusivity={Astal.Exclusivity.NORMAL}
            // keymode={Astal.Keymode.ON_DEMAND}
            visible={getOpen}
        >
            <box
                cssClasses={["clock-popup-inner"]}
                // vertical={true}
                spacing={12}
                widthRequest={280}
            >
                <Calendar />
            </box>
        </window>
    );

}
