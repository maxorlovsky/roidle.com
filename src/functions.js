const functions = {
    storage: (func, key, ...args) => {
        let timeoutSeconds = 604800000 * 90;

        if (args[1]) {
            timeoutSeconds = args[1];
        }

        // Set item
        if (func === 'set') {
            // If any parameter is empty, we don't do anything
            if (!func || !key || (!args[0] && args[0] !== false)) {
                return false;
            }

            const saveData = {
                data: args[0],
                time: new Date().getTime() + timeoutSeconds,
                version: mo.version
            };

            localStorage.setItem(key, JSON.stringify(saveData));
        } else if (func === 'get') {
            // Check if there is something for specified key
            if (!localStorage.getItem(key)) {
                return false;
            }

            const returnValue = JSON.parse(localStorage.getItem(key));

            if (
                // If older than 30 min
                (returnValue.time <= new Date().getTime()) ||
                // Or if version is now different, ignoring session token
                (returnValue.version !== mo.version && key !== 'token')
            ) {
                // Cleanup
                functions.storage('remove', key);

                return false;
            }

            return returnValue.data;
        } else if (func === 'remove') {
            localStorage.removeItem(key);
        } else {
            return false;
        }

        return true;
    },
    storageCacheBuster: () => {
        const storagesKeys = ['structure-data'];

        // If version was bumped, we might still use outdated localStorage data, doing full cleanup
        if (localStorage.getItem('version') !== mo.version) {
            for (const value of storagesKeys) {
                localStorage.removeItem(value);
            }
            // Saving version to not cleaup everything again until the next bump
            localStorage.setItem('version', mo.version);
        }

        return true;
    }
};

export { functions };