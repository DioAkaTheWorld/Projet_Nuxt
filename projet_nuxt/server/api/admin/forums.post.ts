import { defineWrappedResponseHandler } from '../../utils/mysql'

export default defineWrappedResponseHandler(async (event) => {
  const userCookie = getCookie(event, 'auth_user')
  if (!userCookie || JSON.parse(userCookie).role !== 'admin') throw createError({ statusCode: 403 })

  const body = await readBody(event)
  const { action, id, title, description } = body
  const db = event.context.mysql

  if (action === 'create') {
    await db.execute('INSERT INTO forums (title, description) VALUES (?, ?)', [title, description])
  } else if (action === 'rename') {
    await db.execute('UPDATE forums SET title = ?, description = ? WHERE id = ?', [title, description, id])
  } else if (action === 'delete') {
    await db.execute('DELETE FROM forums WHERE id = ?', [id])
  }
  
  return { success: true }
})