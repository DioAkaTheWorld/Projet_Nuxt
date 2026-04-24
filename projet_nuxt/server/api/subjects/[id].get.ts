import { defineWrappedResponseHandler } from '../../utils/mysql'

export default defineWrappedResponseHandler(async (event) => {
  const subjectId = event.context.params?.id
  const queryParams = getQuery(event)
  const page = parseInt(queryParams.page as string) || 1
  const limit = 20
  const offset = (page - 1) * limit

  const db = event.context.mysql
  
  const [subjects] = await db.execute('SELECT * FROM subjects WHERE id = ?', [subjectId])
  if ((subjects as any[]).length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Sujet introuvable' })
  }
  const subject = (subjects as any[])[0]

  const [countRes] = await db.execute('SELECT COUNT(*) as total FROM messages WHERE subject_id = ?', [subjectId])
  const totalMessages = (countRes as any[])[0].total
  const totalPages = Math.ceil(totalMessages / limit)

  const [messages] = await db.execute(`
    SELECT m.id, m.content, m.created_at, u.username as author
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.subject_id = ?
    ORDER BY m.created_at ASC
    LIMIT ${limit} OFFSET ${offset}
  `, [subjectId])
  
  return { subject, messages, totalPages, currentPage: page }
})