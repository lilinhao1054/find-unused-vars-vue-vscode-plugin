<template>
  <div>
    <Header ref="headerRef" />
    <div>content</div>
    <Modal />
  </div>
</template>
<script>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Modal from "./components/Modal.vue";

export default {
  components: {
    Header,
    Modal,
  },
  methods: {
    hello() {
      this.$refs.headerRef.say();
    },
  },
};
</script>
