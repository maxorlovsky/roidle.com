<template>
    <div class="hunt-battle">
        <div class="hunt-battle__side hunt-battle__side--left">
            <div v-if="field.leftSide.backline"
                class="hunt-battle__line"
            >
                <div v-for="laner in field.leftSide.backline"
                    :key="laner.id"
                    class="hunt-battle__player"
                >
                    <hunt-battle-avatar :laner="laner" />
                </div>
            </div>

            <div v-if="field.leftSide.midline"
                class="hunt-battle__line"
            >
                <div v-for="laner in field.leftSide.midline"
                    :key="laner.id"
                    class="hunt-battle__player"
                >
                    <hunt-battle-avatar :laner="laner" />
                </div>
            </div>

            <div v-if="field.leftSide.frontline"
                class="hunt-battle__line"
            >
                <div v-for="laner in field.leftSide.frontline"
                    :key="laner.id"
                    class="hunt-battle__player"
                >
                    <hunt-battle-avatar :laner="laner" />
                </div>
            </div>
        </div>
        <div class="hunt-battle__vs" />
        <div class="hunt-battle__side hunt-battle__side--right">
            <div v-if="field.rightSide.frontline"
                class="hunt-battle__line"
            >
                <div v-for="laner in field.rightSide.frontline"
                    :key="laner.id"
                    class="hunt-battle__player"
                >
                    <hunt-battle-avatar :laner="laner" />
                </div>
            </div>

            <div v-if="field.rightSide.midline"
                class="hunt-battle__line"
            >
                <div v-for="laner in field.rightSide.midline"
                    :key="laner.id"
                    class="hunt-battle__player"
                >
                    <hunt-battle-avatar :laner="laner" />
                </div>
            </div>

            <div v-if="field.rightSide.backline"
                class="hunt-battle__line"
            >
                <div v-for="laner in field.rightSide.backline"
                    :key="laner.id"
                    class="hunt-battle__player"
                >
                    <hunt-battle-avatar :laner="laner" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// Components
import huntBattleAvatar from '@components/hunt-battle/hunt-battle-avatar.vue';

export default {
    name: 'hunt-battle',
    components: {
        huntBattleAvatar
    },
    props: {
        field: {
            type: Object,
            default: () => ({})
        },
    },
    data() {
        return {
        };
    }
};
</script>