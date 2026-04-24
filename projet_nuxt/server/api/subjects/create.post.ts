import { defineWrappedResponseHandler } from '../../utils/mysql'

export default defineWrappedResponseHandler(async (event) => {
  const userCookie = getCookie(event, 'auth_user')
  if (!userCookie) {
    throw createError({ statusCode: 401, statusMessage: 'Vous devez être connecté pour créer un sujet.' })
  }
  const user = JSON.parse(userCookie)

  const body = await readBody(event)
  const { forum_id, title, content } = body

  if (!title || !content || !forum_id) {
    throw createError({ statusCode: 400, statusMessage: 'Titre et message obligatoires.' })
  }

  const db = event.context.mysql
  
  await db.query('BEGIN')
  try {
    const [subjectRes] = await db.execute(
      'INSERT INTO subjects (title, forum_id, user_id) VALUES (?, ?, ?)',
      [title, forum_id, user.id]
    )
    const subjectId = (subjectRes as any).insertId

    await db.execute(
      'INSERT INTO messages (content, subject_id, user_id) VALUES (?, ?, ?)',
      [content, subjectId, user.id]
    )

    await db.query('COMMIT')
    return { success: true, subjectId }
  } catch (error) {
    await db.query('ROLLBACK')
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la création du sujet.' })
  }
})