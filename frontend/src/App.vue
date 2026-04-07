<template>
  <div>
    <!-- Navbar global -->
    <nav class="navbar">
      <router-link to="/" class="brand">Kanban<span>App</span></router-link>
    </nav>

    <!-- Conteúdo da rota atual -->
    <router-view />
  </div>
</template>

<script setup>
// App.vue é apenas o shell com a navbar e o router-view
</script>
