import app from "ags/gtk4/app"
import style from "./style.css"
import Bar from "./widget/Bar"
import ClockPopup from "./modules/popups/clockPopup"
import GLib from "gi://GLib?version=2.0"
import Gio from "gi://Gio?version=2.0"
// import WelcomeWindow from "./modules/popups/welcome-window"
import QuickSettings from "./modules/popups/quicksettings"
// import Launcher from "./modules/popups/launcher"
import notificationPpoup from "./modules/popups/notifpopup"
import wallpapers from "./widget/wallpaper"
import Dashboard from "./modules/popups/dashboard"
import MusicPopup from "./modules/popups/musicpopup"

const COLORS_PATH = "/home/jordan/.config/ags/colors.css"

// function loadColors(): string {
//   try {
//     return new TextDecoder().decode(
//       GLib.file_get_contents(COLORS_PATH)[1]
//     )
//   } catch {
//     return ""
//   }
// }
function loadColors(): string {
    try {
        const content = new TextDecoder().decode(
            GLib.file_get_contents(COLORS_PATH)[1]
        )
        print("Colors loaded, length:", content.length)
        return content
    } catch (e) {
        print("Failed to load colors:", e)
        return ""
    }
}

function applyAllCss() {
  app.apply_css(loadColors() + style, true)
}

app.start({
  css: loadColors() + style,
  main() {
    app.get_monitors().map(Bar);
    // const monitors = app.get_monitors();
    // monitors.forEach((m ,i) =>{
    //     print(`Monitor ${i}: ${m.get_manufacturer()} ${m.get_geometry().width}x${m.get_geometry().height}`);
    // });
    // monitors.map(Bar);
    ClockPopup();
    notificationPpoup();
    // Launcher();
    QuickSettings();
    wallpapers();
    Dashboard();
    MusicPopup();


    app.connect("monitor-added", (_:any, monitor:any) => {Bar(monitor); });

    const file = Gio.File.new_for_path("/home/jordan/.config/ags")
const monitor = file.monitor_directory(Gio.FileMonitorFlags.NONE, null)
    
    monitor.connect("changed", (_: any, changedFile: any) => {
    const name = changedFile.get_basename()
    if (name === "colors.css") {
        print("Colors file changed, reapplying...")
        applyAllCss()
    }
})

  },
})


