<template>
    <div>{{ count }}</div>
    <child-comp />
</template>
<script>
import ChildComp from '@/components/child-comp.vue';

export default {
    components: {
        ChildComp
    },
    data() {
        return {
            count: 0,
            unused: 1,
        }
    }
}
</script>
<style>
</style>