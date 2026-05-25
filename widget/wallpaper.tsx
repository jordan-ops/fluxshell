import Gtk from "gi://Gtk"
import Gdk from "gi://Gdk"
import Astal from "gi://Astal"
import { createState, With } from "gnim"
import GLib from "gi://GLib"
import Gio from "gi://Gio"
import GdkPixbuf from "gi://GdkPixbuf"
import app from "ags/gtk4/app"
import style from "../style.css"


const {TOP, LEFT, RIGHT} = Astal.WindowAnchor
const wallpaper_path = "/home/jordan/Wallpapers"




function getWallpapers(): string[] {
 const wallpapers: string[] = []

 const dir = Gio.File.new_for_path(wallpaper_path)
 const enumerator = dir.enumerate_children(
    "standard::name,standard::type",
    Gio.FileQueryInfoFlags.NONE,
    null
 )

  let fileInfo = enumerator.next_file(null)
  while (fileInfo !== null) {
    const name = fileInfo.get_name()
    if (name.match(/\.(.jpg|jpeg|png|webp|gif)$/i)) {
        wallpapers.push(`${wallpaper_path}/${name}`)
    }
    fileInfo = enumerator.next_file(null)
  }
  enumerator.close(null)
  return wallpapers
}

let [getOpen, setOpen] = createState(false);
export const toggleWallpaper =() => setOpen(prev => !prev)

export default function wallpapers() {
    const wallpapers = getWallpapers()
    const [getSelected, setSelected] = createState("")
    return(
        <window
        visible ={getOpen}
        anchor={TOP}
        // marginTop={40}
        keymode={Astal.Keymode.ON_DEMAND}
        exclusivity={Astal.Exclusivity.NORMAL}
        namespace={"wallpaper-picker"}
        >
            <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={12}
            cssClasses={["wallpaper"]}
            widthRequest={800}
            heightRequest={400}
            halign={Gtk.Align.CENTER}>
                <scrolledwindow
                vexpand
                hscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                vscrollbarPolicy={Gtk.PolicyType.NEVER}>
                    <box
                    orientation={Gtk.Orientation.HORIZONTAL}
                    spacing={8}>
                        {wallpapers.map((path) => {
                            const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(path, 300, 300, false)
                            const image = new Gtk.Picture()
                            image.set_pixbuf(pixbuf)
                            image.set_content_fit(Gtk.ContentFit.COVER)
                            image.set_size_request(150, 150)
                            const isSelected = path === getSelected()

                            return(
                                <button
                                cssClasses={isSelected ? ["wallpaper-btn", "selected"] : ["wallpaper-btn"]}
                                widthRequest={150}
                                heightRequest={150}
                                onClicked={() => {
                                    setSelected(path)
                                    setOpen(false)
                                    GLib.spawn_command_line_async(`swww img ${path} --transition-type wipe`)
                                    GLib.spawn_command_line_async(`matugen image ${path} --prefer=lightness`)

                                    
                                    
                                    setTimeout(() => {
                                        app.reset_css()
                                        const colors = new TextDecoder().decode(
                                            GLib.file_get_contents("/home/jordan/.config/ags/colors.css")[1]
                                        )
                                        app.apply_css(colors + style)
                                    }, 2000)
                                    GLib.spawn_command_line_async(`~/.config/typora/generate-typora-theme.sh`)

                                    GLib.spawn_command_line_async(`if [[ ${path} != *.gif ]]; then ln -sf ${path} "$HOME/.cache/current_wallpaper" fi`);
                                }}
                                >
                                    {image}
                                </button>
                            )
                        })}
                    </box>
                    
                </scrolledwindow>
            </box>
        </window>
    )
}