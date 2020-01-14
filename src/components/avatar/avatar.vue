<template>
    <div :class="{'avatar--just-head': justHead}"
        class="avatar"
    >
        <div class="avatar__body">
            <img :src="`/dist/assets/images/bodies/novice_${gender}_0.png`">
        </div>
        <div :class="[`avatar__head__${headStyle}`, gender]"
            class="avatar__head"
        >
            <img :src="`/dist/assets/images/heads/${headStyle}_${gender}.gif`">
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
        gender: {
            type: String,
            required: true
        },
        justHead: {
            type: Boolean,
            default: false
        }
    }
};
</script>