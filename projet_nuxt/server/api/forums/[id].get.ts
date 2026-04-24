import { defineWrappedResponseHandler } from '../../utils/mysql'

export default defineWrappedResponseHandler(async (event) => {
  const forumId = event.context.params?.id
  
  const queryParams = getQuery(event)
  const page = parseInt(queryParams.page as string) || 1
  const limit = 20
  const offset = (page - 1) * limit

  const db = event.context.mysql
  
  const [forums] = await db.execute('SELECT * FROM forums WHERE id = ?', [forumId])
  if ((forums as any[]).length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Forum introuvable' })
  }
  const forum = (forums as any[])[0]

  const [countRes] = await db.execute('SELECT COUNT(*) as total FROM subjects WHERE forum_id = ?', [forumId])
  const totalSubjects = (countRes as any[])[0].total
  const totalPages = Math.ceil(totalSubjects / limit)

  const query = `
    SELECT 
      s.id, s.title, s.created_at as subject_date, u.username as author,
      lm.created_at as last_message_date, lm_u.username as last_message_author
    FROM subjects s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN (
      SELECT subject_id, MAX(created_at) as max_date FROM messages GROUP BY subject_id
    ) latest_msg ON s.id = latest_msg.subject_id
    LEFT JOIN messages lm ON lm.subject_id = s.id AND lm.created_at = latest_msg.max_date
    LEFT JOIN users lm_u ON lm.user_id = lm_u.id
    WHERE s.forum_id = ?
    ORDER BY COALESCE(last_message_date, subject_date) DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  
  const [subjects] = await db.execute(query, [forumId])
  
  return { forum, subjects, totalPages, currentPage: page }
})