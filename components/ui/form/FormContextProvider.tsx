"use client";

import React, { ReactNode } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";

interface FormContextProviderProps {
  methods: UseFormReturn<any>;
  children: ReactNode;
  onSubmit: (data: any) => void;
}

export function FormContextProvider({ methods, children, onSubmit }: FormContextProviderProps) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-lg mx-auto">
        {children}
      </form>
    </FormProvider>
  );
}