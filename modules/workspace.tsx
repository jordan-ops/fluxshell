import {Astal} from "ags/gtk4"
import Hyprland from "gi://AstalHyprland"
import { createBinding, createComputed, With } from "ags";
import Orientation from "gi://Gtk";

const hyprland = Hyprland.get_default()
//adding some japanese finnese
const jpnumbers: Record<number, string> ={
    1: "一",
    2: "二",
    3: "三",
    4: "四",
    5: "五",
    6: "六",
    7: "七",
    8: "八",
    9: "九",
    10: "十"
};

export default function Workspace() {
    const workspacebinding = createBinding(hyprland, "workspaces");
    
    return(
        <With value={workspacebinding}>
            {(workspaces: Hyprland.Workspace[]) =>{
                //sort workspaces by ID
                const sortedWorkspaces = workspaces.slice().sort((a, b) => a.id - b.id);

                return <box 
                cssClasses={["workspaces-btn"]}
                orientation={Orientation.Orientation.HORIZONTAL}
                spacing={5}>
                    {sortedWorkspaces.map((ws) => {
                        const label = createComputed(
                            [createBinding(ws.monitor, "activeWorkspace")],
                            (activews) => {
                                const num = jpnumbers[ws.id] ?? `${ws.id}`;
                                return ws.id === activews?.id? `${num}` : `●`;
                            }
                        );

                        return (
                            <box>
                            
                                <button
                                cssClasses={["ws-button"]}
                                // keyags ={ws.id}
                                onClicked={() => {
                                    if (ws.monitor.activeWorkspace.id !== ws.id) {
                                        hyprland.dispatch("workspace", `${ws.id}`);
                                    }
                                }}
                                >
                                <label label={label} />
                                </button>
                            </box>
                        )
                    })}
                </box>
            }}
        </With>
    )
}