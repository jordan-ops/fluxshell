import { Astal } from "ags/gtk4"
import {createBinding, createComputed} from "ags"
import Bluetooth from "gi://AstalBluetooth"
import Gtk from "gi://Gtk"
import { NetworkSection } from "./networkSection"



const bluetooth = Bluetooth.get_default()

export function BluetoothSection() {
    const powered = createBinding(bluetooth, "isPowered");

    const statusText = createComputed([powered], (isOn) => {
        if (!isOn) return "Bluetooth Off";

        const connected = bluetooth.devices?.find((d) => d.connected);
        return connected ? connected.name : "Bluetooth On";
    });

    const icon = createComputed([powered], (isOn) =>
    isOn ? "󰂯" : "󰂯"
);

    const poweredLabel = createComputed([powered], (isOn) => isOn ? "On" : "Off")
    return(
        <box cssClasses={["qs-Section"]} spacing={10}
        widthRequest={10}>
            <label label={icon} cssClasses={["qs-icon"]} />
            <label label={statusText} hexpand halign={Gtk.Align.START} />

            <button
            cssClasses={["qs-toggle"]}
            onClicked={() => bluetooth.toggle()}
            >
                <label label={poweredLabel} />
            </button>
        </box>
    )


}
