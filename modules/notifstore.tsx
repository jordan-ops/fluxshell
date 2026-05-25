import Notifd from "gi://AstalNotifd"
import { createState } from "ags"

export type Notification = {
    id: number;
    summary: string;
    body: string;
    appIcon: string;
    time:string;
    dismissed: boolean;
};

export const [getNotifications, setNotifications] = createState<Notification[]>([]);

export function removeNotification(id: number) {
    setNotifications(getNotifications().filter((n) => n.id !== id));
}

export function clearAllNotifications() {
    setNotifications([])
}

const notifd = Notifd.get_default();

notifd.connect("notified", (_:any, id:number) => {
    const n = notifd.get_notification(id);
    if (!n) return;

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const notif: Notification = {
        id,
        summary:n.summary ??"Notification",
        body: n.body ?? "",
        appIcon:n.appIcon ?? n.desktopEntry ?? "dialog-information",
        time,
        dismissed:false,
    };

    setNotifications([notif, ...getNotifications()]);

    setTimeout(() => {
        setNotifications(getNotifications().map((n) =>
        n.id === id ? {...n, dismissed:true} :n));
    }, 2500);
});