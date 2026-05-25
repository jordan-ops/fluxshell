import { Astal } from "ags/gtk4"
import Gtk from "gi://Gtk"
import GLib from "gi://GLib"
import Mpris from "gi://AstalMpris"
import { createState } from "ags"

const { TOP } = Astal.WindowAnchor
const mpris = Mpris.get_default()

const [getOpen, setOpen] = createState(false)
export const toggleMusicPopup = () => setOpen(prev => !prev)

export default function MusicPopup() {
    const albumArt = new Gtk.Image()
    albumArt.set_pixel_size(200)
    albumArt.set_from_icon_name("audio-x-generic")

    const titleLabel = new Gtk.Label({ label: "Nothing playing" })
    const artistLabel = new Gtk.Label({ label: "" })

    const prevBtn = new Gtk.Button({ label: "󰒮" })
    const playBtn = new Gtk.Button({ label: "󰐊" })
    const nextBtn = new Gtk.Button({ label: "󰒭" })

    function update() {
        const player = mpris.players[0]
        if (player) {
            titleLabel.set_label(player.title ?? "Unknown")
            artistLabel.set_label(player.artist ?? "Unknown")
            albumArt.set_from_icon_name("audio-x-generic")
            if (player.coverArt) albumArt.set_from_file(player.coverArt)
            playBtn.set_label(player.playbackStatus === Mpris.PlaybackStatus.PLAYING ? "󰏤" : "󰐊")
        } else {
            titleLabel.set_label("Nothing playing")
            artistLabel.set_label("")
            albumArt.set_from_icon_name("audio-x-generic")
            playBtn.set_label("󰐊")
        }
        return true
    }

    prevBtn.connect("clicked", () => mpris.players[0]?.previous())
    playBtn.connect("clicked", () => mpris.players[0]?.play_pause())
    nextBtn.connect("clicked", () => mpris.players[0]?.next())

    update()
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, update)

    const controls = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 25 })
    controls.append(prevBtn)
    controls.append(playBtn)
    controls.append(nextBtn)

    const info = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10})
    info.append(titleLabel)
    info.append(artistLabel)
    info.append(controls)

    const content = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 90,width_request:600 })
    content.add_css_class("music-popup")
    content.append(albumArt)
    content.append(info)

    return (
        <window
            cssName="music-popup-window"
            anchor={TOP}
            marginTop={5}
            layer={Astal.Layer.OVERLAY}
            exclusivity={Astal.Exclusivity.NORMAL}
            keymode={Astal.Keymode.NONE}
            visible={getOpen}
        >
            {content}
        </window>
    )
}