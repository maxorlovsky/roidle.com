<template>
    <section class="text-page">
        <div class="text-page__wrapper">
            <h1>{{ $t('footer.legal') }}</h1>

            <!-- eslint-disable -->
            <p>RO Idle is a fan made game, based on <a href="https://en.wikipedia.org/wiki/Ragnarok_(manhwa)" target="_blank">Manhwa Ragnarok</a> and game of <a href="https://en.wikipedia.org/wiki/Ragnarok_Online" target="_blank">Ragnarok Online</a> done by <a href="https://en.wikipedia.org/wiki/Gravity_(Korean_company)" target="_blank">Gravity</a></p>

            <p>This game frontend/client is open source and available to public on <a href="https://github.com/maxorlovsky/roidle.com" target="_blank">github maxorlovsky/roidle.com</a></p>

            <p>Assets used in this game which are no made as a unique asset for the game will be in this list. In case you found that your asset is used and you wish it to be removed is free to send email at max.orlovsky ( at ) gmail.com or open <a href="https://github.com/maxorlovsky/roidle.com/issues" target="_blank">issue on github of the project</a>. If you notice that your asset is used, but you're not credited, do the same.</p>

            <ul>
                <li>Assets of characters excluding some dyes, maps, backgrounds, skills, items and illustration of some NPC are taken from game <a href="https://en.wikipedia.org/wiki/Ragnarok_Online" target="_blank">Rangarok Online (2002)</a> <a href="http://www.ragnarokonline.com" target="_blank">http://www.ragnarokonline.com</a></li>
                <li>Dyes of characters are taken from website RateMyServer Character Simulator - <a href="https://ro-character-simulator.ratemyserver.net" target="_blank">https://ro-character-simulator.ratemyserver.net</a></li>
                <li>Background Music is taken from original <a href="https://en.wikipedia.org/wiki/Ragnarok_Online" target="_blank">Rangarok Online (2002)</a> game client and made by <a href="https://ragnarok.fandom.com/wiki/SoundTeMP" target="_blank">soundTeMP</a>. Lots of their music can be found on their <a href="https://www.last.fm/music/soundTeMP" target="_blank">last.fm page</a></li>
                <li>Remixed Prontera and intro music: <a href="https://www.youtube.com/watch?v=SA3giJVOfyY" target="_blank">StudioA' - Streamside</a></li>
                <li>Remixed Izlude and intro music: <a href="https://www.youtube.com/watch?v=o2ca823Up6o" target="_blank">StudioA' - Everlasting Wanderers</a></li>
                <li>Remixed Payon Forest music: <a href="https://www.youtube.com/watch?v=GkSSwd7onnM" target="_blank">[Apple Project] Peaceful Forest -昼下がりの街角-</a></li>
                <li>Remixed Geffen music: <a href="https://www.youtube.com/watch?v=-5YczdukIRU" target="_blank">StudioA' - Theme of Geffen</a></li>
            </ul>
            <!-- eslint-enable -->
        </div>
    </section>
</template>

<script>
const legalPage = {};

// Routing
mo.routes.push({
    path: '/legal',
    component: legalPage
});

export default legalPage;
</script>