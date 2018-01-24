import { TsJsonify } from "../lib/index"
import { JsonProperty, JsonIgnore } from "../lib/decorators";
import { MapConverter } from "../lib/converters/map-converter";


class Address {
    firstName: string;
    lastName: string;

    @JsonProperty("streetName")
    street: string;

    constructor() {
        this.firstName = "Hans";
        this.lastName = "Muster";
        this.street = "Eine Allee";
    }
}

class Subject {

    propertyOne: number = 12;

    constructorCalled: boolean;

    arrayOfObjects: Subject[] = [];
    emptyObject: any;

    @JsonProperty({name: 'address', clazz: Address})
    nestedObject: Address | undefined = undefined;

    @JsonProperty('other-key')
    propertyWithCustomKey = "my test";

    @JsonProperty({clazz: Map, converter: MapConverter})
    myMap = new Map<string, string>([['1', "Hello"], ['2', "World"]]);


    @JsonProperty('Renamed')
    namedStringProperty= "";

    propertyUndefinedVal: String = undefined;

    @JsonIgnore()
    ignoredProperty = "Allways ignored";

    constructor() {
        this.constructorCalled = true;
        this.nestedObject = new Address();
    }
}

describe('Serialize', () => {

    let subject = new Subject();
    let serialized = TsJsonify.serialize(subject);

    it('should set propper keys', () => {
        expect(serialized['other-key']).toEqual('my test');
    });

    it('should use the converter defined in the jsonProperty attribute', () => {
       expect(serialized["myMap"]["1"]).toEqual("Hello");
    });

    it('should serialize nested objects with respecting property metadata', () => {
       expect(serialized["address"]["streetName"]).toEqual("Eine Allee");
    });

    it('should respect ignore property', () =>  {
       expect(serialized["ignoredProperty"]).toBeUndefined();
    });

    it('should ignore undefined properties', () => {
        expect(serialized["propertyUndefinedVal"]).toBeUndefined();
    });

});

describe('Deserialize', () => {
    let exampleJson = {
        "other-key": "some value",
        "address": {
            firstName: 'Stefan',
            lastName: "Staub",
            streetName: 'Somewhere 001'
        },
        myMap: {
            'my-key': 'someValue'
        },
        propertyUndefinedVal: "something",
        Renamed: "new string",
        ignoredProperty: 'This should be ignored',
        emptyObject: "Interesting stuff"
    };

    let subject = TsJsonify.deserialize(Subject, exampleJson);

    it('should have called the constructor', () => {
       expect(subject.constructorCalled).toBeTruthy();
    });

    it('Should have renamed the property with simple type', () => {
        expect(subject.namedStringProperty).toEqual("new string");
    });

    it('should have deserialized the map', () => {
       expect(subject.myMap.get('my-key')).toEqual('someValue');
    });

    it('should keep default values', () => {
        expect(subject.propertyOne).toEqual(12);
    });

    it('should use clazz from Metadata to do conversion', () => {
       expect(typeof(subject.nestedObject)).toEqual('Adress');
    });

    it('should correctly instantialte nested objects', () => {
        expect(subject.nestedObject.street).toEqual('Somewhere 001');
    });

    it('should ignore values for ignored properties', () => {
        expect(subject.ignoredProperty).not.toEqual(exampleJson.ignoredProperty);
    });

    it('should not ignore undefined values when serializing', () => {
        expect(subject.propertyUndefinedVal).toEqual(exampleJson.propertyUndefinedVal);
    });

    it('should set empty object', () => {
        expect(subject.emptyObject).toEqual("Interesting stuff");
    });
});