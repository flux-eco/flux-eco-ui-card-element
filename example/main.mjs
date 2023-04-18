import {FluxEcoUiCardElement} from "/components/flux-eco-ui-card-element/FluxEcoUiCardElement.mjs";
import {FluxEcoObjectProcessor} from "/components/flux-eco/FluxEcoObjectProcessor.mjs"; //todo


const cssFile = await (await fetch("/components/flux-eco-ui-card-element/style.css")).text();

const styleElement = document.createElement("style");
styleElement.textContent = cssFile

const stateProcessor = FluxEcoObjectProcessor.new({});

const cardElement = await FluxEcoUiCardElement.new(
    styleElement,
    stateProcessor,
    {
        coverImageUrl: "https://www.medi.ch/mtr/_processed_/2/d/csm_mtr_weiterbildung_35812ba1c1.jpg",
        description: "ddd",
        title: "ddd"
    }
);
document.body.appendChild(cardElement);


cardElement.subscribeToStateChanged("test", {
    onchange: (change) => {
        console.log("pong")
        console.log(change);
    }
})

setTimeout(() => {
    console.log("setImage");
    cardElement.changeState({
        coverImageUrl: "https://img.youtube.com/vi/JuI222XOgYU/maxresdefault.jpg"
    })
}, 10000);
