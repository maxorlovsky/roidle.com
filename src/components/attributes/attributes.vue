<template>
    <div class="attributes">
        <div v-if="publicProfile"
            class="attributes__params attributes__params--full"
        >
            <span class="attributes__params__label">{{ $t('global.name') }}</span>
            <span class="attributes__params__value">{{ name }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.baseLevel') }}</span>
            <span class="attributes__params__value">{{ baseLevel }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.jobLevel') }}</span>
            <span class="attributes__params__value">{{ jobLevel }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.job') }}</span>
            <span class="attributes__params__value">{{ job }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.mhp') }}</span>
            <span class="attributes__params__value">{{ maxHp }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.mmp') }}</span>
            <span class="attributes__params__value">{{ maxMp }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.patk') }}</span>
            <span class="attributes__params__value">{{ patk }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.matk') }}</span>
            <span class="attributes__params__value">{{ matk }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.pdef') }}</span>
            <span class="attributes__params__value">{{ pdef }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.mdef') }}</span>
            <span class="attributes__params__value">{{ mdef }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.hit') }}</span>
            <span class="attributes__params__value">{{ hit }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.eva') }}</span>
            <span class="attributes__params__value">{{ eva }}</span>
        </div>
        <div class="attributes__params">
            <span class="attributes__params__label">{{ $t('attributes.speed') }}</span>
            <span class="attributes__params__value">+{{ speed }}%</span>
        </div>
        <div class="attributes__params attributes__params--half">
            <span class="attributes__params__label">{{ $t('attributes.catk') }}</span>
            <span class="attributes__params__value">{{ crit }}%</span>
        </div>
        <div class="attributes__params attributes__params--half">
            <span class="attributes__params__label">{{ $t('attributes.cdef') }}</span>
            <span class="attributes__params__value">{{ critDef }}%</span>
        </div>
        <div class="attributes__params attributes__params--half">
            <span class="attributes__params__label">{{ $t('global.party') }}</span>
            <span class="attributes__params__value">{{ partyName || '--' }}</span>
        </div>
        <div class="attributes__params attributes__params--half">
            <span class="attributes__params__label">{{ $t('global.guild') }}</span>
            <span class="attributes__params__value">{{ guildName || '--' }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'stats-public',
    props: {
        publicProfile: {
            type: Boolean,
            default: false
        },
        name: {
            type: String,
            default: ''
        },
        job: {
            type: String,
            default: ''
        },
        baseLevel: {
            type: Number,
            default: 0
        },
        jobLevel: {
            type: Number,
            default: 0
        },
        partyName: {
            type: String,
            default: '--'
        },
        guildName: {
            type: String,
            default: '--'
        },
        patk: {
            type: Number,
            required: true
        },
        matk: {
            type: Number,
            required: true
        },
        pdef: {
            type: Number,
            required: true
        },
        mdef: {
            type: Number,
            required: true
        },
        hit: {
            type: Number,
            required: true
        },
        eva: {
            type: Number,
            required: true
        },
        speed: {
            type: Number,
            required: true
        },
        crit: {
            type: Number,
            required: true
        },
        critDef: {
            type: Number,
            required: true
        },
        maxHp: {
            type: Number,
            required: true
        },
        maxMp: {
            type: Number,
            required: true
        }
    },
    data() {
        return {};
    }
};
</script>