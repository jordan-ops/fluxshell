import Battery from "gi://AstalBattery"
import { createBinding, createComputed } from "ags";
import Gtk from "gi://Gtk";
import Gdk from "gi://Gdk";
import GLib from "gi://GLib";  // ← add this
import Gio from "gi://Gio?version=2.0";



function getColor(name: string): string {
    try {
        const content = new TextDecoder().decode(
            GLib.file_get_contents("/home/jordan/.config/ags/colors.css")[1]
        )
        console.log("colors file: ", content.slice(0, 200))
        const match = content.match(
            new RegExp(`@define-color\\s+${name}\\s+(#[0-9a-fA-F]+)`)
        )
        console.log("match for", name, ":", match?.[1])
        return match ? match[1] : "#ffffff"
    } catch {
        return "#ffffff"
    }
}

const battery = Battery.get_default()

export default function BatteryWidget() {

    const percentage = createBinding(battery, "percentage")
    const charging = createBinding(battery, "charging")

    const percentText = createComputed([percentage], (p) =>
        `${Math.round(p * 100)}`
    )

    const chargingIcon = createComputed([charging], (c) =>
        c ? "󱐋" : ""
    )

    // CssProvider lets us apply dynamic CSS to a specific widget
    const cssProvider = new Gtk.CssProvider()

    function updateGradient(p: number) {
        const colorFile = Gio.File.new_for_path("/home/jordan/.config/ags/colors.css")
        const monitor = colorFile.monitor_file(Gio.FileMonitorFlags.NONE, null)
        monitor.connect("changed", () => {setTimeout(() =>  updateGradient(battery.percentage),500)})
        const pct = Math.round(p * 100)
        // const fillColor = pct <= 20 ? "@on_error" : "@primary"
        // ← use getColor() instead of CSS variables
const fillColor = pct <= 20 ? getColor("error") : getColor("primary")
         const emptyColor = getColor("surface")
    const textColor = pct <= 20 ? getColor("on_surface_variant") : getColor("on_primary")

        // load_from_string applies new CSS to the provider
        cssProvider.load_from_string(`
            button {
                background: linear-gradient(to right,
                    ${fillColor} ${pct}%,
                    rgba(255, 255, 255, 0.35) ${pct}%
                );
                border-radius: 999px;
                padding: 2px 12px;
                border: none;
            }
                 label {
            color: ${textColor};
            font-weight: bold;
        }
        `)
        
    }

    // draw initial gradient right away
    updateGradient(battery.percentage)

    // update whenever percentage changes
    // subscribe passes no args — we read the value from battery directly
    percentage.subscribe(() => updateGradient(battery.percentage))

    return (
        <button
            cssClasses={["battery-pill"]}
            $={(self: Gtk.Button) => {
                // attach our css provider to just this widget
                self.get_style_context().add_provider(
                    cssProvider,
                    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
                )
            }}
        >
            <box spacing={4}>
                <label label={percentText} cssClasses={["battery-number"]} />
                <label label={chargingIcon} cssClasses={["battery-icon"]} />
            </box>
        </button>
    )
}
