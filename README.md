# 📋 KanbanApp

Aplicação Web SPA desenvolvida com **Vue.js 3** + **Node.js + Express + SQLite**.

---

## 📁 Estrutura do Projeto

```
kanban/
├── backend/          # API REST (Node.js + Express + SQLite)
│   ├── server.js
│   └── package.json
└── frontend/         # SPA (Vue.js 3 + Vite)
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.js
        ├── style.css
        ├── App.vue
        ├── router/
        │   └── index.js
        └── views/
            ├── HomeView.vue   ← Tela 1: Lista de Boards
            ├── BoardView.vue  ← Tela 2: Board Kanban
            └── CardView.vue   ← Tela 3: Editar Card
```

---

## 🚀 Como rodar

### 1. Backend

```bash
cd backend
npm install
npm start
# Servidor rodando em http://localhost:3000
```

### 2. Frontend (em outro terminal)

```bash
cd frontend
npm install
npm run dev
# App rodando em http://localhost:5173
```

---

## 📌 Rotas da API REST

| Método | Rota                       | Descrição              |
|--------|----------------------------|------------------------|
| GET    | /boards                    | Lista todos os boards  |
| POST   | /boards                    | Cria um board          |
| DELETE | /boards/:id                | Deleta um board        |
| GET    | /boards/:boardId/cards     | Lista cards do board   |
| POST   | /boards/:boardId/cards     | Cria um card           |
| GET    | /cards/:id                 | Busca um card          |
| PUT    | /cards/:id                 | Atualiza um card       |
| DELETE | /cards/:id                 | Deleta um card         |

---

## 🖥️ Telas

| # | Rota          | Descrição                                 |
|---|---------------|-------------------------------------------|
| 1 | `/`           | Lista e criação de Boards                 |
| 2 | `/board/:id`  | Board Kanban (colunas: A Fazer / Em Progresso / Concluído) |
| 3 | `/card/:id`   | Edição completa de um card                |

---

## ✅ Requisitos atendidos

- ✅ **1 CRUD completo** — Cards (Create, Read, Update, Delete) com backend e banco SQLite
- ✅ **3 Telas** — Home, Board, Card
- ✅ **Navegação entre telas** — Vue Router (SPA)
- ✅ **SPA em Vue.js** — Vue 3 + Composition API
- ✅ **API REST** — Express com rotas para boards e cards
- ✅ **Banco de dados** — SQLite via better-sqlite3
