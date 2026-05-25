import { Astal } from "ags/gtk4"
import Gtk from "gi://Gtk"
import Gdk from "gi://Gdk"
import Apps from "gi://AstalApps"
import { createState, With } from "ags"

const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

const apps = new Apps.Apps()

const [getOpen, setOpen] = createState(false)
export const toggleLauncher = () => setOpen(!getOpen())

export default function Launcher() {
    const [getQuery, setQuery] = createState("")

    // build the search entry imperatively (setup prop not supported)
    const searchEntry = new Gtk.Entry({
        placeholderText: "Search apps...",
        hexpand: true,
    })
    searchEntry.add_css_class("launcher-search")
    searchEntry.connect("changed", () => setQuery(searchEntry.text))

    // close on Escape
    const keyController = new Gtk.EventControllerKey()
    keyController.connect("key-pressed", (_: any, keyval: number) => {
        if (keyval === Gdk.KEY_Escape) setOpen(false)
    })
    searchEntry.add_controller(keyController)

    return (
        <window
            cssClasses={["launcher"]}
            anchor={TOP }
            marginTop={40}
            namespace="ags-launcher"
            layer={Astal.Layer.OVERLAY}
            exclusivity={Astal.Exclusivity.IGNORE}
            keymode={Astal.Keymode.ON_DEMAND}
            visible={getOpen}
            onShow={() => {
                setQuery("")
                searchEntry.text = ""

                
                searchEntry.grab_focus()
            }}
        >
            <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={12}
                cssClasses={["launcher-inner"]}
                widthRequest={800}
                heightRequest={400}
                halign={Gtk.Align.CENTER}
            >
                {searchEntry}

                <scrolledwindow
                    vexpand
                    hscrollbarPolicy={Gtk.PolicyType.NEVER}
                    vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                >
                    <With value={getQuery}>
                        {(q: string) => {
                            const list = q.trim() === "" ? apps.list : apps.fuzzy_query(q)

                            // build a FlowBox imperatively since JSX won't wrap
                            const flowbox = new Gtk.FlowBox({
                                maxChildrenPerLine: 6,
                                minChildrenPerLine: 3,
                                columnSpacing: 8,
                                rowSpacing: 8,
                                halign: Gtk.Align.CENTER,
                                selectionMode: Gtk.SelectionMode.NONE,
                                
                            })
                            

                            for (const app of list) {
                                const img = new Gtk.Image({
                                    iconName: app.iconName ?? "application-x-executable",
                                    pixelSize: 48,
                                })

                                const name = new Gtk.Label({ label: app.name })
                                name.max_width_chars = 10
                                name.ellipsize = 3 // Pango.EllipsizeMode.END

                                const box = new Gtk.Box({
                                    orientation: Gtk.Orientation.VERTICAL,
                                    spacing: 6,
                                    halign: Gtk.Align.CENTER,
                                })
                                box.append(img)
                                box.append(name)

                                const btn = new Gtk.Button({ cssClasses: ["launcher-app-btn"] })
                                btn.set_child(box)
                                btn.connect("clicked", () => {
                                    app.launch()
                                    setOpen(false)
                                })

                                flowbox.append(btn)
                            }

                            return flowbox
                        }}
                    </With>
                </scrolledwindow>
            </box>
        </window>
    )
}