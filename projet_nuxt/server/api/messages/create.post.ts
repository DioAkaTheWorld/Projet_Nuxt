import { defineWrappedResponseHandler } from '../../utils/mysql'

export default defineWrappedResponseHandler(async (event) => {
  const userCookie = getCookie(event, 'auth_user')
  if (!userCookie) {
    throw createError({ statusCode: 401, statusMessage: 'Non connecté' })
  }
  const user = JSON.parse(userCookie)

  const body = await readBody(event)
  const { subject_id, content } = body

  if (!content || !subject_id) {
    throw createError({ statusCode: 400, statusMessage: 'Message vide' })
  }

  const db = event.context.mysql
  await db.execute(
    'INSERT INTO messages (content, subject_id, user_id) VALUES (?, ?, ?)',
    [content, subject_id, user.id]
  )

  return { success: true }
})