<template>
    <div class="server-down">
        Our server are currently down
    </div>
</template>

<script>
const serverDownPage = {
    data() {
        return {};
    }
};

// Routing
mo.routes.push({
    path: '/server-down',
    component: serverDownPage
});

export default serverDownPage;
</script>