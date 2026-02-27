import { Type } from "typebox";
import {
  Contract,
  defineApiMap,
  defineSocketMap,
  defineStreamMap,
  type StaticApiMap,
  type StaticSocketMap,
  type StaticStreamMap,
} from "../src";

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

// API
const apiMap = defineApiMap({
  getTasks: {
    output: Type.Object({
      tasks: Type.Array(TaskSchema),
    }),
  },
  createTask: {
    input: Type.Object({
      title: Type.String(),
    }),
    output: TaskSchema,
  },
  updateTask: {
    input: Type.Partial(TaskSchema),
    output: TaskSchema,
  },
  deleteTask: {
    input: Type.Object({
      id: Type.String(),
    }),
  },
});

// Socket
const socketMap = defineSocketMap({
  taskUpdates: {
    client: {
      subscribe: Type.Object({}),
    },
    server: {
      taskCreated: TaskSchema,
      taskUpdated: TaskSchema,
      taskDeleted: Type.Object({ id: Type.String() }),
    },
  },
});

// Stream
const streamMap = defineStreamMap({
  exportTasks: {
    input: Type.Object({
      format: Type.Union([Type.Literal("csv"), Type.Literal("json")]),
    }),
    events: {
      chunk: Type.Object({ data: Type.String() }),
      error: Type.Object({ message: Type.String() }),
      end: Type.Object({ url: Type.String() }),
    },
  },
});

// -------------------------------------------------------------------------
// 3. Create Contract
// -------------------------------------------------------------------------

export const todoListContract = new Contract().api(apiMap).socket(socketMap).stream(streamMap);

// -------------------------------------------------------------------------
// 4. Export Types
// -------------------------------------------------------------------------

export type TodoListContract = typeof todoListContract;

export type TodoListApi = StaticApiMap<TodoListContract>;
export type TodoListSocket = StaticSocketMap<TodoListContract>;
export type TodoListStream = StaticStreamMap<TodoListContract>;
