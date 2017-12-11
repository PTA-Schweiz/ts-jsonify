# ts-jsonify

[![Build Status](https://travis-ci.org/PTA-Schweiz/ts-jsonify.svg?branch=master)](https://travis-ci.org/PTA-Schweiz/ts-jsonify)

A simple typescript/json Serializer and deserializer. It allows to configure the mapping through annotations.

## Installation

```
npm i --save ts-jsonify
```

## Usage

```typescript
class Address {
    @JsonProperty('first-name')
    firstName: string = ";

    @JsonProperty('last-name')/
    lastName: string = "";

    street: string = "";
}

class User {
    id: number = 0;
    email: string = "";

    // Non primitive types (will create instances of Address)
    @JsonProperty({ clazz: Adress });
    mainAddress: Address;

    // Use Converter for maps (Custom converters are possible as well
    @JsonProperty({ clazz: Map, converter: MapConverter })
    options: Map<string, any>() = new Map<string, Address>()

    // Ignore fields for serialization
    @JsonIgnore()
    clientSideOptions: any[] = [];

    // There must be an empty constructor
    constructor() {
        this.mainAddress = new Address();
    }
}

let user = new User();
user.email = 'example@test.com';
user.options.set('vip', true);
user.clientSideOptions.push("new-user");

// ...

// this object can be used for example to send within an angular service via http
let userDto = JSON.stringify( TsJsonify.serialize(user) );

this.http.post('/users', userDto).subscribe((response) => {
    // get a typed user object.
    let persistedUser = TsJsonify.deserialize<User>(response.json());
})

```

### Custom Converters

You can create your own converters for any property. It must implement the IConverter interface.

```typescript

export class Uppcase<string>() implements IConverter<string> {

    fromJson(val: string): string {
        return val;
    }

    toJson(val: string): string {
        return val.uppercase();
    }
}

class User {
    @JsonProperty({ converter: Uppcase })
    name = "hans"
}

let jsonObj = TsJsonify.serialize(new User());
console.log(jsonObj.name);
// "HANS"

```

## Known Issues

### Non initialized Properties
Due to the concept how TsJsonify works, it can only assign properties that are initialized
after instantiating the object.