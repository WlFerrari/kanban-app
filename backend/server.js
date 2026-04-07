const express = require('express')
const Database = require('better-sqlite3')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// Inicializa o banco de dados
const db = new Database('./kanban.db')

// Cria as tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'todo' CHECK(status IN ('todo', 'doing', 'done')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
  );
`)

// ────────────────────────────────────────────
// BOARDS
// ────────────────────────────────────────────

// GET /boards → lista todos os boards
app.get('/boards', (req, res) => {
  const boards = db.prepare('SELECT * FROM boards ORDER BY created_at DESC').all()
  res.json(boards)
})

// POST /boards → cria um board
app.post('/boards', (req, res) => {
  const { title } = req.body
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Título é obrigatório' })
  }
  const result = db.prepare('INSERT INTO boards (title) VALUES (?)').run(title.trim())
  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(board)
})

// DELETE /boards/:id → deleta um board (e seus cards em cascata)
app.delete('/boards/:id', (req, res) => {
  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(req.params.id)
  if (!board) return res.status(404).json({ error: 'Board não encontrado' })
  db.prepare('DELETE FROM boards WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// ────────────────────────────────────────────
// CARDS
// ────────────────────────────────────────────

// GET /boards/:boardId/cards → lista cards de um board
app.get('/boards/:boardId/cards', (req, res) => {
  const cards = db
    .prepare('SELECT * FROM cards WHERE board_id = ? ORDER BY created_at ASC')
    .all(req.params.boardId)
  res.json(cards)
})

// POST /boards/:boardId/cards → cria um card
app.post('/boards/:boardId/cards', (req, res) => {
  const { title, description, status } = req.body
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Título é obrigatório' })
  }
  const validStatus = ['todo', 'doing', 'done'].includes(status) ? status : 'todo'
  const result = db
    .prepare('INSERT INTO cards (board_id, title, description, status) VALUES (?, ?, ?, ?)')
    .run(req.params.boardId, title.trim(), description || '', validStatus)
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(card)
})

// GET /cards/:id → busca um card pelo id
app.get('/cards/:id', (req, res) => {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id)
  if (!card) return res.status(404).json({ error: 'Card não encontrado' })
  res.json(card)
})

// PUT /cards/:id → atualiza um card (título, descrição, status)
app.put('/cards/:id', (req, res) => {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id)
  if (!card) return res.status(404).json({ error: 'Card não encontrado' })

  const { title, description, status } = req.body
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Título é obrigatório' })
  }
  const validStatus = ['todo', 'doing', 'done'].includes(status) ? status : card.status

  db.prepare('UPDATE cards SET title = ?, description = ?, status = ? WHERE id = ?').run(
    title.trim(),
    description ?? card.description,
    validStatus,
    req.params.id
  )
  const updated = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id)
  res.json(updated)
})

// DELETE /cards/:id → deleta um card
app.delete('/cards/:id', (req, res) => {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id)
  if (!card) return res.status(404).json({ error: 'Card não encontrado' })
  db.prepare('DELETE FROM cards WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// ────────────────────────────────────────────
const PORT = 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
