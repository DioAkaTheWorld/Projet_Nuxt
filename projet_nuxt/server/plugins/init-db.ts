import mysql from 'mysql2/promise'
import bluebird from 'bluebird'

export default defineNitroPlugin(async (nitroApp) => {
  console.log('Initialisation de la base de données...')
  
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'root',
      Promise: bluebird,
    })

    await connection.query("CREATE DATABASE IF NOT EXISTS forum_db")
    await connection.query("USE forum_db")

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user'
      )
    `)

    await connection.query(`
      CREATE TABLE IF NOT EXISTS forums (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT
      )
    `)

    await connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        forum_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        subject_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    await connection.query(`
      INSERT IGNORE INTO users (username, password, role) 
      VALUES ('admin', 'admin', 'admin')
    `)

    await connection.query(`
      INSERT IGNORE INTO forums (id, title, description) VALUES 
      (1, 'Général', 'Discussions générales sur tous les sujets.'),
      (2, 'Aide & Support', 'Posez vos questions et obtenez de l\\'aide.')
    `)

    await connection.end()
    console.log('Base de données initialisée avec succès !')
  } catch (error) {
    console.error('Erreur lors de linitialisation:', error)
  }
})