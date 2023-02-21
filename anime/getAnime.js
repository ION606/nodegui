//https://github.com/riimuru/gogoanime-api#routes
const { QTextBrowser } = require('@nodegui/nodegui');

async function getSearchTerm(name) {
    return new Promise((resolve) => {
        // fetch(`https://gogoanime.consumet.stream/search?keyw=${name}`)
        fetch("https://gogoanime.consumet.stream/anime-details/naruto")
        .then((response) => response.json())
        .then((animelist) => resolve(animelist));
    });
}


async function getUrl(name, episode) {
    const animeTerm = await getSearchTerm(name);
    const animeEpisode = animeTerm.episodesList.find((a) => (a.episodeNum == episode));

    console.log(animeEpisode);

    fetch(`https://gogoanime.consumet.stream/vidcdn/watch/${animeEpisode.episodeId}`)
    .then((response) => response.json())
    .then((animelist) => console.log(animelist));
}


// fetch(`https://gogoanime.consumet.stream/search?keyw=${"jojo"}`)
// .then((response) => response.json())
// .then((animelist) => console.log(animelist));



async function getAnime(name, subcommand, episode = null) {
    switch (subcommand) {
        default: getUrl(name, episode);
    }
}

module.exports = getAnime;