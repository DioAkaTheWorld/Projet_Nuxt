import { defineWrappedResponseHandler } from '../../utils/mysql'

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Veuillez remplir tous les champs' })
  }

  const db = event.context.mysql
  
  try {
    await db.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, "user")', 
      [username, password]
    )

    const [users] = await db.execute(
      'SELECT id, username, role FROM users WHERE username = ?', 
      [username]
    )
    const newUser = (users as any[])[0]

    setCookie(event, 'auth_user', JSON.stringify(newUser), {
      httpOnly: false, 
      maxAge: 60 * 60 * 24 * 7 
    })

    return { success: true, user: newUser }

  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw createError({ statusCode: 409, statusMessage: 'Ce pseudo est déjà pris' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de l\'inscription' })
  }
})