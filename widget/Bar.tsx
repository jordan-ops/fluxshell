import {Astal} from "ags/gtk4"
import Battery from "../modules/battery"
import Workspace from "../modules/workspace"
import Clock from "../modules/clock"
import SystemTray from "../modules/systemtray"
import QuickSettings from "../modules/popups/quicksettings"
// import Applauncher from "./Applauncher"
// import Launcher, { toggleLauncher } from "./launcher"
import Gdk from "gi://Gdk"
import app from "ags/gtk4/app"
import { toggleWallpaper } from "./wallpaper"
import { toggleDashboard } from "../modules/popups/dashboard"
import MusicWidget from "../modules/music"

const {TOP, LEFT, RIGHT} = Astal.WindowAnchor
export default function Bar(monitor:Gdk.Monitor) {
  return (
    <>
    <window 
    visible 
    gdkmonitor={monitor}
    anchor={TOP | LEFT | RIGHT}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    cssName={"bar"}>
      <centerbox>
        <box $type="start"
        spacing={8}>
          <button
          onClicked={toggleDashboard}
          >
            <label label={"󰀄"} />
          </button>

          <Clock />
          <MusicWidget />
        </box>
        <box $type="center">
          <Workspace />
          </box>
        <box $type="end"
        spacing={8}>
          {/* <BluetoothWidget />
          <NetworkWidget /> */}
          {/* <Audio /> */}
           <SystemTray />

           <button
                onClicked={toggleWallpaper}>
                    <label label={("wallpaper")}/>
                </button>
          <Battery />
          </box>
      </centerbox>
    </window>
    </>
    
  )
}
