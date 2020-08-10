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
        <div v-if="headGear"
            class="avatar__headgear"
        >
            <img :src="`/dist/assets/images/headgear/${headGear}.gif`">
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
        headGear: {
            type: Number,
            required: false,
            default: 0
        }
    },
    computed: {
        jobLowerCase() {
            return this.job.toLowerCase();
        }
    }
};
</script>