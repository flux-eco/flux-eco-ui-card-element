//todo
/**
 * @typedef {object} FluxEcoSubscription
 * @property {function} onchange
 * @property {array} attributeFilter - value: an attributeName or a function(changedAttributeNames, currentState)
 * @property {function} isTransitionRelevant
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
     * @property {boolean} [clicked=false]
     *
     * @type {FluxEcoUiCardElementState}
     */
    #state;
    #subscribers = {}


    /**
     * @param styleElement
     * @param {{function} stateIsValid(state), transitionIsValid(attributeName, currentAttributeState)} stateProcessor
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
            clicked: false
        }

        this.addEventListener('click', e => {
            this.transistStateAttributes({"clicked": true});
        });

        this.#structureElements = this.#createStructureElements();

        this.#shadow = this.attachShadow({mode: 'closed'});
        this.#shadow.appendChild(styleElement);
        this.#shadow.appendChild(this.#createStructure(this.#structureElements))


        this.transistStateAttributes(state)
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


    async #publishStateTransitionAndApplyTargetState(targetState) {

        const transitionRelevantAttributeNames = [];
        Object.entries(targetState).forEach(([attributeName, attributeValue]) => {
            if (this.#stateProcessor.attributeValueIsEqual(this.#state, attributeName, attributeValue) === false) {
                transitionRelevantAttributeNames.push(...attributeName)
            }
        });

        //@see https://github.com/fluxapps/fluxtasks/issues/58#issuecomment-1513669350
        await this.publishStateTransition(transitionRelevantAttributeNames, targetState);

        if(this.#stateProcessor.stateIsValid(targetState)) {
            transitionRelevantAttributeNames.forEach((attributeName) => {
                this.#applyAttributeStateChanged(attributeName, targetState[attributeName]);
            });
            this.#state = targetState;
        }
    }


    transistStateAttributes(targetStateAttributeValues) {
        const targetState = structuredClone(this.#state);
        Object.entries(targetState).forEach(([attributeName, currentAttributeState]) => {
            if (targetStateAttributeValues.hasOwnProperty(attributeName)) {
                this.#stateProcessor.isTransitionValid(attributeName, currentAttributeState)
                {
                    targetState[attributeName] = targetStateAttributeValues[attributeName];
                }
            }
        });
        if (this.#stateProcessor.isEqual(this.#state, targetState) === false) {
            this.#publishStateTransitionAndApplyTargetState(targetState)
        }
    }


    /**
     * @param {string} subscriberId
     * @param {FluxEcoSubscription} subscription
     */
    subscribeToStateTransition(subscriberId, subscription) {
        this.#subscribers[subscriberId] = subscription;
    }

    /**
     * @param {string} subscriberId
     */
    unSubscribeFromStateTransition(subscriberId) {
        if (this.#subscribers.hasOwnProperty(subscriberId)) {
            delete this.#subscribers[subscriberId];
        }
    }

    publishStateTransition(changedAttributeNames, state) {
        Object.entries(this.#subscribers).forEach(([subscriberId, subscription]) => {
            //todo
            //subscription.isChangeRelevant(changedAttributeNames, state)
            subscription.onchange(state)
        });
    }
}

customElements.define(FluxEcoUiCardElement.tagName, FluxEcoUiCardElement);