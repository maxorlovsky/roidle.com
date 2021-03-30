<template>
    <div v-if="tradeRequestId"
        class="trade-window-request"
    >
        <div class="modal">
            <div class="modal__header">{{ $t('trade.tradeRequest') }}</div>
            <div class="modal__content">
                <b>{{ tradeRequestName }}</b> {{ $t('trade.wouldLikeToTrade') }}
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="rejectTrade()"
                >{{ $t('trade.reject') }}</button>
                <button class="btn game-button"
                    @click="viewCharacter(tradeRequestName)"
                >{{ $t('global.viewProfile') }}</button>
                <button class="btn btn-success"
                    @click="acceptTrade()"
                >{{ $t('trade.accept') }}</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'trade-window-request',
    data() {
        return {};
    },
    computed: {
        ...mapGetters([
            'socketConnection',
            'tradeRequestId',
            'tradeRequestName',
        ])
    },
    watch: {
        socketConnection() {
            if (this.socketConnection) {
                this.setUpSocketEvents();
            }
        },
        tradeRequestId() {
            if (this.tradeRequestId) {
                this.showTradeRequest = true;
            } else {
                this.showTradeRequest = false;
            }
        },
    },
    beforeDestroy() {
        mo.socket.off('rejectTradeComplete');
    },
    methods: {
        setUpSocketEvents() {
            mo.socket.on('rejectTradeComplete', () => {
                this.closeTradeRequest();
            });
        },
        closeTradeRequest() {
            // Reset trade request, so this modal would close
            this.$store.commit('tradeRequest', {
                id: 0,
                name: 0
            });
        },
        rejectTrade() {
            this.closeTradeRequest();

            mo.socket.emit('rejectTrade');
        },
        viewCharacter(name) {
            this.$router.push(`/profile/${name}`);
        },
        acceptTrade() {
            this.closeTradeRequest();

            mo.socket.emit('acceptTrade');
        }
    }
};
</script>