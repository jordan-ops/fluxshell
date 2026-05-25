import Network from "gi://AstalNetwork";
import Bluetooth from "gi://AstalBluetooth";
import Wp from "gi://AstalWp";
import { createBinding, createComputed } from "ags";
import { toggleQuickSettings } from "./popups/quicksettings";

export default function SystemTray() {
    const network = Network.get_default();
    const bluetooth = Bluetooth.get_default();
    const speaker = Wp.get_default()!.audio.default_speaker!;

    // const netIcon = createComputed(
    //     [createBinding(network, "state"), createBinding(network,"wifi")],
    //     (s, w) => {
    //         if (s === Network.State.CONNECTED_GLOBAL){
    //             return w ? "󰤭" : "󰤨";
    //         }
    //         return "󰤭";
    //     }

    const netIcon = createComputed(
    [createBinding(network, "state")],
    (s) => {
        if (s === Network.State.CONNECTED_GLOBAL) {
            return network.wifi ? "󰤨" : "";  // read wifi at compute time
        }
        return "󰤭";
    }
);
        // (state) => state === 2 ? "󰤭" : "󰤨"

    const btIcon = createComputed(
        [createBinding(bluetooth, "isPowered")],
        (on) => on ? "󰂯" : "󰂲"
    );

    const volIcon = createComputed(
        [createBinding(speaker, "volume"), createBinding(speaker, "mute")],
        (v, m) => {
            if (m) return "󰝟";
            if (v < 0.33) return "󰕿";
            if (v < 0.66) return "󰖀";
            return "󰕾";
        }
    );

    return (
        <button onClicked={toggleQuickSettings}
        cssClasses={["icon-tray"]}>
            <box spacing={8}>
                <label label={netIcon} />
                <label label={btIcon} />
                <label label={volIcon} />
            </box>
        </button>
    );
}