import { buildRoutePath } from './utils/build-rote-path.js'
import { Database } from './database.js'
import { randomUUID } from 'node:crypto'

const database = new Database()

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const tasks = database.select('tasks')

            return res
                .writeHead(200)
                .end(
                    JSON.stringify({ message: tasks })
                )
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            if (!req.body) return res.writeHead(400).end(JSON.stringify({ message: 'Task title and description are required.' }))

            const { title, description } = req.body

            if (!title && !description) {
                return res
                    .writeHead(400)
                    .end(
                        JSON.stringify({ message: 'Task title and description are required.' })
                    )
            }

            if (!title) {
                return res
                    .writeHead(400)
                    .end(
                        JSON.stringify({ message: 'Task title is required' })
                    )
            }

            if (!description) {
                return res
                    .writeHead(400)
                    .end(
                        JSON.stringify({ message: 'Task description is required' })
                    )
            }

            const newTask = {
                id: randomUUID(),
                title,
                description,
                created_at: new Date(),
                update_at: new Date(),
                completed_at: null
            }

            database.insert('tasks', newTask)

            return res
                .writeHead(201)
                .end()
        },
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            if (!req.body) return res.writeHead(400).end(JSON.stringify({ message: 'Task title or/and description are required.' }))

            const { id } = req.params

            const isIdValid = database.select('tasks', { id })

            if (isIdValid.length === 0) return res.writeHead(400).end(JSON.stringify({ message: 'Id does not exist.' }))

            const { title, description } = req.body

            if (!title && !description) {
                return res
                    .writeHead(400)
                    .end(
                        JSON.stringify({ message: 'Task title or description are required.' })
                    )
            }

            database.update('tasks', id, {
                title,
                description,
                updated_at: new Date()
            })

            return res
                .writeHead(200)
                .end()
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const isIdValid = database.select('tasks', { id })

            if (isIdValid.length === 0) return res.writeHead(400).end(JSON.stringify({ message: 'Id does not exist.' }))

            database.delete('tasks', id)

            return res
                .writeHead(200)
                .end()
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params

            const isIdValid = database.select('tasks', { id })

            if (isIdValid.length === 0) return res.writeHead(400).end(JSON.stringify({ message: 'Id does not exist.' }))

            const [taskDoneState] = database.select('tasks', { id })

            const handleFinishTask = taskDoneState.completed_at
            const completed_at = handleFinishTask ? null : new Date()

            database.update('tasks', id, { completed_at })

            return res
                .writeHead(200)
                .end()
        }
    },
]