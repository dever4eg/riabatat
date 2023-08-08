<template>
  <select class="border rounded px-3 py-2">
    <option value="">Выберите год</option>
    <option v-for="year in years" :value="year" :key="year">{{ year }}</option>
  </select>
</template>

<script>
export default {
  props: {
    selectedYear: String,
  },
  computed: {
    years() {
      const currentYear = new Date().getFullYear();
      const startYear = 1900;
      return Array.from(
        { length: currentYear - startYear + 1 },
        (_, index) => currentYear - index
      );
    },
  },
};
</script>
