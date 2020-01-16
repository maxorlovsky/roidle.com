<template>
    <section :class="location"
        class="game"
    >
        <div class="party">
            <div class="party__slot">+</div>
            <div class="party__slot">+</div>
            <div class="party__slot">+</div>
            <div class="party__slot">+</div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Configs
import allMaps from '../../../config/map.json';

const gamePage = {
    data() {
        return {
            location: ''
        };
    },
    computed: {
        ...mapGetters(['characterLocation'])
    },
    watch: {
        characterLocation: {
            immediate: true,
            handler() {
                this.getLocation();
            }
        }
    },
    methods: {
        getLocation() {
            let mapPiece = null;

            for (const row of Object.keys(allMaps)) {
                mapPiece = allMaps[row].find((piece) => piece.id === Number(this.characterLocation));

                if (mapPiece) {
                    break;
                }
            }

            this.location = this.getLocationClass(mapPiece.mapFile);
        },
        getLocationClass(mapName) {
            let location = '';

            if (mapName.indexOf('fild') >= 0) {
                location = 'field';
            } else {
                location = 'prontera';
            }

            return location;
        }
    }
};

// Routing
mo.routes.push({
    path: '/game',
    component: gamePage
});

export default gamePage;
</script>