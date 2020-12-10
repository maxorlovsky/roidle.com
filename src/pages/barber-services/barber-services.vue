<template>
    <div class="barber-services">
        <div class="barber-services__wrapper">
            <div class="barber-services__character-view">
                <avatar :head-style="headStyle"
                    :head-color="headColor"
                    :gender="characterGender"
                    :job="characterJob"
                />

                <div class="barber-services__character-pickers">
                    <div class="barber-services__character-pickers__buttons">
                        <button :disabled="buttonLoading"
                            class="btn btn-secondary"
                            @click="setStyle('prev')"
                        > &#60; </button>
                        <button :disabled="buttonLoading"
                            class="btn btn-secondary"
                            @click="setStyle('next')"
                        > &#62; </button>
                    </div>
                    <div class="barber-services__character-pickers__buttons">
                        <button :disabled="buttonLoading"
                            class="btn btn-secondary"
                            @click="setColor('prev')"
                        > &#60; </button>
                        <button :disabled="buttonLoading"
                            class="btn btn-secondary"
                            @click="setColor('next')"
                        > &#62; </button>
                    </div>
                </div>

                <div class="barber-services__save-button">
                    <button :disabled="buttonLoading"
                        class="btn game-button"
                        @click="changeStyle()"
                    >{{ $t('kafra.barberChangeStyle') }} ({{ barberPrice }} Z)</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import avatar from '@components/avatar/avatar.vue';

// Utils
import discount from '@utils/discount.js';

const barberServicesPage = {
    components: {
        avatar
    },
    data() {
        return {
            buttonLoading: false,
            headStyle: 1,
            headColor: 1
        };
    },
    computed: {
        ...mapGetters([
            'characterHeadStyle',
            'characterHeadColor',
            'characterGender',
            'characterJob',
            'characterEquipment',
            'characterSkills'
        ]),

        barberPrice() {
            return discount(1000, this.characterSkills[25]);
        },
    },
    watch: {
        characterHeadStyle: {
            immediate: true,
            handler() {
                this.headStyle = this.characterHeadStyle;
            }
        },
        characterHeadColor: {
            immediate: true,
            handler() {
                this.headColor = this.characterHeadColor;
            }
        }
    },
    mounted() {
        // If character don't have 60 zeny for service fee, we kick him out of storage
        if (this.characterZeny < 1000) {
            this.$router.push('/game');

            return false;
        }

        mo.socket.on('updateStyleComplete', () => {
            this.buttonLoading = false;

            this.$store.commit('updateCharacterStyle', {
                headStyle: this.headStyle,
                headColor: this.headColor
            });

            this.$router.push('/game');
        });
    },
    beforeDestroy() {
        mo.socket.off('storageUpdateComplete');
    },
    methods: {
        changeStyle() {
            this.buttonLoading = true;

            mo.socket.emit('updateStyle', {
                headStyle: this.headStyle,
                headColor: this.headColor
            });
        },
        setStyle(pos) {
            let style = 0;

            switch (pos) {
                case 'prev':
                    style = this.headStyle - 1;
                    break;
                default:
                    style = this.headStyle + 1;
                    break;
            }

            if (style < 1) {
                style = 23;
            } else if (style > 23) {
                style = 1;
            }

            this.headStyle = style;
        },
        setColor(pos) {
            let color = 0;

            switch (pos) {
                case 'prev':
                    color = this.headColor - 1;
                    break;
                default:
                    color = this.headColor + 1;
                    break;
            }

            if (color < 1) {
                color = 8;
            } else if (color > 8) {
                color = 1;
            }

            this.headColor = color;
        }
    }
};

// Routing
mo.routes.push({
    path: '/barber-services',
    component: barberServicesPage
});

export default barberServicesPage;
</script>