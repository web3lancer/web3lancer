import { useState } from 'react';

export function useFormHandling<T>(initialState: T) {
  const [formState, setFormState] = useState<T>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
  ) => {
    setFormState({
      ...formState,
      [field]: e.target.value
    });
  };

  const handleSubmit = async (submitFunction: (data: T) => Promise<any>, onSuccessCallback?: () => void) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await submitFunction(formState);
      setSuccess(true);
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (newState = initialState) => {
    setFormState(newState);
    setError(null);
    setSuccess(false);
  };

  return {
    formState,
    setFormState,
    loading,
    error,
    success,
    handleChange,
    handleSubmit,
    resetForm
  };
}
