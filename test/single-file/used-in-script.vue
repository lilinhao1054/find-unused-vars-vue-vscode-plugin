<template>
    <div>Hello World</div>
</template>
<script>
export default {
    data() {
        return {
            count: 0,
        }
    },
    computed: {
        doubleCount: () => this.count * 2,
    }
}
</script>
<style>
</style>