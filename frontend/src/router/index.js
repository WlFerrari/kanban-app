import { createRouter, createWebHistory } from 'vue-router'
import HomeView  from '../views/HomeView.vue'
import BoardView from '../views/BoardView.vue'
import CardView  from '../views/CardView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Meus Boards' }
  },
  {
    path: '/board/:id',
    name: 'board',
    component: BoardView,
    meta: { title: 'Board' }
  },
  {
    path: '/card/:id',
    name: 'card',
    component: CardView,
    meta: { title: 'Editar Card' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Atualiza o título da aba conforme a rota
router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'KanbanApp'} — KanbanApp`
})

export default router
