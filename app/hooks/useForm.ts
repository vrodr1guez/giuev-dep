import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';

interface UseFormOptions<T extends Record<string, any>> {
  schema: ZodSchema<T>;
  onSubmit: (data: T) => Promise<void>;
  initialValues?: Partial<T>;
}

interface FormState<T extends Record<string, any>> {
  values: Partial<T>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError: string | null;
}

interface FormActions<T extends Record<string, any>> {
  setValue: (name: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: keyof T, error: string) => void;
  clearErrors: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
  validate: () => boolean;
}

export function useForm<T extends Record<string, any>>({
  schema,
  onSubmit,
  initialValues = {}
}: UseFormOptions<T>): [FormState<T>, FormActions<T>] {
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    isSubmitting: false,
    isSubmitted: false,
    submitError: null,
  });

  const setValue = useCallback((name: keyof T, value: any) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [name]: value },
      errors: { ...prev.errors, [name as string]: '' }, // Clear field error on change
    }));
  }, []);

  const setValues = useCallback((values: Partial<T>) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, ...values },
    }));
  }, []);

  const setError = useCallback((name: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name as string]: error },
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      errors: {},
      submitError: null,
    }));
  }, []);

  const validate = useCallback((): boolean => {
    try {
      schema.parse(formState.values);
      clearErrors();
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach(issue => {
          const fieldName = issue.path.join('.');
          fieldErrors[fieldName] = issue.message;
        });
        setFormState(prev => ({
          ...prev,
          errors: fieldErrors,
          submitError: null,
        }));
      }
      return false;
    }
  }, [formState.values, schema, clearErrors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      submitError: null,
    }));

    try {
      const validatedData = schema.parse(formState.values);
      await onSubmit(validatedData);
      
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        isSubmitted: true,
        submitError: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        submitError: errorMessage,
      }));
    }
  }, [formState.values, schema, onSubmit, validate]);

  const reset = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      isSubmitting: false,
      isSubmitted: false,
      submitError: null,
    });
  }, [initialValues]);

  const formActions: FormActions<T> = {
    setValue,
    setValues,
    setError,
    clearErrors,
    handleSubmit,
    reset,
    validate,
  };

  return [formState, formActions];
}

// Form field component helpers
export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export function getFieldProps<T extends Record<string, any>>(
  name: keyof T,
  formState: FormState<T>,
  formActions: FormActions<T>
) {
  return {
    value: formState.values[name] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      formActions.setValue(name, e.target.value);
    },
    error: formState.errors[name as string],
    disabled: formState.isSubmitting,
  };
} 