<template>
    <div class="attributes">
        <div v-if="attributesComponents.publicProfile || attributesComponents.monster"
            class="attributes__params attributes__params--full"
        >
            <span class="attributes__params__label">{{ $t('global.name') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.name }}</span>
        </div>
        <div v-if="!attributesComponents.monster"
            class="attributes__params"
        >
            <span class="attributes__params__label">{{ $t('attributes.baseLevel') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.baseLevel }}</span>
        </div>
        <div v-if="!attributesComponents.monster"
            class="attributes__params"
        >
            <span class="attributes__params__label">{{ $t('attributes.jobLevel') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.jobLevel }}</span>
        </div>
        <div v-if="!attributesComponents.monster"
            class="attributes__params"
        >
            <span class="attributes__params__label">{{ $t('attributes.job') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.job }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.mhp') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.maxHp }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.mmp') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.maxMp }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.patk') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.patk }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.matk') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.matk }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.pdef') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.pdef }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.mdef') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.mdef }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.hit') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.hit }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.eva') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.eva }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.speed') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.speed }}</span>
        </div>
        <div class="attributes__params attributes__params--half">
            <span class="attributes__params__label">{{ $t('attributes.catk') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.crit }}%</span>
        </div>
        <div class="attributes__params attributes__params--half">
            <span class="attributes__params__label">{{ $t('attributes.cdef') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.critDef }}%</span>
        </div>
        <div v-if="!attributesComponents.monster"
            class="attributes__params attributes__params--half"
        >
            <span class="attributes__params__label">{{ $t('global.party') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.partyName || '--' }}</span>
        </div>
        <div v-if="!attributesComponents.monster"
            class="attributes__params attributes__params--half"
        >
            <span class="attributes__params__label">{{ $t('global.guild') }}</span>
            <span class="attributes__params__value">{{ attributesComponents.guildName || '--' }}</span>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'attributes',
    data() {
        return {};
    },
    computed: {
        ...mapGetters(['attributesComponents'])
    },
};
</script>