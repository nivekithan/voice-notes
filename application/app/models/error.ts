export type ModelErrorType = "INVALID_ID";

export class ModelError extends Error {
  type: ModelErrorType;
  constructor({ message, type }: { message: string; type: ModelErrorType }) {
    super(message);
    this.type = type;
  }
}
