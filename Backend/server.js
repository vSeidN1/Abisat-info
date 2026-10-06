require('dotenv').config()

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const mysql = require('mysql2/promise')
const multer = require('multer')
const nodemailer = require('nodemailer')

const app = express()
const port = Number(process.env.PORT || 3000)
const databaseName = process.env.DB_NAME || 'abisat_et'
const uploadDir = path.join(__dirname, 'uploads')
const frontendDist = path.resolve(__dirname, '..', 'Frontend', 'dist')

fs.mkdirSync(uploadDir, { recursive: true })

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } })

app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))
app.use('/uploads', express.static(uploadDir, { index: false, dotfiles: 'deny' }))

function adminOnly(req, res, next) {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD
  if (!username || !password) {
    return res.status(503).json({ error: 'Admin access is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.' })
  }

  const encoded = (req.headers.authorization || '').replace(/^Basic\s+/i, '')
  if (!encoded) return res.status(401).json({ error: 'Unauthorized. Sign in with admin credentials.' })

  let decoded
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8')
  } catch {
    return res.status(401).json({ error: 'Unauthorized. Sign in with admin credentials.' })
  }

  const separator = decoded.indexOf(':')
  if (separator < 0) return res.status(401).json({ error: 'Unauthorized. Sign in with admin credentials.' })

  const suppliedUser = Buffer.from(decoded.slice(0, separator))
  const suppliedPassword = Buffer.from(decoded.slice(separator + 1))
  const expectedUser = Buffer.from(username)
  const expectedPassword = Buffer.from(password)

  const userMatches = suppliedUser.length === expectedUser.length && crypto.timingSafeEqual(suppliedUser, expectedUser)
  const passwordMatches = suppliedPassword.length === expectedPassword.length && crypto.timingSafeEqual(suppliedPassword, expectedPassword)

  if (!userMatches || !passwordMatches) {
    return res.status(401).json({ error: 'Unauthorized. Check your username and password.' })
  }

  next()
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

function validateDatabaseName(name) {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error('DB_NAME may contain only letters, numbers, and underscores.')
  }
}

async function initializeDatabase() {
  if (!process.env.DB_USER) {
    throw new Error('DB_USER must be set in Backend/.env.')
  }

  validateDatabaseName(databaseName)

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
  })

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    await connection.changeUser({ database: databaseName })
    const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8')
      .replace(/\babisat_et\b/g, databaseName)
    for (const statement of schema.split(';').map((part) => part.trim()).filter(Boolean)) {
      await connection.query(statement)
    }
  } finally {
    await connection.end()
  }
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.get('/api/downloads', asyncRoute(async (req, res) => {
  const type = String(req.query.type || '')
  if (!['software', 'loader'].includes(type)) {
    return res.status(400).json({ error: 'type must be software or loader.' })
  }

  const brand = typeof req.query.brand === 'string' ? req.query.brand.trim() : ''
  const query = brand
    ? 'SELECT id, brand, model, filename, file_type AS type, description, created_at FROM receiver_files WHERE file_type = ? AND brand = ? ORDER BY created_at DESC'
    : 'SELECT id, brand, model, filename, file_type AS type, description, created_at FROM receiver_files WHERE file_type = ? ORDER BY created_at DESC'

  const [rows] = await pool.execute(query, brand ? [type, brand] : [type])
  res.json(rows)
}))

app.get('/api/downloads/:id/file', asyncRoute(async (req, res) => {
  const [rows] = await pool.execute('SELECT filename FROM receiver_files WHERE id = ?', [req.params.id])
  if (!rows.length) return res.status(404).json({ error: 'File not found.' })
  const filename = rows[0].filename
  const filepath = path.join(uploadDir, path.basename(filename))
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'The file is no longer available on the server.' })
  res.download(filepath, filename)
}))

app.get('/api/satellites/:name/channels', asyncRoute(async (req, res) => {
  const satellite = String(req.params.name).replace(/-/g, ' ')
  const [rows] = await pool.execute(
    'SELECT id, satellite, channel_name, frequency, biss_key FROM channels WHERE LOWER(satellite) = LOWER(?) ORDER BY channel_name',
    [satellite],
  )
  res.json({ satellite, channels: rows })
}))

app.get('/api/posts', asyncRoute(async (req, res) => {
  const pageSize = 6
  const requestedPage = Number.parseInt(String(req.query.page || '1'), 10) || 1
  const page = Number.isSafeInteger(requestedPage)
    ? Math.min(Math.max(1, requestedPage), Math.floor(Number.MAX_SAFE_INTEGER / pageSize))
    : 1
  const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM posts')
  const totalPages = Math.ceil(count / pageSize)
  const [rows] = await pool.query(
    'SELECT id, title, content, image, created_at FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [pageSize, (page - 1) * pageSize],
  )
  res.json({ posts: rows, page, totalPages })
}))

