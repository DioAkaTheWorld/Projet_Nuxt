import { defineWrappedResponseHandler } from '../../utils/mysql'

export default defineWrappedResponseHandler(async (event) => {
  const userCookie = getCookie(event, 'auth_user')
  if (!userCookie) throw createError({ statusCode: 401, statusMessage: 'Non connecté' })
  
  const user = JSON.parse(userCookie)
  const { message_id, content } = await readBody(event)
  const db = event.context.mysql

  const [messages] = await db.execute('SELECT user_id FROM messages WHERE id = ?', [message_id])
  if ((messages as any[]).length === 0) throw createError({ statusCode: 404, statusMessage: 'Message introuvable' })
  
  const msgOwnerId = (messages as any[])[0].user_id

  if (user.role !== 'admin' && user.id !== msgOwnerId) {
    throw createError({ statusCode: 403, statusMessage: 'Non autorisé à modifier ce message' })
  }

  await db.execute('UPDATE messages SET content = ? WHERE id = ?', [content, message_id])
  return { success: true }
})