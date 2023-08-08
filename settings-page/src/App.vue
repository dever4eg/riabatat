<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="RIABATAT - телеграм-бот для пошуку автомобілей №1" />
  </div>
</template>

<script>
import HelloWorld from "./components/formComponent.vue";

export default {
  name: "App",
  components: {
    HelloWorld,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 15px;
  width: 800px;
  margin-left: auto;
  margin-right: auto;
}
@media screen and (max-width: 800px) {
  #app {
    width: 100%;
    margin: 0px;
  }
}
img {
  margin-left: auto;
  margin-right: auto;
}
</style>
