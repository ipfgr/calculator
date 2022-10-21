<template>
  <div id="container">
    <ExchangeWindow/>
  </div>
</template>

<script>
import ExchangeWindow from './components/ExchangeWindow.vue'

export default {
  name: 'App',
  components: {
    ExchangeWindow
  }
}
</script>

<style lang="scss">

body{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #eefdff;
}

#container {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
