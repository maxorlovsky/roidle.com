<template>
    <div class="trade-window-request">
        <div class="modal">
            <div class="modal__header">Trade request</div>
            <div class="modal__content">
                <b>{{ tradeRequestName }}</b> would like to trade with you
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="rejectTrade()"
                >Reject</button>
                <button class="btn game-button"
                    @click="viewCharacter(tradeRequestName)"
                >View Profile</button>
                <button class="btn btn-success"
                    @click="acceptTrade()"
                >Accept</button>
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
            'tradeRequestId',
            'tradeRequestName',
        ])
    },
    mounted() {
        mo.socket.on('rejectTradeComplete', () => {
            // Reset trade request, so this modal would close
            this.$store.commit('tradeRequest', {
                id: 0,
                name: 0
            });
        });
    },
    beforeDestroy() {
        mo.socket.off('rejectTradeComplete');
    },
    methods: {
        rejectTrade() {
            mo.socket.emit('rejectTrade');
        },
        viewCharacter(name) {
            this.$router.push(`/profile/${name}`);
        },
    }
};
</script>