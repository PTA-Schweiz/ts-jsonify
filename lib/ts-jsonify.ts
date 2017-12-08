import { IJsonMetaData } from "./decorators";
import {getClazz, getIgnore, getJsonProperty} from './reflection';
import { IConverter } from "./converters/converter";

export class TsJsonify {

    static isPrimitive(obj: any) {
        switch (typeof obj) {
            case "string":
            case "number":
            case "boolean":
                return true;
        }
        return (obj instanceof String
                    || obj === String
                    ||  obj instanceof Number || obj === Number
                    || obj instanceof Boolean || obj === Boolean);
    }

    static isArray(obj: any) {
        if (obj === Array) {
            return true;
        } else if (typeof Array.isArray === "function") {
            return Array.isArray(obj);
        }
        else {
            return (obj instanceof Array);
        }
    }

    /**
     * Serializes the given object to its json representation.
     *
     * @param obj
     * @param converter
     * @returns {any}
     */
    static serialize(obj: any, converter?: IConverter<any>): any {
        if (converter) {
            return converter.toJson(obj);
        }

        if (TsJsonify.isArray(obj)) {
            return obj.map((o: any) => { return TsJsonify.serialize(o); });
        } else if (TsJsonify.isPrimitive(obj)) {
            return obj;
        } else {
            let jsonObj = {};

            // Traverse object properties and serialize its value depending on metadata
            Object.keys(obj).forEach((key) => {
                let propertyMetadata = getJsonProperty(obj, key);
                let ignoreProperty = getIgnore(obj, key);

                let jsonKey;

                if (propertyMetadata && propertyMetadata.name) {
                    jsonKey = propertyMetadata.name;
                } else {
                    jsonKey = key;
                }

                if (!ignoreProperty && obj[key] !== undefined) {
                    if (propertyMetadata && propertyMetadata.converter !== undefined) {
                        let converter = new propertyMetadata.converter();
                        (<any>jsonObj)[jsonKey] = TsJsonify.serialize(obj[key], converter);
                    } else {
                        (<any>jsonObj)[jsonKey] = TsJsonify.serialize(obj[key]);
                    }
                }
            });

            return jsonObj;
        }
    }

    /**
     * Creates an Instance of the given type from the jsonObject.
     *
     * @param clazz
     * @param jsonObject
     * @param converter
     * @returns {any}
     */
    static deserialize<T>(clazz:{new(): T}, jsonObject: any, converter?: IConverter<T>) {

        if ((clazz === undefined) || (jsonObject === undefined)) return undefined;
        if (converter) {
            return converter.fromJson(jsonObject);
        }
        let obj = new clazz();

        Object.keys(obj).forEach((key) => {

            /**
             * Convert the objects property
             * @param propertyMetadata
             */
            let propertyMetadataFn: (propertyMetadata: IJsonMetaData<any>) => any = (propertyMetadata) => {
                

                // the property name 
                let propertyName = propertyMetadata.name || key;

                // json data for the current property
                let innerJson = jsonObject ? jsonObject[propertyName] : undefined;

                let clazz = getClazz(obj, key);

                // We use the converter if we have one defined
                if (propertyMetadata.converter) {
                    let propertyConverter = new propertyMetadata.converter();
                    return TsJsonify.deserialize(clazz, innerJson, propertyConverter);
                }

                if (TsJsonify.isArray(clazz)) {
                    let metadata = <any>getJsonProperty(obj, key);
                    if (metadata.clazz || TsJsonify.isPrimitive(clazz)) {
                        if (innerJson && TsJsonify.isArray(innerJson)) {
                            return innerJson.map(
                                (item: any) => TsJsonify.deserialize(metadata.clazz, item)
                            );
                        } else {
                            return undefined;
                        }
                    } else {
                        return innerJson;
                    }

                } else if (!TsJsonify.isPrimitive(clazz)) {
                    // None primitive types will use deserialize
                    return TsJsonify.deserialize(clazz, innerJson);
                } else {
                    // Primitve types
                    return jsonObject ? jsonObject[propertyName] : undefined;
                }
            };

            // get the Metadata for the current property
            let propertyMetadata = getJsonProperty(obj, key);
            let ignoreProperty = getIgnore(obj, key);

            // If we have metadata defined, we deserialize with the property metadata
            if(!ignoreProperty) {
                if (propertyMetadata) {
                    (<any>obj)[key] = propertyMetadataFn(propertyMetadata);
                } else {
                    // if no metadata, just apply the object
                    if (jsonObject && jsonObject[key] !== undefined) {
                        (<any>obj)[key] = jsonObject[key];
                    }
                }
            }
        });
        return obj;
    }
}