<!-- Logo -->
<p align="center">
  <img width="50%" src="https://raw.githubusercontent.com/TimUnderhay/ts-reflection/main/res/ts-reflection.jpg"/>
</p>

<h1 align="center">
  ts-reflection
</h1>

<p align="center">
  Type inspection utilities for TypeScript
</p>

<p align="center">
  <code>ts-reflection</code> allows you to access information about your types in runtime - e.g. get properties of a type or possible values of a union. It is compatible with <a href="./docs/INSTALLATION.md#installation--rollup">rollup</a>, <a href="./docs/INSTALLATION.md#installation--webpack">webpack</a>, and <a href="./docs/INSTALLATION.md#installation--ttypescript">ttypescript</a> projects and works nicely with <a href="./docs/INSTALLATION.md#installation--jest">jest</a> or <a href="./docs/INSTALLATION.md#installation--ts-node">ts-node</a>
</p>

<p align="center">
  <a href="#motivation">Motivation</a>
  <span>|</span>
  <a href="https://github.com/TimUnderhay/ts-reflection/blob/main/docs/API.md">API</a>
  <span>|</span>
  <a href="https://github.com/TimUnderhay/ts-reflection/blob/main/docs/INSTALLATION.md">Installation</a>
  <span>|</span>
  <a href="#acknowledgement">Acknowledgement</a>
</p>

## Tim's Version
* Supports ESM 'import'.
* Supports TypeScript versions >= 4.0.2.
* Support for Typescript 3.x has been dropped.
* Unit tests have been fixed for recent ES prototype updates.
* Unit tests no longer use ts-jest, which breaks line numbering in output.

## Wait what?

As they say *an example is worth a thousand API docs* so why not start with one.

```typescript
import { propertiesOf } from 'ts-reflection';

interface MyInterface {
  name: string;
  hobbies: string[];
}

// You can now use propertiesOf utility to get properties of a type
const properties = propertiesOf<MyInterface>(); // ['name', 'hobbies']
```

Let's do another one!

```typescript
import { valuesOf } from 'ts-reflection';

type ButtonType = 'primary' | 'secondary' | 'link';

// You can use valuesOf utility to get all the possible union type values
const buttonTypes = valuesOf<ButtonType>(); // ['primary', 'secondary', 'link']
```

<a id="motivation"></a>
## Motivation

I can't count the number of times I needed to type all the possible values of a union type to create e.g. a dropdown with all the button types:

```typescript
type ButtonType = 'primary' | 'secondary' | 'link';

const buttonTypes: ButtonType[] = ['primary', 'secondary', 'link'];
```

I was always aware of fragility of such solution and the fact you need to update it by hand every time `ButtonType` changes. Now I can write just

```typescript
const buttonTypes: ButtonType[] = valuesOf<ButtonType>;
```

The same goes for a list of type properties - typing those lists of `keyof` type values:

```typescript
interface MyInterface {
  property: number;
  anotherProperty: string;
}

type Key = keyof MyInterface;
const keys: Key[] = ['property', 'anotherProperty']
```

Which now becomes

```typescript
const keys: Key[] = propertiesOf<MyInterface>();
```

## API

_You can find comprehensive API documentation in the [API docs](https://github.com/timunderhay/ts-reflection/blob/main/docs/API.md)._

`ts-reflection` exports two functions: `valuesOf` (for accessing values of union types) and `propertiesOf` (for accessing properties of types).

### `valuesOf`

`valuesOf` is a function that returns all the possible literal values of union types:

```typescript
import { valuesOf } from 'ts-reflection';

type UnionType = 'string value' | 1 | true | Symbol.toStringTag;

// You can use valuesOf utility to get all the possible union type values
const unionTypeValues = valuesOf<UnionType>(); // ['string value', 1, true, Symbol.toStringTag]
```

Please read the full [API docs](https://github.com/timunderhay/ts-reflection/blob/main/docs/API_REFLECTION.md#valuesOf) for more information about `valuesOf`.

### `propertiesOf`

`propertiesOf` is a function that returns property names of types: 

```typescript
import { propertiesOf } from 'ts-reflection';

interface MyInterface {
  name: string;
  displayName?: string;
  readonly hobbies: string[];
}

// When called with no arguments, propertiesOf() returns all public properties of a type
const properties = propertiesOf<MyInterface>(); // ['name', 'displayName', 'hobbies']

// You can also call it with "queries" to be more specific about what properties you want to get
const readonlyProperties = propertiesOf<MyInterface>({ readonly: true }); // ['hobbies']
const mutableProperties = propertiesOf<MyInterface>({ readonly: false }); // ['name', 'displayName']
const optionalProperties = propertiesOf<MyInterface>({ optional: true }); // ['displayName']
const requiredProperties = propertiesOf<MyInterface>({ optional: false }); // ['name', 'hobbies']
```

Please read the full [API docs](https://github.com/timunderhay/ts-reflection/blob/main/docs/API_REFLECTION.md#propertiesOf) for more information about `propertiesOf` and the queries it supports.

## Installation

You can find comprehensive installation instructions in the [installation docs](https://github.com/timunderhay/ts-reflection/blob/main/docs/INSTALLATION.md).

<a id="acknowledgement"></a>
## Acknowledgement

This idea was inspired by [`ts-transformer-keys`](https://www.npmjs.com/package/ts-transformer-keys) NPM module. The E2E testing infrastructure that ensures compatibility with all minor TypeScript versions is based on my [`ts-type-checked`](https://www.npmjs.com/package/ts-type-checked) project.