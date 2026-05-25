import Mpris from "gi://AstalMpris"
import GLib from "gi://GLib"
import { createState } from "ags"
import { toggleMusicPopup } from "./popups/musicpopup"

const mpris = Mpris.get_default()

export default function MusicWidget() {
    const [getTitle, setTitle] = createState("󰝛 Nothing playing")

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
        const player = mpris.players[0]
        if (player && player.title) {
            setTitle(`󰝙 ${player.title}`)
        } else {
            setTitle("󰝛 Nothing playing")
        }
        return true
    })

    return (
        <button onClicked={toggleMusicPopup}>
            <label label={getTitle} maxWidthChars={20} ellipsize={3} />
        </button>
    )
}