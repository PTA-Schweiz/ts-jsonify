import { IConverter } from "./converter";

/**
 * Converter class to convert between Map an Objects for serialization and deserialization.
 */
export class MapConverter<T> implements IConverter<Map<string, T>> {

    /**
     * Converts a Map from an object with an entry for each key in the object.
     * @param obj
     */
    fromJson(obj: { [key: string]: [T] }): Map<string, T> {
        let strMap = new Map<string, T>();
        for (let k of Object.keys(obj)) {
            strMap.set(k, (<any>obj)[k]);
        }
        return strMap;
    }

    /**
     * Converts a string based map with objects of values T to an object where each map key is a property on the model.
     * @param map
     */
    toJson(map: Map<string, T>): { [key: string]: [T] } {
        let obj = Object.create(null);
        map.forEach((val, key) => { obj[key] = val });
        return obj;
    }
}