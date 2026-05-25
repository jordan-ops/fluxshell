import Powerprofiles from "gi://AstalPowerProfiles"
import Gtk from "gi://Gtk"

const pp = Powerprofiles.get_default()

const profileOrder = ["power-saver", "balanced", "performance"]

const profileIcon: Record<string, string>={
    "Power-saver": "🍃",
    "balanced": "",
    "performance": "󱐋"
}
const profileName: Record<string, string> = {
    "Power-saver": "Power Saver",
    "balanced": "Balanced",
    "performance": "Performance"
}
export function powerProfileCard(): Gtk.Widget{
    const label = new Gtk.Label({label: ""})

    function update() {
        const p = pp.activeProfile
        label.set_label(`${profileIcon[p] ?? "󰌪"} ${profileName[p] ?? p}`)
        return true
    }
    update()
    const btn = new Gtk.Button()
    btn.add_css_class("bento-card")
    btn.set_child(label)
    btn.connect("clicked", () => {
        const idx = profileOrder.indexOf(pp.activeProfile)
        pp.activeProfile = profileOrder[(idx +1) % profileOrder.length]
        update()
    })
    return btn
}