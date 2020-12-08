const mixin = {
    methods: {
        staticTimer(miliseconds) {
            const seconds = Math.floor((miliseconds) % 60);
            const minutes = Math.floor((miliseconds / 60) % 60);
            const hours = Math.floor((miliseconds / (60 * 60)) % 24);
            let returnTimeString = '';

            if (hours) {
                returnTimeString += `${hours}h `;
            }

            if (minutes) {
                returnTimeString += `${minutes}m `;
            }

            if (seconds) {
                returnTimeString += `${seconds}s`;
            }

            return returnTimeString;
        },
    }
};

export default mixin;