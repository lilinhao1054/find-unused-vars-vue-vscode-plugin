<template>
    <div v-text="abc"></div>
    <div>{{ count }}</div>
    <div>{{ doubleCount }}</div>
    <button @click="increment">+1</button>
    <button @click="() => decrement()">-1</button>
</template>
<script>
export default {
    props: {
        abc: {
            type: String,
        },
        jkl: {
            type: Number,
            default: 0,
        }
    },
    data() {
        return {
            count: 0,
        }
    },
    methods: {
        increment() {
            this.count++;
        },
        decrement() {
            this.count--;
        }
    },
    computed: {
        doubleCount: () => this.count * 2,
        negativeCount: () => -1 * this.count
    }
}
</script>
<style scoped>
</style>
<style lang="css"></style>