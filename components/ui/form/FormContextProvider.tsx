"use client";

import React, { ReactNode } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import clsx from "clsx";

interface FormContextProviderProps {
  methods: UseFormReturn<any>;
  children: ReactNode;
  onSubmit: (data: any) => void;
  onError?: (errors: any) => void;
  className?: string;
  formProps?: React.FormHTMLAttributes<HTMLFormElement>;
}

export function FormContextProvider({
  methods,
  children,
  onSubmit,
  onError,
  className,
  formProps,
}: FormContextProviderProps) {
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
