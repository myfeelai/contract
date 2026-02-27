# @feelai/contract

An object-only type-safe contract definition library for sharing input/output schemas between client and server, preventing circular dependency issues.

## Features

- **Type Safety**: Uses `typebox` to define schemas.
- **Contract Definition**: Define API, Stream, and Socket contracts in a central place.
- **Static Type Inference**: Extract static TypeScript types from your runtime contract definitions.
- **Separation of Concerns**: Keep your API definitions separate from implementation details.

## Installation

```bash
bun add @feelai/contract
# or
npm install @feelai/contract
# or
yarn add @feelai/contract
```

## Usage

### 1. Define your Contract

Create a file (e.g., `todoListContract.ts`) to define your API structure. It is recommended to define core schemas separately to reuse them.
Every schemas are defined using `typebox`, must be object schema or undefined.

```typescript
import { Contract, defineApiMap, defineSocketMap, defineStreamMap } from "@feelai/contract";
import { Type } from "typebox";

// -------------------------------------------------------------------------
// 1. Define Schemas
// -------------------------------------------------------------------------

export const TaskSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  completed: Type.Boolean(),
  createdAt: Type.Number(),
});

// -------------------------------------------------------------------------
// 2. Define Maps
// -------------------------------------------------------------------------

// Define HTTP API Endpoints
const api = defineApiMap({
  getTasks: {
    output: Type.Array(TaskSchema),
  },
  createTask: {
    input: Type.Object({
      title: Type.String(),
    }),
    output: TaskSchema,
  },
});

// Define Stream Events
const stream = defineStreamMap({
  generateTask: {
    input: Type.Object({ content: Type.String() }),
    events: {
      chunk: Type.Partial(TaskSchema),
      error: Type.Object({ message: Type.String() }),
      end: Type.Object(TaskSchema),
    },
  },
});

// Define Socket Events
const socket = defineSocketMap({
  taskUpdates: {
    client: {
      subscribe: Type.Object({}),
    },
    server: {
      taskCreated: TaskSchema,
      taskUpdated: TaskSchema,
    },
  },
});

// -------------------------------------------------------------------------
// 3. Create and Export Contract
// -------------------------------------------------------------------------

export const todoListContract = new Contract().api(api).socket(socket);

// Export types for use in frontend and backend
export type TodoListContract = typeof todoListContract;
```

### 2. Infer Types

You can infer the static types for use in your application code using the helper types provided (`StaticApiMap`, `StaticSocketMap`, etc.).

```typescript
import { StaticApiMap, StaticSocketMap } from "@feelai/contract";
import { todoListContract, TaskSchema } from "./todoListContract";
import { Static } from "typebox";

// Type for API implementation or usage
export type ApiTypes = StaticApiMap<typeof todoListContract>;

// Type for Socket implementation or usage
export type SocketTypes = StaticSocketMap<typeof todoListContract>;

// Re-export static types from schemas
export type Task = Static<typeof TaskSchema>;
```

### 3. Socket Client Usage

The package also includes a `Socket` client wrapper.

```typescript
import { Socket } from "@feelai/contract";

// ... usage example needed
```

## API Reference

### `defineApiMap(map)`

Helper to define HTTP API endpoints validation schemas. Inputs and outputs can be any valid TypeBox schema (Object, Array, etc.).

### `defineStreamMap(map)`

Helper to define Stream events validation schemas.

### `defineSocketMap(map)`

Helper to define WebSocket events (client-to-server and server-to-client) validation schemas.

### `Contract` class

The main builder class to compose your definition.

- `.api(apiMap)`
- `.stream(streamMap)`
- `.socket(socketMap)`
