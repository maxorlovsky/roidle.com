<template>
    <div class="server-down">
        <div class="server-down-wrapper">
            <span class="server-down__text">Our servers are currently down<br>Retrying in {{ seconds }}s</span>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import axios from 'axios';

const serverDownPage = {
    data() {
        return {
            seconds: 10
        };
    },
    mounted() {
        this.checkServerStatus();
    },
    methods: {
        async checkServerStatus() {
            try {
                const response = await axios.get('/api/ping');

                // In case of message OK sent, server are back up, we redirect user to home page
                if (response.data.message === 'OK') {
                    this.$router.replace('/');
                }
            } finally {
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