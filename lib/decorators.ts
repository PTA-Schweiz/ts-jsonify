import { IConverter } from "./converters/converter";

export const jsonMetadataKey = "jsonProperty";
export const jsonIgnoreKey = "jsonIgnore";

export interface IJsonMetaData<T> {
    name?: string,
    clazz?: { new(): T }
    converter?: { new(): IConverter<T> }
}

export function JsonProperty<T>(metadata?:IJsonMetaData<T>|string): any {
    if (metadata instanceof String || typeof metadata === "string"){
        return Reflect.metadata(jsonMetadataKey, {
            name: metadata,
            clazz: undefined
        });
    } else {
        let metadataObj = <IJsonMetaData<T>>metadata;
        return Reflect.metadata(jsonMetadataKey, {
            name: metadataObj ? metadataObj.name : undefined,
            clazz: metadataObj ? metadataObj.clazz : undefined,
            converter: metadataObj ? metadataObj.converter : undefined
        });
    }
}

export function JsonIgnore(): any {
    return Reflect.metadata(jsonIgnoreKey, true );
}