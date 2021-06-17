<template>
    <section class="all-hunts">
        <div class="all-hunts__empty">
            <p>Active hunts</p>

            <loading v-if="loading" />
            <div v-else
                class="all-hunts__hunts"
            >
                <div v-for="item in huntsList"
                    :key="item.socketId"
                    class="all-hunts__hunt"
                >
                    <div class="all-hunts__hunt__info">
                        HuntID: {{ item.id }}<br>
                        Characters: {{ item.characters }}<br>
                        Is stopping: {{ item.isStopping }}
                    </div>

                    <div class="all-hunts__hunt__buttons">
                        <button :disabled="buttonLoading"
                            class="btn game-button"
                            @click="removeHunt(item.id)"
                        >Remove</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

const allHuntsPage = {
    components: {
        loading
    },
    data() {
        return {
            loading: true,
            buttonLoading: false,
            huntsList: [],
        };
    },
    computed: {
        ...mapGetters([
            'admin',
            'serverUrl'
        ]),
    },
    mounted() {
        mo.socket.on('getListOfAllHuntsComplete', (response) => {
            this.huntsList = response;
            this.loading = false;
        });

        mo.socket.on('adminRemoveHuntComplete', (response) => {
            this.buttonLoading = false;

            // eslint-disable-next-line
            console.log('Remove hunt status ', response);

            mo.socket.emit('getListOfAllHunts');
        });

        mo.socket.emit('getListOfAllHunts');
    },
    beforeDestroy() {
        mo.socket.off('adminRemoveHuntComplete');
        mo.socket.off('getListOfAllUsersComplete');
    },
    methods: {
        removeHunt(id) {
            this.buttonLoading = true;

            mo.socket.emit('adminRemoveHunt', id);
        }
    }
};

// Routing
mo.routes.push({
    path: '/all-hunts',
    component: allHuntsPage
});

export default allHuntsPage;
</script>