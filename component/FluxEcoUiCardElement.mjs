//todo
/**
 * @typedef {object} FluxEcoSubscription
 * @property {function} onchange
 * @property {array} attributeFilter - value: an attributeName or a function(changedAttributeNames, currentState)
 * @property {function} isChangeRelevant
 */



export class FluxEcoUiCardElement extends HTMLElement {
    #stateProcessor;
    /**
     * @type {ShadowRoot}
     */
    #shadow;
    #structureElements;
    /**
     * @typedef {object} FluxEcoUiCardElementState
     * @property {string} coverImageUrl
     * @property {string} title
     * @property {string} description
     *
     * @type {FluxEcoUiCardElementState}
     */
    #state;
    #subscribers = {}


    /**
     * @param styleElement
     * @param {{function} isValid(state), } stateProcessor
     * @param {FluxEcoUiCardElementState} state
     */
    constructor(
        styleElement,
        stateProcessor,
        state
    ) {
        super();
        this.#stateProcessor = stateProcessor;
        this.#state = {
            coverImageUrl: "",
            title: "",
            description: "",
        }
        this.#structureElements = this.#createStructureElements();

        this.#shadow = this.attachShadow({mode: 'closed'});
        this.#shadow.appendChild(styleElement);
        this.#shadow.appendChild(this.#createStructure(this.#structureElements))


        this.changeState(state)
    }

    /**
     * @param {HTMLElement} styleElement
     * @param stateProcessor
     * @param {FluxEcoUiCardElementState} state
     */
    static async new(
        styleElement,
        stateProcessor,
        state
    ) {
        return new this(
            styleElement,
            stateProcessor,
            state
        )
    }

    static get tagName() {
        return 'flux-eco-ui-card-element'
    }

    connectedCallback() {

    }

    #createStructureElements() {
        const structureElements = {};
        //todo could be a definition
        structureElements.container = this.#createElement("div", "container");
        structureElements.cover = this.#createElement("div", "cover");
        structureElements.content = this.#createElement("div", "content");
        structureElements.meta = this.#createElement("div", "meta");
        structureElements.detail = this.#createElement("div", "detail");
        structureElements.title = this.#createElement("h1", "title");
        structureElements.description = this.#createElement("p", "description");
        structureElements.additionalHtmlContent = this.#createElement("div", "additionalHtmlContent");
        return structureElements;
    }

    #createStructure({container, cover, content, meta, detail, title, description, additionalHtmlContent}) {
        container.appendChild(cover)
        container.appendChild(content)
        content.appendChild(meta);
        meta.appendChild(detail);
        detail.appendChild(title);
        detail.appendChild(description);
        meta.appendChild(additionalHtmlContent);
        return container;
    }

    #createElement(tagName, name) {
        const element = document.createElement(tagName);
        element.className = name;
        return element;
    }

    #applyAttributeStateChanged(attributeName, attributeValue) {
        const applyChanged = {};
        applyChanged.coverImageUrl = (attributeValue) => {
            const img = document.createElement("img");
            img.src = attributeValue;
            this.#structureElements.cover.innerHTML = null;
            this.#structureElements.cover.appendChild(img);
        }
        applyChanged.title = (attributeValue) => {
            this.#structureElements.title.innerText = attributeValue;
        }
        applyChanged.description = (attributeValue) => {
            this.#structureElements.description.innerText = attributeValue;
        }
        applyChanged[attributeName](attributeValue);
    }


    #applyAndPublishStateChanged(state) {
        const changedAttributeNames = [];
        Object.entries(state).forEach(([attributeName, attributeValue]) => {
            if (this.#stateProcessor.attributeValueIsEqual(this.#state, attributeName, attributeValue) === false) {
                this.#applyAttributeStateChanged(attributeName, attributeValue);
                changedAttributeNames.push(...attributeName)
            }
        });
        this.#state = state;
        this.publishStateChanged(changedAttributeNames, state);
    }


    changeState(stateSubset) {
        const newState = structuredClone(this.#state);
        Object.entries(newState).forEach(([attributeName, attributeState]) => {
            if(stateSubset.hasOwnProperty(attributeName)) {
                newState[attributeName] = stateSubset[attributeName];
            }
        });
        if (this.#stateProcessor.isValid(newState) === false) {
            throw new Error(["invalid state", newState].join(" "))
        }
        if (this.#stateProcessor.isEqual(this.#state, newState) === false) {
            this.#applyAndPublishStateChanged(newState)
        }
    }


    /**
     * @param {string} subscriberId
     * @param {FluxEcoSubscription} subscription
     */
    subscribeToStateChanged(subscriberId,subscription) {
        this.#subscribers[subscriberId] = subscription;
    }

    /**
     * @param {string} subscriberId
     */
    unSubscribeFromStateChanged(subscriberId) {
        if(this.#subscribers.hasOwnProperty(subscriberId)) {
            delete this.#subscribers[subscriberId];
        }
    }

    publishStateChanged(changedAttributeNames, state) {
        Object.entries(this.#subscribers).forEach(([subscriberId, subscription]) => {
            //todo
            //subscription.isChangeRelevant(changedAttributeNames, state)
            subscription.onchange(state)
        });
    }
}

customElements.define(FluxEcoUiCardElement.tagName, FluxEcoUiCardElement);