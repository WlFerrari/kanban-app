<template>
  <div class="page card-page">

    <!-- Breadcrumb / voltar -->
    <div class="card-header">
      <button class="btn btn-ghost btn-sm" @click="goBack">← Voltar ao Board</button>
      <span class="header-title">Editar Card</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Carregando card...</div>

    <!-- Formulário de edição -->
    <div v-else-if="card" class="card-form">

      <div class="form-row">
        <label>Título <span class="required">*</span></label>
        <input v-model="card.title" placeholder="Título do card" />
      </div>

      <div class="form-row">
        <label>Descrição</label>
        <textarea v-model="card.description" rows="5" placeholder="Descreva esta tarefa..."></textarea>
      </div>

      <div class="form-row">
        <label>Status</label>
        <div class="status-options">
          <label
            v-for="opt in statusOptions"
            :key="opt.value"
            class="status-opt"
            :class="[opt.value, { active: card.status === opt.value }]"
          >
            <input type="radio" v-model="card.status" :value="opt.value" />
            <span class="opt-dot"></span>
            {{ opt.label }}
          </label>
        </div>
      </div>

      <!-- Ações -->
      <div class="form-actions">
        <button class="btn btn-primary" @click="saveCard">💾 Salvar Alterações</button>
        <button class="btn btn-danger"  @click="deleteCard">🗑️ Deletar Card</button>
      </div>

      <!-- Toast de sucesso -->
      <div v-if="saved" class="toast">✅ Card salvo com sucesso!</div>
    </div>

    <!-- 404 -->
    <div v-else class="loading">Card não encontrado.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const API    = 'http://localhost:3000'
const route  = useRoute()
const router = useRouter()

const card    = ref(null)
const loading = ref(true)
const saved   = ref(false)

const statusOptions = [
  { value: 'todo',  label: 'A Fazer'      },
  { value: 'doing', label: 'Em Progresso' },
  { value: 'done',  label: 'Concluído'    }
]

const fetchCard = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/cards/${route.params.id}`)
    card.value = { ...data }
  } catch {
    card.value = null
  } finally {
    loading.value = false
  }
}

const saveCard = async () => {
  if (!card.value.title.trim()) {
    alert('O título é obrigatório!')
    return
  }
  await axios.put(`${API}/cards/${card.value.id}`, card.value)
  saved.value = true
  setTimeout(() => { saved.value = false }, 2500)
}

const deleteCard = async () => {
  if (!confirm(`Deletar "${card.value.title}"? Esta ação não pode ser desfeita.`)) return
  const boardId = card.value.board_id
  await axios.delete(`${API}/cards/${card.value.id}`)
  router.push(`/board/${boardId}`)
}

const goBack = () => {
  if (card.value) router.push(`/board/${card.value.board_id}`)
  else router.push('/')
}

onMounted(fetchCard)
</script>

<style scoped>
.card-page { max-width: 640px; }

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}
.header-title {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
}

.card-form {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-row { display: flex; flex-direction: column; gap: 8px; }
.form-row label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: .5px;
}
.required { color: var(--danger); }

/* Status radio buttons */
.status-options { display: flex; gap: 10px; flex-wrap: wrap; }
.status-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  font-size: 0.9rem;
  transition: border-color .15s, background .15s;
  user-select: none;
}
.status-opt input[type="radio"] { display: none; }
.opt-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--border);
  transition: background .15s;
}
.status-opt.todo  .opt-dot { background: var(--todo);  }
.status-opt.doing .opt-dot { background: var(--doing); }
.status-opt.done  .opt-dot { background: var(--done);  }

.status-opt.todo.active  { border-color: var(--todo);  background: rgba(88,166,255,.1); }
.status-opt.doing.active { border-color: var(--doing); background: rgba(240,136,62,.1); }
.status-opt.done.active  { border-color: var(--done);  background: rgba(63,185,80,.1); }

/* Ações */
.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 6px;
  flex-wrap: wrap;
}
.loading { color: var(--text-sub); padding: 40px 0; }
</style>
