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
              v-model="searchMarka"
              placeholder="Пошук марки"
              class="border rounded px-3 py-2"
            />
            <select
              name="text"
              id="marka"
              v-model="selectedMarka"
              class="border rounded px-3 py-2 mt-2"
            >
              <option value="">Выберіть марку</option>
              <option
                v-for="marka in filteredCarBrands"
                :value="marka.name"
                :key="marka.value"
              >
                {{ marka.name }}
              </option>
            </select>
          </div>

          <label for="model">Модель автомобіля:</label>
          <div class="flex flex-col">
            <select
              id="model"
              name="text"
              v-model="selectedModel"
              class="border rounded px-3 py-2"
            >
              <option value="">Выберите модель</option>
              <option
                v-for="model in filteredModels"
                :value="model.value"
                :key="model.value"
              >
                {{ model.name }}
              </option>
            </select>
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
import carBrands from "./cars-brands-list";
import carModels from "./car-models-list";

export default {
  data() {
    const sortedCarBrands = carBrands.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return {
      carBrands: sortedCarBrands,
      searchMarka: "",
      selectedMarka: "",
    };
  },
  computed: {
    filteredCarBrands() {
      if (!this.searchMarka) {
        return this.carBrands;
      }
      const searchTerm = this.searchMarka.toLowerCase();
      return this.carBrands.filter((marka) =>
        marka.name.toLowerCase().includes(searchTerm)
      );
    },
    filteredModels() {
      if (!this.selectedMarka) {
        return [];
      }
      return carModels.filter((model) => model.marka === this.selectedMarka);
    },
  },

  searchMarka() {
    this.selectedMarka = "";
  },

  methods: {
    updateModels() {
      this.selectedModel = "";
    },
  },
};
</script>

<style src="./app.css"></style>
