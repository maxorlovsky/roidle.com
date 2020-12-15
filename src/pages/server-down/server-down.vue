<template>
    <div class="home">
        <div class="home__top-bar">
            <nav class="home__top-bar__links">
                <a href="https://roidle.fandom.com/wiki/ROIdle_Wiki"
                    target="_blank"
                    rel="noopener nofollow"
                >
                    {{ $t('home.wiki') }}
                </a>
            </nav>
            <div class="home__top-bar__right">
                <a href="https://www.reddit.com/r/ROIdle"
                    class="home__top-bar__reddit-link game-icon"
                    target="_blank"
                >
                    <i class="icon icon-reddit" />
                </a>

                <a href="https://discord.gg/PjApFha"
                    class="home__top-bar__discord-link game-icon"
                    target="_blank"
                >
                    <img :src="`${serverUrl}/dist/assets/images/discord.png`">
                </a>

                <volume-control-home />
            </div>
        </div>

        <div class="home__logo">
            <img :src="`${serverUrl}/dist/assets/images/logo.png`">
        </div>

        <div class="server-down">
            <span class="server-down__text">{{ $t('home.serverDown') }} {{ seconds }}</span>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import axios from 'axios';
import { mapGetters } from 'vuex';

// Components
import volumeControlHome from '@components/volume-control-home/volume-control-home.vue';

const serverDownPage = {
    components: {
        volumeControlHome
    },
    data() {
        return {
            seconds: 10
        };
    },
    computed: {
        ...mapGetters(['serverUrl'])
    },
    mounted() {
        this.checkServerStatus();
    },
    methods: {
        async checkServerStatus() {
            try {
                const response = await axios.get(`${mo.serverUrl}/api/ping`);

                // In case of message OK sent, server are back up, we redirect user to home page
                if (response.data.message === 'OK') {
                    this.$router.replace('/');
                } else {
                    this.seconds = 10;
                    this.runTimer();
                }
            } catch (error) {
                // Resetting timer
                this.seconds = 10;
                this.runTimer();
            }
        },
        runTimer() {
            // Set up 10 seconds timer to recheck status of the servers
            setTimeout(() => {
                // When seconds reach 1, we trigger server status check
                if (this.seconds <= 1) {
                    this.checkServerStatus();

                    return true;
                }

                this.seconds--;
                this.runTimer();
            }, 1000);
        }
    }
};

// Routing
mo.routes.push({
    path: '/server-down',
    component: serverDownPage
});

export default serverDownPage;
</script>