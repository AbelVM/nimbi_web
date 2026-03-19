import Clouds from "./clouds.js";

const initClouds = () => {
    const clouds = new Clouds('#viewport');
    clouds.init()
}

const initCMS = () => {
    window.__nimbi_debug_crawl = false
    window.__nimbiCMSDebug = false
    nimbiCMS.initCMS({
        el: '#app',
        contentPath: './content',
        homePage: 'home.html',
        notFoundPage: '404.md',
        navigationPage: 'navigation.md',
        indexDepth: 3,
        defaultStyle: 'system',
        bulmaCustomize: '',
        highlightTheme: 'monokai',
        useCdn: true
    });
    nimbiCMS.onPageLoad(initClouds)
}

document.addEventListener('DOMContentLoaded', initCMS);

