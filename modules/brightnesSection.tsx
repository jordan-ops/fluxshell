import Gtk from "gi://Gtk"
import GLib from "gi://GLib"

function getBrightness(): number {
    try {
        const [, curBytes] = GLib.file_get_contents("/sys/class/backlight/intel_backlight/brightness")
        const [, maxBytes] = GLib.file_get_contents("/sys/class/backlight/intel_backlight/max_brightness")
        const cur = Number(new TextDecoder().decode(curBytes).trim())
        const max = Number(new TextDecoder().decode(maxBytes).trim())
        return cur / max
    } catch {
        return 0.5
    }
}

export function BrightnessSection() {
    const slider = new Gtk.Scale({
        orientation: Gtk.Orientation.HORIZONTAL,
        drawValue: false,
        hexpand: true,
    })
    slider.set_range(0, 1)
    slider.set_increments(0.01, 0.1)
    slider.set_value(getBrightness())

    slider.connect("value-changed", () => {
        const percent = Math.round(slider.get_value() * 100)
        GLib.spawn_command_line_async(`brightnessctl set ${percent}%`)
    })
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
    slider.set_value(getBrightness())
    return true
})

    return (
        <box cssClasses={["qs-section"]} spacing={8} orientation={Gtk.Orientation.VERTICAL}>
            <box spacing={12}>
                <label label="󰃞" cssClasses={["qs-icon"]} />
                <label label="Brightness" hexpand halign={Gtk.Align.START} />
            </box>
            <box cssClasses={["qs-slider-row"]}>
                {slider}
            </box>
        </box>
    )
}