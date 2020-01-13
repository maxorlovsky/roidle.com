<template>
    <div class="docked-menu">
        <a v-if="displayBackButton"
            class="btn btn-secondary"
            href="#"
            @click="$router.go(-1)"
        >&#8592;</a>

        <template v-if="!displayBackButton">
            <router-link to="/character"
                class="btn btn-secondary"
            >Char</router-link>

            <router-link to="/missions"
                class="btn btn-secondary"
            >Mis</router-link>

            <router-link to="/"
                class="btn btn-secondary"
            >Bag</router-link>

            <router-link to="/"
                class="btn btn-secondary"
            >Skills</router-link>

            <!--<router-link to="/"
                class="btn btn-secondary"
            >Storage</router-link>

            <router-link to="/"
                class="btn btn-secondary"
            >Map</router-link>

            <router-link to="/"
                class="btn btn-secondary"
            >Party</router-link>

            <router-link to="/"
                class="btn btn-secondary"
            >Guild</router-link>-->
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
};
</script>