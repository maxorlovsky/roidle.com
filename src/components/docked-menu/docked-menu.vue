<template>
    <div class="docked-menu">
        <a v-if="displayBackButton"
            class="btn game-button btn-lg"
            href="#"
            @click="$router.go(-1)"
        >&#8592;</a>

        <template v-if="!displayBackButton">
            <router-link to="/character"
                class="docked-menu__button"
            ><img src="/dist/assets/images/char.png"></router-link>

            <router-link to="/map"
                class="docked-menu__button"
            ><img src="/dist/assets/images/compass.png"></router-link>

            <router-link to="/quests"
                class="docked-menu__button"
            ><img src="/dist/assets/images/tasks.png"></router-link>

            <router-link to="/inventory"
                class="docked-menu__button"
            ><img src="/dist/assets/images/backpack.png"></router-link>

            <!-- <router-link to="/"
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