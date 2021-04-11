<template>
    <div class="home">
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
                const response = await axios.get(`${mo.serverUrl}/api/ping?cache=${new Date().getTime()}`);

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