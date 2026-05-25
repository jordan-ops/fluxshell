import { Astal } from "ags/gtk4";
import Gtk from "gi://Gtk?version=4.0";
import {createState, createBinding, createComputed, With} from "ags";
import Network from "gi://AstalNetwork";
import Bluetooth from "gi://AstalBluetooth?version=0.1";
import { AudioSection } from "../audio";
import { getNotifications, clearAllNotifications, removeNotification, type Notification } from "../notifstore";
import { BrightnessSection } from "../brightnesSection";






const { TOP, RIGHT, BOTTOM} = Astal.WindowAnchor;

let [getOpen, setOpen] = createState(false);
export const toggleQuickSettings = () => setOpen(prev => !prev);

// State
const network = Network.get_default();
const bluetooth = Bluetooth.get_default();

const [getDND, setDND] = createState(false);

function ToggleTile({
    icon,
    label,
    active,
    onClicked,
} : {
    icon: string;
    label:string;
    active: () => boolean;
    onClicked: () => void;
}) {
     return(
        <button 
        cssClasses={[active() ? "qs-title is-on" : "qs-title is-off"]}
         onClicked={onClicked}>
            <box orientation={Gtk.Orientation.VERTICAL} spacing={4} halign={Gtk.Align.CENTER}>
                <label label={icon} cssClasses={["qs-tile-icon"]} />
                <label label={label} cssClasses={["qs-tile-label"]}/>
            </box>
        </button>
    );
}


// notificationcenter

function NotificationCenter(){
    return(
        <box orientation={Gtk.Orientation.VERTICAL} spacing={8}
        heightRequest={700}>
        <box>
            <label
            label="Notifications"
            hexpand
            halign={Gtk.Align.START}
            cssClasses={["qs-header"]}
            />
            <button
            cssClasses={["qs-clear-btn"]}
            onClicked={() => clearAllNotifications()}>
                <label label="Clear all"/>
            </button>
        </box>

        <With value={getNotifications}>
            {(notifs: Notification[]) => (notifs.length === 0 ? (
                <label
                label="No notifications"
                halign={Gtk.Align.CENTER}
                cssClasses={["qs-notif-empty"]}/>
            ): (
                <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                    {notifs.map((n) => (
                        <box cssClasses={["qs-notif-row"]} spacing={8}>
                            <box orientation={Gtk.Orientation.VERTICAL} hexpand spacing={2}>
                                <box>
                                    <label label={n.summary} cssClasses={["qs-notif-summary"]} hexpand halign={Gtk.Align.START}/>
                                    <label label={n.time} cssClasses={["qs-notif-time"]}/>
                                </box>
                                {n.body !== "" && (
                                    <label label={n.body} cssClasses={["qs-notif-body"]} halign={Gtk.Align.START} maxWidthChars={30} ellipsize={3}/>
                                )}
                            </box>
                            <button cssClasses={["qs-notif-dismiss"]} onClicked={() => removeNotification(n.id)}>
                                <label label="󱎘" />
                            </button>
                </box>
            ))}
            </box>
            ))}
            </With>
            </box>
    );
}

// main panel---------------------------------------

export default function Quicksettings() {
    const wifiEnabled = createComputed(
        [createBinding(network, "wifi")],
        (w) => w?.enabled ?? false
    );

    const btPowered = createBinding(bluetooth, "isPowered");

    return(
        <window
        cssClasses={["qs-window"]}
        layer={Astal.Layer.OVERLAY}
        anchor={TOP | RIGHT | BOTTOM}
        namespace={"quicksettings"}
        exclusivity={Astal.Exclusivity.NORMAL}
        keymode={Astal.Keymode.ON_DEMAND}
        visible ={getOpen}
        marginTop={5}
        marginBottom={1}
        marginRight={1}
        widthRequest={400}>

            <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={16}
            cssClasses={["qs-inner"]}>
                {/* header */}
                <label label={"Quick Settings"} halign={Gtk.Align.START} cssClasses={["qs-header"]} />

                {/* toggle titles */}
                <box spacing={8}>
                    <ToggleTile
                    icon="󰤨"
                    label="Wi-Fi"
                    active = {wifiEnabled}
                    onClicked={() => {
                        if (network.wifi) network.wifi.enabled = !network.wifi.enabled;
                    }}
                    />
                    
                    <ToggleTile
                    icon=""
                    label="Bluetooth"
                    active={btPowered}
                    onClicked={() => bluetooth.toggle()}
                    />

                    <ToggleTile
                    icon=""
                    label="Focus"
                    active={getDND}
                    onClicked={() => setDND(prev => !prev)}
                    />

                </box>

                {/* notification center */}
                <NotificationCenter />
                {/* sliders */}
                <AudioSection />
                <BrightnessSection />
            </box>
        </window>
    )
}