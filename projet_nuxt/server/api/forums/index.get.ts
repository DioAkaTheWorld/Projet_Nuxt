import { defineWrappedResponseHandler } from '../../utils/mysql'

export default defineWrappedResponseHandler(async (event) => {
  const db = event.context.mysql
  
  const [rows] = await db.execute(`
    SELECT f.id, f.title, f.description, COUNT(s.id) as subjects_count
    FROM forums f
    LEFT JOIN subjects s ON f.id = s.forum_id
    GROUP BY f.id
  `)
  
  return rows
})