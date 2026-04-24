import { defineWrappedResponseHandler } from '../../utils/mysql'

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiants manquants' })
  }

  const db = event.context.mysql
  
  const [users] = await db.execute(
    'SELECT id, username, role FROM users WHERE username = ? AND password = ?', 
    [username, password]
  )

  if ((users as any[]).length === 0) {
    throw createError({ statusCode: 401, statusMessage: 'Identifiants incorrects' })
  }

  const user = (users as any[])[0]

  setCookie(event, 'auth_user', JSON.stringify(user), {
    httpOnly: false, 
    maxAge: 60 * 60 * 24 * 7 
  })

  return { success: true, user }
})