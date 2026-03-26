// components/formkit/FormContextProvider.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Validator } from "./validation";

interface FieldConfig {
  validators?: Validator[];
}

interface FormContextType {
  values: Record<string, any>;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  registerField: (name: string, config?: FieldConfig) => void;
  updateValue: (name: string, value: any) => void;
  validateField: (name: string) => void;
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormContextProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validators, setValidators] = useState<Record<string, Validator[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerField = (name: string, config?: FieldConfig) => {
    if (config?.validators) {
      setValidators((prev) => ({ ...prev, [name]: config.validators! }));
    }
  };

  const updateValue = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateField = (name: string) => {
    const rules = validators[name];
    if (!rules) return;

    for (const rule of rules) {
      const error = rule(values[name]);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
        return;
      }
    }

    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  return (
    <FormContext.Provider
      value={{
        values,
        errors,
        touched,
        registerField,
        updateValue,
        validateField,
        isSubmitting,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useFormContext must be used inside FormContextProvider");
  return ctx;
}
