import GLib from "gi://GLib"
import { createState } from "ags"

const TODO_PATH = `${GLib.get_user_data_dir()}/ags-bar/todos.json`

export type Todo = {
    id: number
    text: string
    done: boolean
}

function loadTodos(): Todo[] {
    try {
        const [ok, bytes] = GLib.file_get_contents(TODO_PATH)
        if (!ok) return []
        return JSON.parse(new TextDecoder().decode(bytes)) as Todo[]
    } catch {
        return []
    }
}

function saveTodos(todos: Todo[]) {
    const dir = `${GLib.get_user_data_dir()}/ags-bar`
    GLib.mkdir_with_parents(dir, 0o755)
    GLib.file_set_contents(TODO_PATH, JSON.stringify(todos.filter(t => !t.done)))
}

export const [getTodos, setTodos] = createState<Todo[]>(loadTodos())

export function addTodo(text: string) {
    if (!text.trim()) return
    const next: Todo = { id: Date.now(), text: text.trim(), done: false }
    const updated = [...getTodos(), next]
    setTodos(updated)
    saveTodos(updated)
}

export function toggleTodo(id: number) {
    const updated = getTodos().map(t => t.id === id ? { ...t, done: !t.done } : t)
    setTodos(updated)
    saveTodos(updated)
}

export function deleteTodo(id: number) {
    const updated = getTodos().filter(t => t.id !== id)
    setTodos(updated)
    saveTodos(updated)
}