import { defineWrappedResponseHandler } from '../../utils/mysql'

export default defineWrappedResponseHandler(async (event) => {
  const userCookie = getCookie(event, 'auth_user')
  if (!userCookie || JSON.parse(userCookie).role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux admins' })
  }

  const { username, password } = await readBody(event)
  const db = event.context.mysql
  
  await db.execute(
    'INSERT INTO users (username, password, role) VALUES (?, ?, "admin")',
    [username, password]
  )
  return { success: true }
})