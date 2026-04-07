<template>
  <div class="page">

    <!-- Header do board -->
    <div class="board-header">
      <button class="btn btn-ghost btn-sm" @click="$router.push('/')">← Boards</button>
      <h1 class="board-title">{{ boardTitle }}</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Carregando board...</div>

    <!-- Colunas Kanban -->
    <div v-else class="kanban">
      <div v-for="col in columns" :key="col.key" class="column">

        <!-- Cabeçalho da coluna -->
        <div class="col-header">
          <div class="col-title">
            <span class="col-dot" :class="col.key"></span>
            <h2>{{ col.label }}</h2>
          </div>
          <span class="col-count">{{ cardsByStatus(col.key).length }}</span>
        </div>

        <!-- Cards -->
        <div class="cards-list">
          <div
            v-for="card in cardsByStatus(col.key)"
            :key="card.id"
            class="card"
          >
            <p class="card-title">{{ card.title }}</p>
            <p v-if="card.description" class="card-desc">{{ card.description }}</p>

            <!-- Ações: mover + editar + deletar -->
            <div class="card-actions">
              <div class="move-btns">
                <button
                  v-if="col.key !== 'todo'"
                  class="move-btn"
                  :title="`Mover para ${getPrevLabel(col.key)}`"
                  @click="moveCard(card, getPrevStatus(col.key))"
                >◀</button>
                <button
                  v-if="col.key !== 'done'"
                  class="move-btn"
                  :title="`Mover para ${getNextLabel(col.key)}`"
                  @click="moveCard(card, getNextStatus(col.key))"
                >▶</button>
              </div>
              <div class="card-btns">
                <button
                  class="btn btn-ghost btn-sm"
                  @click="$router.push(`/card/${card.id}`)"
                >✏️</button>
                <button
                  class="btn btn-danger btn-sm"
                  @click="deleteCard(card)"
                >🗑️</button>
              </div>
            </div>
          </div>

          <!-- Sem cards -->
          <p v-if="cardsByStatus(col.key).length === 0" class="col-empty">
            Nenhum card
          </p>
        </div>

        <!-- Botão adicionar card -->
        <button class="add-card" @click="openModal(col.key)">+ Adicionar card</button>
      </div>
    </div>

    <!-- Modal: Novo Card -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h3>Novo Card — <span :class="['status-badge', newCard.status]">{{ getLabelFor(newCard.status) }}</span></h3>
        <input
          v-model="newCard.title"
          placeholder="Título do card *"
          @keyup.enter="createCard"
          ref="modalInput"
        />
        <textarea
          v-model="newCard.description"
          placeholder="Descrição (opcional)"
          rows="3"
        ></textarea>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" style="flex:1" @click="createCard">Criar Card</button>
          <button class="btn btn-ghost" @click="showModal = false">Cancelar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const API   = 'http://localhost:3000'
const route = useRoute()
const boardId = route.params.id

const boardTitle = ref('...')
const cards      = ref([])
const loading    = ref(true)
const showModal  = ref(false)
const modalInput = ref(null)
const newCard    = ref({ title: '', description: '', status: 'todo' })

const columns = [
  { key: 'todo',  label: 'A Fazer'      },
  { key: 'doing', label: 'Em Progresso' },
  { key: 'done',  label: 'Concluído'    }
]

const statusOrder = ['todo', 'doing', 'done']
const getPrevStatus = (s) => statusOrder[statusOrder.indexOf(s) - 1]
const getNextStatus = (s) => statusOrder[statusOrder.indexOf(s) + 1]
const getLabelFor   = (s) => columns.find(c => c.key === s)?.label ?? s
const getPrevLabel  = (s) => getLabelFor(getPrevStatus(s))
const getNextLabel  = (s) => getLabelFor(getNextStatus(s))
const cardsByStatus = (status) => cards.value.filter(c => c.status === status)

const fetchData = async () => {
  loading.value = true
  try {
    const [boardsRes, cardsRes] = await Promise.all([
      axios.get(`${API}/boards`),
      axios.get(`${API}/boards/${boardId}/cards`)
    ])
    const board = boardsRes.data.find(b => b.id == boardId)
    boardTitle.value = board?.title ?? 'Board'
    cards.value = cardsRes.data
  } finally {
    loading.value = false
  }
}

const openModal = async (status) => {
  newCard.value = { title: '', description: '', status }
  showModal.value = true
  await nextTick()
  modalInput.value?.focus()
}

const createCard = async () => {
  if (!newCard.value.title.trim()) return
  await axios.post(`${API}/boards/${boardId}/cards`, newCard.value)
  showModal.value = false
  fetchData()
}

const deleteCard = async (card) => {
  if (!confirm(`Deletar "${card.title}"?`)) return
  await axios.delete(`${API}/cards/${card.id}`)
  fetchData()
}

const moveCard = async (card, newStatus) => {
  await axios.put(`${API}/cards/${card.id}`, { ...card, status: newStatus })
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.board-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}
.board-title {
  font-size: 1.6rem;
  font-weight: 800;
}
.loading { color: var(--text-sub); padding: 40px 0; }

/* Kanban layout */
.kanban {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 16px;
  align-items: flex-start;
}
.column {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  min-width: 290px;
  width: 290px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

/* Column header */
.col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border);
}
.col-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.col-title h2 { font-size: 0.95rem; font-weight: 700; }
.col-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.col-dot.todo  { background: var(--todo); }
.col-dot.doing { background: var(--doing); }
.col-dot.done  { background: var(--done); }
.col-count {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1px 9px;
  font-size: 0.78rem;
  color: var(--text-sub);
}

/* Cards */
.cards-list {
  padding: 12px 12px 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.card {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  transition: border-color .15s;
}
.card:hover { border-color: var(--accent); }
.card-title { font-weight: 600; font-size: 0.92rem; }
.card-desc  { font-size: 0.8rem; color: var(--text-sub); margin-top: 5px; line-height: 1.4; }
.card-actions {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.move-btns { display: flex; gap: 4px; }
.move-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-sub);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 0.75rem;
  transition: background .15s, color .15s;
}
.move-btn:hover { background: var(--accent); color: #0d1117; border-color: var(--accent); }
.card-btns { display: flex; gap: 5px; }
.col-empty { font-size: 0.8rem; color: var(--text-sub); text-align: center; padding: 16px 0; }

/* Add card button */
.add-card {
  margin: 8px 12px 12px;
  background: transparent;
  border: 1px dashed var(--border);
  color: var(--text-sub);
  border-radius: 10px;
  padding: 9px;
  width: calc(100% - 24px);
  font-size: 0.85rem;
  transition: border-color .15s, color .15s;
}
.add-card:hover { border-color: var(--accent); color: var(--accent); }

/* Status badge no modal */
.status-badge { font-size: 0.8rem; font-family: 'DM Sans'; font-weight: 400; padding: 2px 8px; border-radius: 20px; }
.status-badge.todo  { background: rgba(88,166,255,.15); color: var(--todo); }
.status-badge.doing { background: rgba(240,136,62,.15);  color: var(--doing); }
.status-badge.done  { background: rgba(63,185,80,.15);   color: var(--done); }
</style>
