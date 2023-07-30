<template>
  <div class="hello">
    <h1 class="text-center">{{ msg }}</h1>
    <p class="col-span-2 text-center">
      Шукаєм ми, дивитесь ви. Економне свій час при пошуку автомобілей. 1400
      нових машин кожного дня!
    </p>

    <div
      class="bg-gray-100 text-black px-4 py-2 rounded grid grid-cols-2 gap-4"
    >
      <form @submit.prevent="submitForm" class="col-span-2">
        <div class="grid grid-cols-2 gap-4">
          <label for="fromYear">Рік випуску:</label>
          <div class="flex flex-col">
            <input
              type="text"
              id="fromYear"
              v-model="searchFromYear"
              placeholder="з"
              required
              class="border rounded px-3 py-2"
            />
          </div>
          <label for="toYear"></label>
          <div class="flex flex-col">
            <input
              type="text"
              id="toYear"
              v-model="searchToYear"
              placeholder="по"
              required
              class="border rounded px-3 py-2"
            />
          </div>
          <label for="marka">Марка автомобіля:</label>
          <div class="flex flex-col">
            <input
              type="text"
              id="marka"
              v-model="searchMarka"
              placeholder="mazda"
              required
              class="border rounded px-3 py-2"
            />
          </div>
          <label for="model">Марка автомобіля:</label>
          <div class="flex flex-col">
            <input
              type="text"
              id="model"
              v-model="searchModel"
              placeholder="cx7"
              required
              class="border rounded px-3 py-2"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 place-content-around h-12">
          <button class="bg-blue-500 text-white px-4 py-2 mt-4 rounded">
            Сохранить
          </button>
          <button class="bg-blue-500 text-white px-4 py-2 mt-4 rounded">
            Сбросить
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
};
</script>

<style src="./app.css"></style>
