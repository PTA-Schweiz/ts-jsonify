export interface IConverter<T> {
    fromJson(object: any): T;
    toJson(object: T): any;
}