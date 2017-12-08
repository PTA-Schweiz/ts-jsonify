import { IJsonMetaData, jsonMetadataKey, jsonIgnoreKey } from "./decorators";

export function getClazz(target: any, propertyKey: string): any {
    return Reflect.getMetadata("design:type", target, propertyKey)
}

export function getJsonProperty<T>(target: any, propertyKey: string): IJsonMetaData<T> {
    return Reflect.getMetadata(jsonMetadataKey, target, propertyKey);
}

export function getIgnore(target: any, propertyKey: string): boolean {
    return Reflect.getMetadata(jsonIgnoreKey, target, propertyKey);
}