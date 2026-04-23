import mysql from 'mysql2/promise'
import bluebird from 'bluebird'
import type { EventHandler, EventHandlerRequest } from 'h3'

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>
): EventHandler<T, D> =>
  defineEventHandler<T>(async event => {
    try {
      const connection = await mysql.createConnection({
        host: 'localhost', 
        user: 'root',
        password: 'root',
        database: 'movies', 
        Promise: bluebird,
      })
      
      event.context.mysql = connection
      
      const response = await handler(event)

      await event.context.mysql.end()
      return response
    } catch (err) {
      console.error("Erreur DB:", err)
      return { err }
    }
  })