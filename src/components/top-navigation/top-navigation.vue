<template>
    <div class="top-navigation">
        <nav class="top-navigation__links">
            <router-link to="/">
                {{ $t('home.home') }}
            </router-link>
            <a href="https://roidle.fandom.com/wiki/ROIdle_Wiki"
                target="_blank"
                rel="noopener nofollow"
            >
                {{ $t('home.wiki') }}
            </a>
            <router-link to="/leaderboards">
                {{ $t('home.leaderboards') }}
            </router-link>
            <!--<a href="https://www.patreon.com/roidle"
                target="_blank"
                rel="noopener nofollow"
            >
                Support the development (Patreon)
            </a>-->
        </nav>
        <div class="top-navigation__right">
            <div class="top-navigation__right__activity">
                <div>{{ $t('home.online') }}: {{ online }}</div>
                <div>{{ $t('home.hunts') }}: {{ hunts }}</div>
                <div>{{ $t('home.playersRegistered') }}: {{ playersRegistered }}</div>
            </div>

            <a href="https://www.reddit.com/r/ROIdle"
                class="top-navigation__reddit-link game-icon"
                target="_blank"
                rel="noopener nofollow"
            >
                <i class="icon icon-reddit" />
            </a>

            <a href="https://discord.gg/PjApFha"
                class="top-navigation__discord-link game-icon"
                target="_blank"
                rel="noopener nofollow"
            >
                <img :src="`${serverUrl}/dist/assets/images/discord.png`">
            </a>

            <volume-control-home />
        </div>
    </div>
</template>

<script>
// 3rd party libs
import axios from 'axios';
import { mapGetters } from 'vuex';

// Components
import volumeControlHome from '@components/volume-control-home/volume-control-home.vue';

export default {
    name: 'top-navigation',
    components: {
        volumeControlHome
    },
    computed: {
        ...mapGetters([
            'serverUrl',
            'online',
            'hunts',
            'playersRegistered',
        ])
    },
    mounted() {
        this.getOnline();
    },
    methods: {
        async getOnline() {
            try {
                const response = await axios.get(`${mo.serverUrl}/api/online?cache=${new Date().getTime()}`);

                this.$store.commit('setOnline', response.data);
            } catch (error) {
                console.error(error);
            }
        }
    }
};
</script>