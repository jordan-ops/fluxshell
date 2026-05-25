import Astal from "gi://Astal"
import Gtk from "gi://Gtk"
import Powerprofiles from "gi://AstalPowerProfiles"
import { createBinding, createComputed } from "gnim"

const pp = Powerprofiles.get_default()


const profiles = [
    {id: "power-saver", label:" Saver"},
    {id: "balanced", label:" Balanced"},
    {id: "performance", label:" Performance"}
]

export default function PowerProfiles(){
    const active = createBinding(pp, "activeProfile")
    
    return(
        <box cssClasses={["pp-section"]} spacing={8} orientation={Gtk.Orientation.HORIZONTAL}>
            {profiles.map(({id, label}) =>{
                const isActive = createComputed([active], (a) => a ===id)

                const classes = createComputed([isActive], (a) => a? ["pp-btn", "pp-active"]:["pp-btn"]
            )
            function setProfile() {
                pp.activeProfile = id
            }

            return(
                <button
                cssClasses={classes}
                onClicked={setProfile}>
                    <label label={label} />
                </button>
            )
            })}
        </box>
    )
}