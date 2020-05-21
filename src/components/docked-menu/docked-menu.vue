<template>
    <div class="docked-menu">
        <a v-if="displayBackButton"
            class="btn game-button btn-lg"
            href="javascript:void(0);"
            @click="$router.go(-1)"
        >&#8592;</a>

        <template v-if="!displayBackButton">
            <router-link to="/character"
                class="docked-menu__button docked-menu__button--character"
            >
                <avatar :head-style="characterHeadStyle"
                    :gender="characterGender"
                    :just-head="true"
                    job="Novice"
                />
            </router-link>

            <router-link to="/map"
                class="docked-menu__button docked-menu__button--map"
            ><img src="/dist/assets/images/compass.png"></router-link>

            <router-link to="/quests"
                class="docked-menu__button docked-menu__button--quests"
            ><img src="/dist/assets/images/board.png"></router-link>

            <router-link to="/inventory"
                class="docked-menu__button docked-menu__button--inventory"
            ><img src="/dist/assets/images/bag.png"></router-link>

            <!-- <router-link to="/"
                class="btn btn-secondary"
            >Guild</router-link>-->
        </template>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import avatar from '../avatar/avatar.vue';

export default {
    name: 'docked-menu',
    components: {
        avatar
    },
    data() {
        return {
            displayBackButton: false
        };
    },
    computed: {
        ...mapGetters([
            'characterHeadStyle',
            'characterGender'
        ])
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