app.post('/api/contact', asyncRoute(async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : ''
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : ''
  const sender = process.env.EMAIL_USER?.trim()
  const password = process.env.EMAIL_PASS?.trim()
  const recipient = (process.env.CONTACT_TO || 'abisatinfo.support@gmail.com').trim()

  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !message || message.length > 5000) {
    return res.status(400).json({ error: 'Enter a valid name, email address, and message (maximum 5,000 characters).' })
  }

  if (!sender || !password) {
    return res.status(503).json({ error: 'Contact email is not configured. Set EMAIL_USER and EMAIL_PASS on the server.' })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: sender, pass: password },
  })

  const result = await transporter.sendMail({
    from: { name: 'Abisat ET Contact Form', address: sender },
    to: recipient,
    replyTo: { name, address: email },
    subject: 'New contact form submission',
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  })

  if (!result.accepted?.length) {
    console.error('Contact email was not accepted by the mail server.', {
      recipient,
      rejected: result.rejected,
      response: result.response,
    })
    return res.status(502).json({ error: 'The mail server did not accept the contact message. Please try again later.' })
  }

  console.info('Contact email accepted by SMTP server.', {
    recipient,
    messageId: result.messageId,
    response: result.response,
  })
  res.json({ message: 'Thanks! Your message has been submitted.' })
}))

app.use('/api/admin', adminOnly)

app.get('/api/admin/posts', asyncRoute(async (_req, res) => {
  const [rows] = await pool.execute('SELECT id, title, content, image, created_at FROM posts ORDER BY created_at DESC LIMIT 100')
  res.json(rows)
}))

app.get('/api/admin/posts/:id', asyncRoute(async (req, res) => {
  const [rows] = await pool.execute('SELECT id, title, content, image, created_at FROM posts WHERE id = ?', [req.params.id])
  if (!rows.length) return res.status(404).json({ error: 'Post not found.' })
  res.json(rows[0])
}))

app.post('/api/admin/posts', upload.single('image'), asyncRoute(async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : ''

  if (!title || title.length > 250 || !content || content.length > 20000) {
    if (req.file) fs.unlinkSync(req.file.path)
    return res.status(400).json({ error: 'A title (up to 250 characters) and content (up to 20,000 characters) are required.' })
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO posts (title, content, image) VALUES (?, ?, ?)',
      [title, content, req.file?.filename || null],
    )
    res.status(201).json({ id: result.insertId, title, content, image: req.file?.filename || null })
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path)
    throw error
  }
}))

app.put('/api/admin/posts/:id', upload.single('image'), asyncRoute(async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : ''

  if (!title || title.length > 250 || !content || content.length > 20000) {
    if (req.file) fs.unlinkSync(req.file.path)
    return res.status(400).json({ error: 'A title (up to 250 characters) and content (up to 20,000 characters) are required.' })
  }

  const [existing] = await pool.execute('SELECT image FROM posts WHERE id = ?', [req.params.id])
  if (!existing.length) {
    if (req.file) fs.unlinkSync(req.file.path)
    return res.status(404).json({ error: 'Post not found.' })
  }

  try {
    const image = req.file?.filename || existing[0].image
    await pool.execute('UPDATE posts SET title = ?, content = ?, image = ? WHERE id = ?', [title, content, image, req.params.id])
    if (req.file && existing[0].image) removeUpload(existing[0].image)
    res.json({ id: req.params.id, title, content, image })
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path)
    throw error
  }
}))

app.delete('/api/admin/posts/:id', asyncRoute(async (req, res) => {
  const [existing] = await pool.execute('SELECT image FROM posts WHERE id = ?', [req.params.id])
  if (!existing.length) return res.status(404).json({ error: 'Post not found.' })
  await pool.execute('DELETE FROM posts WHERE id = ?', [req.params.id])
  if (existing[0].image) removeUpload(existing[0].image)
  res.status(204).end()
}))

app.post('/api/admin/downloads', upload.single('file'), asyncRoute(async (req, res) => {
  const brand = typeof req.body.brand === 'string' ? req.body.brand.trim() : ''
  const model = typeof req.body.model === 'string' ? req.body.model.trim() : ''
  const type = typeof req.body.type === 'string' ? req.body.type : ''
  const description = typeof req.body.description === 'string' ? req.body.description.trim() : ''

  if (!req.file || !brand || brand.length > 100 || !model || model.length > 100 || !['software', 'loader'].includes(type) || description.length > 1000) {
    if (req.file) fs.unlinkSync(req.file.path)
    return res.status(400).json({ error: 'Provide a file, brand, model, valid file type, and description under 1,000 characters.' })
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO receiver_files (brand, model, filename, file_type, description) VALUES (?, ?, ?, ?, ?)',
      [brand, model, req.file.filename, type, description],
    )
    res.status(201).json({ id: result.insertId, brand, model, filename: req.file.filename, type, description })
  } catch (error) {
    fs.unlinkSync(req.file.path)
    throw error
  }
}))

function removeUpload(filename) {
  const filepath = path.join(uploadDir, path.basename(filename))
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
}

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { index: false }))
  app.get('*path', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next()
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

app.use((error, _req, res, _next) => {
  console.error(error)
  if (error instanceof multer.MulterError) {
    return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
      error: error.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 100 MB upload limit.' : error.message,
    })
  }
  res.status(500).json({ error: 'An unexpected server error occurred.' })
})

async function start() {
  await initializeDatabase()
  app.listen(port, '0.0.0.0', () => console.log(`Abisat ET server listening on port ${port}`))
}

start().catch((error) => {
  console.error('Unable to start Abisat ET:', error.message)
  process.exitCode = 1
})
