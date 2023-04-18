/**
 * @class FluxEcoObjectProcessor
 */
export class FluxEcoObjectProcessor {

    #schema

    /**
     * @private
     */
    constructor(schema) {
        this.#schema = schema;
    }

    static new(schema) {
        return new this(schema)
    }

    isValid(object) {
        //todo
        return true;
    }

    /**
     * @param {object} origin
     * @param {object} other
     * @return {boolean}
     */
    isEqual(origin, other) {
        const originKeys = Object.keys(origin);
        const otherKeys = Object.keys(other);

        if (originKeys.length !== otherKeys.length) {
            return false;
        }

        for (let key of originKeys) {
            if (this[key] !== other[key]) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param {object} origin
     * @param {string} attributeName
     * @param otherValue
     * @return {boolean}
     */
    attributeValueIsEqual(origin, attributeName, otherValue) {
        return (origin[attributeName] === otherValue)
    }
}