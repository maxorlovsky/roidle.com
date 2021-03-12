<template>
    <div class="hunt-battle-avatar">
        <div class="hunt-battle-avatar__hp-text">{{ laner.hp }}/{{ laner.maxHp }}</div>
        <div class="hunt-battle-avatar__bar">
            <div :style="{ 'width': barPercentage(laner.hp, laner.maxHp) + '%' }"
                class="hunt-battle-avatar__bar__hp"
            />
        </div>
        <div class="hunt-battle-avatar__mp-text">{{ laner.mp }}/{{ laner.maxMp }}</div>
        <div class="hunt-battle-avatar__bar">
            <div :style="{ 'width': barPercentage(laner.mp, laner.maxMp) + '%' }"
                class="hunt-battle-avatar__bar__mp"
            />
        </div>

        <img v-if="laner.monster"
            :src="`${serverUrl}/dist/assets/images/mobs/${laner.id}.gif`"
            class="hunt-battle-avatar__mob-image"
        >
        <avatar v-else
            :head-style="laner.headStyle"
            :head-color="laner.headColor"
            :dye-color="laner.dyeColor"
            :gender="laner.gender"
            :job="laner.jobName.toLowerCase()"
            :head-gears="[
                laner.equipment[0],
                laner.equipment[1],
                laner.equipment[2]
            ]"
        />

        <div class="hunt-battle-avatar__name">{{ laner.name }}</div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import avatar from '@components/avatar/avatar.vue';

export default {
    name: 'hunt-battle-avatar',
    components: {
        avatar
    },
    props: {
        laner: {
            type: Object,
            default: () => ({})
        },
    },
    data() {
        return {
        };
    },
    computed: {
        ...mapGetters(['serverUrl'])
    },
    methods: {
        barPercentage(param, maxParam) {
            let bar = Math.floor(param / maxParam * 100) || 0;

            if (bar < 0) {
                bar = 0;
            } else if (bar > 100) {
                bar = 100;
            }

            return bar;
        }
    }
};
</script>