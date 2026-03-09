"use client";

import React, { ReactNode } from "react";
import {
  FormProvider,
  UseFormReturn,
  FieldErrors,
} from "react-hook-form";
import clsx from "clsx";

interface FormContextProviderProps<T> {
  methods: UseFormReturn<T>;
  children: ReactNode;
  onSubmit: (data: T) => void;
  onError?: (errors: FieldErrors<T>) => void;
  className?: string;
  formProps?: Omit<
    React.FormHTMLAttributes<HTMLFormElement>,
    "onSubmit" | "className"
  >;
}

export function FormContextProvider<T>({
  methods,
  children,
  onSubmit,
  onError,
  className,
  formProps,
}: FormContextProviderProps<T>) {
  return (
    <FormProvider {...methods}>
      <form
        noValidate
        onSubmit={methods.handleSubmit(onSubmit, onError)}
        className={clsx(
          "flex flex-col gap-4 w-full max-w-lg mx-auto",
          className
        )}
        {...formProps}
      >
        {children}
      </form>
    </FormProvider>
  );
}