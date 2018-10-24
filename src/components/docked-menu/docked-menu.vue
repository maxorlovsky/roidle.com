<template>
    <div class="docked-menu">
        <a v-if="displayBackButton"
            class="btn btn-secondary"
            href="#"
            @click="$router.go(-1)"
        >&#8592;</a>

        <router-link v-if="!displayBackButton"
            to="/party"
            class="btn btn-secondary"
        >P</router-link>
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
                if (this.$route.path !== '/game') {
                    this.displayBackButton = true;
                } else {
                    this.displayBackButton = false;
                }
            }
        }
    }
}
</script>