<template>
    <section class="game-page">
        <p v-if="party[0]">Hello: {{ party[0].name }}</p>
        <p>Before we continue you should assign stats for each of your hero, click on heroes icon at the bottom</p>
    </section>
</template>

<script>
const gamePage = {
    data() {
        return {};
    },
    computed: {
        party() {
            return this.$store.getters.get('party') || [];
        }
    },
    created() {
        
    }
};

// Routing
mo.routes.push({
    path: '/game',
    component: gamePage
});

export default gamePage;
</script>