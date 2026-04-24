import { defineWrappedResponseHandler } from '../../utils/mysql'

export default defineWrappedResponseHandler(async (event) => {
  const userCookie = getCookie(event, 'auth_user')
  if (!userCookie) throw createError({ statusCode: 401 })
  
  const user = JSON.parse(userCookie)
  const { message_id } = await readBody(event)

  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Seul un admin peut supprimer' })
  }

  const db = event.context.mysql
  await db.execute('DELETE FROM messages WHERE id = ?', [message_id])
  return { success: true }
})