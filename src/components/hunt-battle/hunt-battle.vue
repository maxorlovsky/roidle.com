<template>
    <div class="hunt-battle">
        <loading v-if="!huntField" />
        <template v-else>
            <div class="hunt-battle__side hunt-battle__side--left">
                <div v-if="huntField.leftSide.backline"
                    class="hunt-battle__line"
                >
                    <div v-for="laner in huntField.leftSide.backline"
                        :key="laner.id"
                        class="hunt-battle__player"
                    >
                        <hunt-battle-avatar :laner="laner" />
                    </div>
                </div>

                <div v-if="huntField.leftSide.midline"
                    class="hunt-battle__line"
                >
                    <div v-for="laner in huntField.leftSide.midline"
                        :key="laner.id"
                        class="hunt-battle__player"
                    >
                        <hunt-battle-avatar :laner="laner" />
                    </div>
                </div>

                <div v-if="huntField.leftSide.frontline"
                    class="hunt-battle__line"
                >
                    <div v-for="laner in huntField.leftSide.frontline"
                        :key="laner.id"
                        class="hunt-battle__player"
                    >
                        <hunt-battle-avatar :laner="laner" />
                    </div>
                </div>
            </div>
            <div class="hunt-battle__vs" />
            <div class="hunt-battle__side hunt-battle__side--right">
                <div v-if="huntField.rightSide.frontline"
                    class="hunt-battle__line"
                >
                    <div v-for="(laner, index) in huntField.rightSide.frontline"
                        :key="index"
                        class="hunt-battle__player"
                    >
                        <hunt-battle-avatar :laner="laner" />
                    </div>
                </div>

                <div v-if="huntField.rightSide.midline"
                    class="hunt-battle__line"
                >
                    <div v-for="(laner, index) in huntField.rightSide.midline"
                        :key="index"
                        class="hunt-battle__player"
                    >
                        <hunt-battle-avatar :laner="laner" />
                    </div>
                </div>

                <div v-if="huntField.rightSide.backline"
                    class="hunt-battle__line"
                >
                    <div v-for="(laner, index) in huntField.rightSide.backline"
                        :key="index"
                        class="hunt-battle__player"
                    >
                        <hunt-battle-avatar :laner="laner" />
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';
import huntBattleAvatar from '@components/hunt-battle/hunt-battle-avatar.vue';

export default {
    name: 'hunt-battle',
    components: {
        loading,
        huntBattleAvatar
    },
    computed: {
        ...mapGetters(['huntField'])
    }
};
</script>