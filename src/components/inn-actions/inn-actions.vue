<template>
    <div class="kafra-actions game__action">
        <div @click="showModal = true">
            <img class="game__action__image"
                src="/dist/assets/images/inn.png"
            >
            <span class="game__action__name">Rest at Inn</span>
        </div>

        <div v-if="showModal"
            class="modal"
        >
            <div class="modal__header">Inn rooms</div>
            <div class="modal__content kafra-actions__buttons">
                <button class="btn btn-primary"
                    @click="typeChosen = 'cheap'"
                >Cheap room - 10 min (1 Z)</button>

                <button class="btn btn-primary"
                    @click="typeChosen = 'regular'"
                >Regular room - 5 min (10 Z)</button>

                <button class="btn btn-primary"
                    @click="typeChosen = 'deluxe'"
                >Deluxe room - 1 min (100 Z)</button>

                <!--<button class="btn btn-primary"
                    @click="typeChosen = 'premier'"
                >Premier room - 1 min + Buff (500 Z)</button>-->
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeModal()"
                >Cancel</button>

                <button :disabled="!typeChosen"
                    :class="{'disabled': !typeChosen}"
                    class="btn btn-success"
                    @click="startRest()"
                >Approve</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'inn-actions',
    data() {
        return {
            typeChosen: '',
            showModal: false
        };
    },
    mounted() {
        mo.socket.on('requestRestComplete', (response) => {
            this.$store.commit('saveResting', response.dateTimeFinish);
            this.$store.commit('saveZeny', response.zeny);
        });
    },
    beforeDestroy() {
        mo.socket.off('requestRest');
    },
    methods: {
        startRest() {
            mo.socket.emit('requestRest', this.typeChosen);

            this.closeModal();
        },
        closeModal() {
            this.typeChosen = '';
            this.showModal = false;
        }
    }
};
</script>