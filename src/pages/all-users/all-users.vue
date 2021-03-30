<template>
    <section class="all-users">
        <div class="all-users__empty">
            <p>{{ $t('trade.playersTradingList') }}</p>

            <loading v-if="loading" />
            <div v-else
                class="all-users__characters"
            >
                <div v-for="item in usersList"
                    :key="item.socketId"
                    class="all-users__character"
                >
                    <div class="all-users__character__info">
                        SocketID: {{ item.socketId }}<br>
                        charId: {{ item.charId }}<br>
                        characterLoading: {{ item.characterLoading || false }}<br>
                        <template v-if="item.character">
                            character name: {{ item.character.name || '' }}<br>
                            character location: {{ item.character.location || '' }}<br>
                            Player ID: {{ item.character.playerId || 0 }}<br>
                            Player Admin: {{ item.character.admin || 0 }}
                        </template>
                    </div>

                    <div class="all-users__character__buttons">
                        <button :disabled="buttonLoading"
                            class="btn game-button"
                            @click="kickCharacter(item)"
                        >Kick</button>
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

const allUsersPage = {
    components: {
        loading
    },
    data() {
        return {
            loading: true,
            buttonLoading: false,
            usersList: [],
        };
    },
    computed: {
        ...mapGetters([
            'admin',
            'serverUrl'
        ]),
    },
    mounted() {
        mo.socket.on('getListOfAllUsersComplete', (response) => {
            this.usersList = response;
            this.loading = false;
        });

        mo.socket.on('adminKickCharacterComplete', (response) => {
            this.buttonLoading = false;

            // eslint-disable-next-line
            console.log('Kick status ', response);

            mo.socket.emit('getListOfAllUsers');
        });

        mo.socket.emit('getListOfAllUsers');
    },
    beforeDestroy() {
        mo.socket.off('adminKickCharacterComplete');
        mo.socket.off('getListOfAllUsersComplete');
    },
    methods: {
        kickCharacter(socket) {
            this.buttonLoading = true;

            mo.socket.emit('adminKickCharacter', socket.socketId);
        }
    }
};

// Routing
mo.routes.push({
    path: '/all-users',
    component: allUsersPage
});

export default allUsersPage;
</script>