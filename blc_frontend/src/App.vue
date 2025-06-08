<template>
  <div id="app">
    <Header />
    <router-view />
  </div>
</template>

<script setup>
import Header from './components/common/Header.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
}
</style>
