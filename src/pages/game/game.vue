<template>
    <section class="game">
        <char-info-top />
    </section>
</template>

<script>
// Components
import charInfoTop from '../../components/char-info-top/char-info-top.vue';

const gamePage = {
    components: {
        charInfoTop
    },
    data() {
        return {};
    }
};

// Routing
mo.routes.push({
    path: '/game',
    component: gamePage
});

export default gamePage;
</script>