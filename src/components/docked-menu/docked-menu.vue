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
                    :head-color="characterHeadColor"
                    :gender="characterGender"
                    :just-head="true"
                    job="Novice"
                />
            </router-link>

            <div :class="{'docked-menu__button--disabled': !currentLocation || (currentLocation && currentLocation.dungeon)}"
                class="docked-menu__button docked-menu__button--map"
                @click="travelToMap()"
            ><img :src="`${serverUrl}/dist/assets/images/compass.png`"></div>

            <router-link to="/quests"
                class="docked-menu__button docked-menu__button--quests"
            ><img :src="`${serverUrl}/dist/assets/images/board.png`"></router-link>

            <router-link to="/inventory"
                class="docked-menu__button docked-menu__button--inventory"
            ><img :src="`${serverUrl}/dist/assets/images/bag.png`"></router-link>

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
            'characterHeadColor',
            'characterGender',
            'currentLocation',
            'serverUrl'
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
    },
    methods: {
        travelToMap() {
            if (this.currentLocation.dungeon) {
                return false;
            }

            this.$router.push('/map');
        }
    },
};
</script>