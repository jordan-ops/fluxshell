import { Astal } from "ags/gtk4";
import Gtk from "gi://Gtk";
import { createComputed, With } from "ags";
import {
    getNotifications,
    removeNotification,
    type Notification,
} from "../notifstore";

const { TOP, RIGHT } = Astal.WindowAnchor;

const hasToasts = createComputed([getNotifications], (n: Notification[]) => n.some((t) => !t.dismissed));

function ToastItem({ toast }: { toast: Notification }) {
    const icon = new Gtk.Image({
        iconName: toast.appIcon,
        pixelSize: 32,
    });

    return (
        <box cssClasses={["toast"]} spacing={12}>
            {icon}
            <box orientation={Gtk.Orientation.VERTICAL} spacing={2} hexpand>
                <label
                    label={toast.summary}
                    cssClasses={["toast-summary"]}
                    halign={Gtk.Align.START}
                    maxWidthChars={30}
                    ellipsize={3}
                />
                {toast.body !== "" && (
                    <label
                        label={toast.body}
                        cssClasses={["toast-body"]}
                        halign={Gtk.Align.START}
                        maxWidthChars={30}
                        ellipsize={3}
                    />
                )}
            </box>
            <button
                cssClasses={["toast-close"]}
                onClicked={() => removeNotification(toast.id)}
            >
                <label label="󰅖" />
            </button>
        </box>
    );
}

export default function NotificationPopup() {
    return (
        <window
            cssClasses={["notification-popup"]}
            anchor={TOP | RIGHT}
            marginTop={35}
            layer={Astal.Layer.OVERLAY}
            exclusivity={Astal.Exclusivity.IGNORE}
            keymode={Astal.Keymode.NONE}
            visible={hasToasts}
        >
            <box halign={Gtk.Align.CENTER} valign={Gtk.Align.START}>
                <With value={getNotifications}>
                    {(toasts: Notification[]) => (
                        <box
                            orientation={Gtk.Orientation.VERTICAL}
                            spacing={8}
                            cssClasses={["toast-list"]}
                            widthRequest={400}
                        >
                            {toasts.filter((t) => !t.dismissed).map((toast) =>(
                                <ToastItem toast={toast} />
                            ))}
                            {/* {toasts.map((toast) => (
                                <ToastItem toast={toast} />
                            ))} */}
                        </box>
                    )}
                </With>
            </box>
        </window>
    );
}