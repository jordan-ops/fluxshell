import { Astal } from "ags/gtk4";
import Gtk from "gi://Gtk?version=4.0";
import { createState, createBinding, createComputed} from "ags";
import GLib from "gi://GLib?version=2.0";
import Mpris from "gi://AstalMpris?version=0.1";
import { createPoll } from "ags/time";
import GL from "gi://GL?version=1.0";
import Soup from "gi://Soup?version=3.0";
import { powerProfileCard } from "./powerprofiles";
import { toggleWallpaper } from "../../widget/wallpaper";

const { TOP }= Astal.WindowAnchor
const mpris = Mpris.get_default()


import Cairo from "cairo"

function createGauge(label: string, color: [number, number, number]) {
    const drawing = new Gtk.DrawingArea()
    drawing.set_size_request(80, 80)
    let currentValue = 0

    
    drawing.set_draw_func((_: any, cr: any) => {
        const cx = 40, cy = 40, radius = 30
        const startAngle = Math.PI * 0.75
        const endAngle = Math.PI * 2.25
        const valueAngle = startAngle + (endAngle - startAngle) * (currentValue / 100)

        // background ring
        cr.setSourceRGBA(1, 1, 1, 0.1)
        cr.setLineWidth(6)
        cr.arc(cx, cy, radius, startAngle, endAngle)
        cr.stroke()

        // colored arc
        cr.setSourceRGB(...color)
        cr.setLineWidth(6)
        cr.arc(cx, cy, radius, startAngle, valueAngle)
        cr.stroke()

        // center text
        cr.setSourceRGB(1, 1, 1)
        cr.selectFontFace("Sans", Cairo.FontSlant.NORMAL, Cairo.FontWeight.NORMAL)
        cr.setFontSize(10)
        const text = `${currentValue}%`
        const ext = cr.textExtents(text)
        cr.moveTo(cx - ext.width / 2, cy + ext.height / 2)
        cr.showText(text)

        // label below
        cr.setFontSize(9)
        const lext = cr.textExtents(label)
        cr.moveTo(cx - lext.width / 2, cy + radius + 14)
        cr.showText(label)
    })

    return {
        widget: drawing,
        setValue(v: number) {
            currentValue = v
            drawing.queue_draw()
        }
    }
}

const [getOpen, setOpen] = createState(false)
export const toggleDashboard = () =>setOpen(prev => !prev)

export default function Dashboard() {
    const grid = new Gtk.Grid()
    grid.set_column_spacing(8)
    grid.set_row_spacing(8)
    grid.set_column_homogeneous(true)
    grid.set_row_homogeneous(true)


    // Greeting card
    // ------------------------------------------------------------------
    const username = GLib.get_user_name()
    const greetingLabel = new Gtk.Label({label: `Hello, ${username}!` })

    const greetingCard = new Gtk.Box()
    greetingCard.add_css_class("bento-card")
    greetingCard.append(greetingLabel)

    grid.attach(greetingCard, 0,0,1,1)


    // Clock card
    // -------------------------------------------------------------------------------
    
    const clockLabel = new Gtk.Label({label: ""})
    function updateClock() {
        const now = GLib.DateTime.new_now_local()
        clockLabel.set_label(now.format("%H:%M:%S") ?? "")
        return true
    }
    updateClock()
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, updateClock)
    
    const clockCard = new Gtk.Box()
    clockCard.add_css_class("bento-card")
    clockCard.append(clockLabel)
    grid.attach(clockCard, 0,1,1,1)


    // Music card
    // ----------------------------------------------------------------
    // const players = createBinding(mpris, "players")
    
    // const titleLabel = new Gtk.Label({label: "Nothing playing"})
    // const artistLabel = new Gtk.Label({ label:""})
    // const albumArt = new Gtk.Image()
    
    // function updateMusic() {
    //     const player = mpris.players[0]
    //     if(player) {
    //         titleLabel.set_label(player.title ?? "Unknown Title")
    //         artistLabel.set_label(player.artist ?? "unknown Artist")
            
    //         if (player.coverArt){
    //             albumArt.set_from_file(player.coverArt)
    //         }
    //         else{
    //             albumArt.set_from_icon_name("audio-x-generic")
    //         }
    //     } else{
    //         titleLabel.set_label("Nothing playing")
    //         artistLabel.set_label("")
    //         albumArt.set_from_icon_name("audio-x-generic")
    //     }
    //     return true
    // }
    // updateMusic()
    // GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, updateMusic)
    
    // albumArt.set_pixel_size(220)
    // albumArt.set_from_icon_name("audio-x-generic")

    // const musicCard = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, spacing: 8})
    // musicCard.add_css_class("bento-card")
    // musicCard.append(albumArt)
    // musicCard.append(titleLabel)
    // musicCard.append(artistLabel)

    const wallpaperBtn = new Gtk.Button({ label: "󰋩 Wallpapers" })
    wallpaperBtn.connect("clicked", () => {
        setOpen(false)
        toggleWallpaper()
    })
    wallpaperBtn.add_css_class("bento-card")

    grid.attach(wallpaperBtn, 1,0,1,2)


    // weatherCard
    // ------------------------------------------------------------------
    const session = new Soup.Session()

    const weatherLabel = new Gtk.Label({ label: "Loading...",css_classes:["weatherlabel"]})

    const weatherCard = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, spacing:8})
    weatherCard.add_css_class("bento-card")
    weatherCard.append(weatherLabel)
    grid.attach(weatherCard, 2,0,1,1)

    function updateWeather() {
        const msg = new Soup.Message({
            method: "GET",
            uri: GLib.Uri.parse("https://wttr.in/kampala?format=3", GLib.UriFlags.NONE)
        })

        session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null, (_, result) =>{
            try{
                const bytes = session.send_and_read_finish(result)
                const text = new TextDecoder().decode(bytes.get_data()!)
                weatherLabel.set_label(text.trim())
            } catch { weatherLabel.set_label("Weather unavailable")}
        })
    }
    updateWeather()
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 600000, () => {
        updateWeather()
        return true
    } )

    // PowerProfileCard
    // ---------------------------------------------------------
    grid.attach(powerProfileCard(), 2,1,1,1)



    // PowerOptionscards
    // --------------------------------------------------------

    const shutdownBtn = new Gtk.Button({ label: ""})
    shutdownBtn.connect("clicked", () =>{
        GLib.spawn_command_line_async("systemctl poweroff")
    })
    const rebootBtn = new Gtk.Button({label: ""})
        rebootBtn.connect("clicked", () =>{
        GLib.spawn_command_line_async("systemctl reboot")
    })
    const logOutBtn = new Gtk.Button({label: "󰍃"})
        logOutBtn.connect("clicked", () =>{
        GLib.spawn_command_line_async("hyprctl dispatch exit")
    })
    const powerOptionsCard = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing:8})
   powerOptionsCard.add_css_class("bento-card")
   powerOptionsCard.append(shutdownBtn)
   powerOptionsCard.append(rebootBtn)
   powerOptionsCard.append(logOutBtn)
   grid.attach(powerOptionsCard, 2,2,1,1)



