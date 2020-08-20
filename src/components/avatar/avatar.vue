<template>
    <div :class="{'avatar--just-head': justHead, 'avatar--framed': framed}"
        class="avatar"
    >
        <div class="avatar__body">
            <img :src="`/dist/assets/images/bodies/${jobLowerCase}_${gender}_0.png`">
        </div>
        <div :class="[`avatar__head__${headStyle}`, gender]"
            class="avatar__head"
        >
            <img :src="`/dist/assets/images/heads/${gender}/${headStyle}-${headColor}.gif`">
        </div>
        <div v-for="(gear, index) in headGears"
            :key="index"
            class="avatar__headgear"
        >
            <template v-if="gear">
                <img :src="`/dist/assets/images/headgear/${gear}.gif`">
            </template>
        </div>
    </div>
</template>

<script>
export default {
    name: 'avatar',
    props: {
        headStyle: {
            type: Number,
            required: true
        },
        headColor: {
            type: Number,
            required: true
        },
        gender: {
            type: String,
            required: true
        },
        framed: {
            type: Boolean,
            default: false
        },
        justHead: {
            type: Boolean,
            default: false
        },
        job: {
            type: String,
            default: 'novice'
        },
        headGears: {
            type: Array,
            required: false,
            default: () => [0, 0, 0]
        }
    },
    computed: {
        jobLowerCase() {
            return this.job.toLowerCase();
        }
    }
};
</script>