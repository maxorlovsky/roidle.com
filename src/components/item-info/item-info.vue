<template>
    <div v-if="show"
        class="item-info"
        @click="show = false"
    >
        <img :src="`/dist/assets/images/items/large/${id}.gif`"
            class="item-info__illustration"
        >
        <div class="item-info__description">
            <b>{{ name }}</b>
            <div>Type: <span class="ucfirst">{{ type }}</span></div>
            <div v-if="params">Params: <b>{{ params }}</b></div>
            <div v-if="weaponLevel">Weapon Level: {{ weaponLevel }}</div>
            <div v-if="requiredLevel">Required Level: {{ requiredLevel }}</div>
            <div>Weight: {{ weight }}</div>
            <div v-if="applicableJobs">Applicable Job: {{ applicableJobs }}</div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'item-info',
    data() {
        return {
            show: false,
            name: '',
            type: '',
            params: '',
            weaponLevel: 0,
            requiredLevel: 0,
            weight: 0,
            applicableJob: ''
        };
    },
    computed: {
        ...mapGetters(['socketConnection', 'closeItemInfo'])
    },
    watch: {
        socketConnection() {
            if (this.socketConnection) {
                this.setUpSocketEvents();
            }
        },
        closeItemInfo() {
            this.show = false;
        }
    },
    beforeDestroy() {
        mo.socket.off('getItemsInfoComplete');
    },
    methods: {
        setUpSocketEvents() {
            mo.socket.on('getItemsInfoComplete', (items) => {
                this.showInfo(items[0]);
            });
        },
        showItemInfo(itemId) {
            mo.socket.emit('getItemsInfo', [itemId]);
        },
        showInfo(item) {
            this.show = true;
            this.id = item.id;
            this.name = item.name;
            this.type = item.class ? item.class : item.type;
            this.params = '';
            this.weaponLevel = 0;
            this.requiredLevel = 0;
            this.weight = item.weight;
            this.applicableJobs = item.jobs === null ? 'All' : '';

            // Making params human readable
            if (item.params) {
                for (const param of Object.keys(item.params)) {
                    this.params += `${param.toUpperCase()}: ${item.params[param]}, `;
                }

                this.params = this.params.substring(0, this.params.length - 2);
            }

            if (item.weaponLevel) {
                this.weaponLevel = item.weaponLevel;
            }

            if (item.requireLevel) {
                this.requiredLevel = item.requireLevel;
            }

            if (item.applicableJobs) {
                this.applicableJobs = item.applicableJobs;
            }
        }
    }
};
</script>