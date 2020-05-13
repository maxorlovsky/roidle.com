<template>
    <div class="volume-control-home game-icon"
        @click="musicToggle"
    >
        <i :class="{'icon-volume-on': music, 'icon-volume-off': !music}"
            class="icon"
        />
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'volume-control-home',
    data() {
        return {};
    },
    computed: {
        ...mapGetters(['music']),
    },
    methods: {
        ...mapActions(['musicOff', 'musicOn']),

        musicToggle() {
            if (this.music) {
                this.musicOff();
            } else {
                this.musicOn();
            }
        }
    }
};
</script>