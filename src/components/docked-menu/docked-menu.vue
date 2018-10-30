<template>
    <div class="docked-menu">
        <a v-if="displayBackButton"
            class="btn btn-secondary"
            href="#"
            @click="$router.go(-1)"
        >&#8592;</a>

        <template v-if="!displayBackButton">
            <router-link to="/party"
                class="btn btn-secondary"
            >P</router-link>

            <router-link to="/missions"
                class="btn btn-secondary"
            >M</router-link>
        </template>
    </div>
</template>

<script>
export default {
    name: 'docked-menu',
    data() {
        return {
            displayBackButton: false
        };
    },
    watch: {
        $route: {
            immediate: true,
            handler() {
                if (this.$route.path === '/game') {
                    this.displayBackButton = false;
                } else {
                    this.displayBackButton = true;
                }
            }
        }
    }
}
</script>