//    SystemInfoCard
// ------------------------------------------------------------------
// System info card
const uptimeLabel = new Gtk.Label({ label: "Uptime: -" })

let prevIdle = 0
let prevTotal = 0

const cpu = createGauge("CPU", [0.8, 0.5, 1.0])
const ram = createGauge("RAM", [0.5, 0.8, 1.0])

function updateSystemInfo() {
    // CPU
    try {
        const [, cpuBytes] = GLib.file_get_contents("/proc/stat")
        const cpuLine = new TextDecoder().decode(cpuBytes).split("\n")[0]
        const parts = cpuLine.trim().split(/\s+/).slice(1).map(Number)
        const idle = parts[3]
        const total = parts.reduce((a, b) => a + b, 0)
        const diffIdle = idle - prevIdle
        const diffTotal = total - prevTotal
        const usage = diffTotal === 0 ? 0 : Math.round((1 - diffIdle / diffTotal) * 100)
        prevIdle = idle
        prevTotal = total
        cpu.setValue(usage)
    } catch { }

    // RAM
    try {
        const [, memBytes] = GLib.file_get_contents("/proc/meminfo")
        const memText = new TextDecoder().decode(memBytes)
        const total = Number(memText.match(/MemTotal:\s+(\d+)/)?.[1] ?? 0)
        const available = Number(memText.match(/MemAvailable:\s+(\d+)/)?.[1] ?? 0)
        ram.setValue(Math.round((total - available) / total * 100))
    } catch { }

    // Uptime
    try {
        const [, upBytes] = GLib.file_get_contents("/proc/uptime")
        const seconds = Math.floor(Number(new TextDecoder().decode(upBytes).split(" ")[0]))
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        uptimeLabel.set_label(`󰅐 ${h}h ${m}m`)
    } catch { }

    return true
}

updateSystemInfo()
GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, updateSystemInfo)

const sysCard = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 24 })
sysCard.add_css_class("bento-card")
sysCard.append(cpu.widget)
sysCard.append(ram.widget)
sysCard.append(uptimeLabel)

grid.attach(sysCard, 0, 2, 2, 1)


    return(
        <window
        cssName={"dashboard"}
        anchor={TOP}
        marginTop={5}
        layer={Astal.Layer.OVERLAY}
        exclusivity={Astal.Exclusivity.NORMAL}
        visible={getOpen}
        widthRequest={600}
        heightRequest={400}>
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12}
            halign={Gtk.Align.START}>
                {grid}
            </box>
        </window>
    )
} 