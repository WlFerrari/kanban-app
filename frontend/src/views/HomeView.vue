<template>
  <div class="page">
    <!-- Cabeçalho -->
    <div class="home-header">
      <div>
        <h1 class="home-title">Meus Boards</h1>
        <p class="home-sub">Organize suas tarefas com quadros Kanban</p>
      </div>
      <button class="btn btn-primary" @click="openModal">+ Novo Board</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="empty-state">Carregando...</div>

    <!-- Grid de boards -->
    <div v-else-if="boards.length" class="boards-grid">
      <div
        v-for="board in boards"
        :key="board.id"
        class="board-card"
      >
        <div class="board-card-body" @click="$router.push(`/board/${board.id}`)">
          <div class="board-icon">📋</div>
          <h3>{{ board.title }}</h3>
          <p class="board-date">Criado em {{ formatDate(board.created_at) }}</p>
        </div>
        <div class="board-card-footer">
          <button
            class="btn btn-ghost btn-sm"
            @click="$router.push(`/board/${board.id}`)"
          >Abrir →</button>
          <button
            class="btn btn-danger btn-sm"
            @click.stop="confirmDelete(board)"
          >🗑️</button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">📭</div>
      <p>Nenhum board criado ainda.</p>
      <button class="btn btn-primary" @click="openModal">Criar meu primeiro board</button>
    </div>

    <!-- Modal Novo Board -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>Novo Board</h3>
        <input
          v-model="newTitle"
          placeholder="Nome do board..."
          @keyup.enter="createBoard"
          ref="inputRef"
        />
        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" style="flex:1" @click="createBoard">Criar</button>
          <button class="btn btn-ghost" @click="closeModal">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'

const API = 'http://localhost:3000'

const boards    = ref([])
const loading   = ref(true)
const showModal = ref(false)
const newTitle  = ref('')
const inputRef  = ref(null)

const fetchBoards = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/boards`)
    boards.value = data
  } finally {
    loading.value = false
  }
}

const openModal = async () => {
  showModal.value = true
  newTitle.value = ''
  await nextTick()
  inputRef.value?.focus()
}
const closeModal = () => { showModal.value = false }

const createBoard = async () => {
  if (!newTitle.value.trim()) return
  await axios.post(`${API}/boards`, { title: newTitle.value })
  closeModal()
  fetchBoards()
}

const confirmDelete = async (board) => {
  if (!confirm(`Deletar o board "${board.title}"?\nTodos os cards serão perdidos.`)) return
  await axios.delete(`${API}/boards/${board.id}`)
  fetchBoards()
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

onMounted(fetchBoards)
</script>

<style scoped>
.home-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}
.home-title { font-size: 2rem; font-weight: 800; }
.home-sub   { color: var(--text-sub); margin-top: 4px; }

/* Grid */
.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}
.board-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  transition: border-color .2s, transform .2s;
}
.board-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
}
.board-card-body {
  padding: 22px 20px 14px;
  cursor: pointer;
}
.board-icon { font-size: 1.8rem; margin-bottom: 10px; }
.board-card-body h3 { font-size: 1.05rem; font-weight: 700; }
.board-date { font-size: 0.8rem; color: var(--text-sub); margin-top: 6px; }
.board-card-footer {
  padding: 10px 16px 14px;
  display: flex;
  gap: 8px;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-sub);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.empty-icon { font-size: 3rem; }
</style>
