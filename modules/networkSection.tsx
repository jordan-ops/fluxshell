import Network from "gi://AstalNetwork";
import { createBinding, createComputed } from "ags";
import Gtk from "gi://Gtk";

const network = Network.get_default();

export function NetworkSection() {
    const state = createBinding(network, "state");
    const wifi = createBinding(network, "wifi");
    const wired = createBinding(network, "wired");

    const connectionName = createComputed([state, wifi, wired], (s, w, e) => {
        if (s === Network.State.CONNECTED_GLOBAL) {
            if (w?.ssid) return w.ssid;
            if (e) return "Ethernet";
        }
        return "Disconnected";
    });

    const icon = createComputed([state, wifi], (s, w) => {
        if (s !== Network.State.CONNECTED_GLOBAL) return "󰤮";
        return w ? "󰤨" : "";
    });

    const wifiEnabled = createBinding(network.wifi!, "enabled");
    const wifiEnabledLabel = createComputed([wifiEnabled], (e) => 
        e ? "On" : "Off"
    );

    return (
        <box cssClasses={["qs-Section"]} spacing={12}
        widthRequest={10}>
            <label label={icon} cssClasses={["qs-icon"]} />
            <label label={connectionName} hexpand halign={Gtk.Align.START} />
            <button
                cssClasses={["qs-toggle"]}
                onClicked={() => {
    console.log("wifi object:", network.wifi);
    console.log("wifi enabled:", network.wifi?.enabled);
    if (network.wifi) network.wifi.enabled = !network.wifi.enabled;
}}
                // onClicked={() => {
                //     if (network.wifi) network.wifi.enabled = !network.wifi.enabled;
                // }}
            >
                <label label={wifiEnabledLabel} />
            </button>
        </box>
    );
}