export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiErrorBody = {
  success?: boolean;
  message?: string;
  code?: string;
  errors?: ApiFieldError[];
};
