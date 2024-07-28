<template>
  <div>
    <my-header ref="headerRef" />
    <my-home ref="homeRef" />
  </div>
</template>
<script>
import MyHeader from "./components/Header.vue";
import Home from "./views/Home.vue";

export default {
  components: {
    MyHeader,
    "my-home": Home,
  },
  methods: {
    hello() {
      this.$refs.homeRef.hi();
      this.$refs.headerRef.hi();
    },
  },
};
</script>
<style></style>
