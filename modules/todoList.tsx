import Gtk from "gi://Gtk"
import { With } from "ags"
import { getTodos, addTodo, toggleTodo, deleteTodo, type Todo } from "./todoStore"
import GLib from "gi://GLib"

function TodoItem({ todo }: { todo: Todo }) {
    return (
        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} cssClasses={["todo-row"]}>
            <button
                cssClasses={["todo-check"]}
                onClicked={() => toggleTodo(todo.id)}
            >
                <label label={todo.done ? "󰄵" : "󰄱"} />
            </button>
            <label
                label={todo.text}
                hexpand
                halign={Gtk.Align.START}
                cssClasses={todo.done ? ["todo-text", "todo-done"] : ["todo-text"]}
                maxWidthChars={22}
                ellipsize={3}
            />
            <button
                cssClasses={["todo-delete"]}
                onClicked={() => deleteTodo(todo.id)}
            >
                <label label="󰅖" />
            </button>
        </box>
    )
}

export default function TodoList() {
   let entry!: Gtk.Entry

return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={8} cssClasses={["todo-section"]}>
        <label label="To-do" halign={Gtk.Align.START} cssClasses={["todo-title"]} />

        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={6}>
            <entry
                hexpand
                placeholderText="Add a task..."
                cssClasses={["todo-entry"]}
                $={(self: Gtk.Entry) => {
                    entry = self
                    self.connect("activate", () => {
                        addTodo(self.text)
                        self.text = ""
                    })
                }}
            />
            <button
                cssClasses={["todo-add-btn"]}
                onClicked={() => {
                    if (!entry) return
                    addTodo(entry.text)
                    entry.text = ""
                }}
            >
                <label label="+" />
            </button>
        </box>

            <scrolledwindow
                vexpand
                hscrollbarPolicy={Gtk.PolicyType.NEVER}
                vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                heightRequest={200}
            >
                <With value={getTodos}>
                    {(todos: Todo[]) =>
                        todos.length === 0 ? (
                            <label
                                label="Nothing here yet"
                                cssClasses={["todo-empty"]}
                                halign={Gtk.Align.CENTER}
                            />
                        ) : (
                            <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                                {todos.map((todo) => (
                                    <TodoItem todo={todo} />
                                ))}
                            </box>
                        )
                    }
                </With>
            </scrolledwindow>
        </box>
    )
}