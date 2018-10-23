<template>
    <section class="heroes-page">
        <p>{{ party }}</p>
        <div v-for="hero of party"
            :key="hero.id"
            class="hero-block"
        >
            <span>{{ hero.name }}</span>
        </div>
    </section>
</template>

<script>
const heroesPage = {
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
    path: '/heroes',
    component: heroesPage
});

export default heroesPage;
</script>