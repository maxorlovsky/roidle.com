<template>
    <section class="character">
        <skills-list />
    </section>
</template>

<script>
// Components
import skillsList from '@components/skills-list/skills-list.vue';

const characterSkillsPage = {
    components: {
        skillsList
    },
    data() {
        return {};
    }
};

// Routing
mo.routes.push({
    path: '/character/skills',
    component: characterSkillsPage
});

export default characterSkillsPage;
</script>