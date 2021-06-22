<template>
    <div v-if="show"
        :class="{
            'weather--night': night,
            'weather--sunrise': sunrise,
            'weather--sunset': sunset
        }"
        class="weather"
    >
        <ul v-if="snow"
            class="weather__snow"
        >
            <li />
            <li />
        </ul>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'weather',
    data() {
        return {
            show: false,
            night: false,
            sunset: false,
            sunrise: false,
            rain: false,
            snow: false
        };
    },
    computed: {
        ...mapGetters([
            'currentLocation',
            'serverHour'
        ]),
    },
    watch: {
        currentLocation: {
            immediate: true,
            handler() {
                if (this.currentLocation) {
                    this.updateWeather();
                }
            }
        },
        serverHour: {
            immediate: true,
            handler() {
                if (this.currentLocation) {
                    this.updateWeather();
                }
            }
        }
    },
    methods: {
        updateWeather() {
            if (this.currentLocation.dungeon) {
                this.show = false;

                return true;
            }

            this.show = true;

            // Reset state
            this.night = false;
            this.sunset = false;
            this.sunrise = false;

            if (this.serverHour === 7 || this.serverHour === 18) {
                // Every 7 and 14 hours we have sunset
                this.sunset = true;
            } else if ((this.serverHour >= 8 && this.serverHour <= 11) || (this.serverHour >= 19 && this.serverHour <= 23)) {
                // Every 8,9,10,11 hours we have night, for 4 hours
                this.night = true;
            } else if (this.serverHour === 0 || this.serverHour === 12) {
                // Every 12 hours we have sunrise
                this.sunrise = true;
            }
        }
    }
};
</script>