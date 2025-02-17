'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { addApiKey } from "@/services/api-keys";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FormState {
  name: string;
  description: string;
  provider: string;
  apiKey: string;
}

const initialFormState: FormState = {
  name: '',
  description: '',
  provider: '',
  apiKey: ''
};

export default function AddKey() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Early return for loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Early return for unauthenticated users
  if (!user) {
    router.push('/');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (isSubmitting) return;

    // Validate all fields
    const trimmedData = Object.entries(formData).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value.trim()
    }), {} as FormState);

    if (Object.values(trimmedData).some(value => !value)) {
      setError('All fields are required');
      return;
    }

    setIsSubmitting(true);

    try {
      await addApiKey(
        user.uid,
        trimmedData.name,
        trimmedData.description,
        trimmedData.provider,
        trimmedData.apiKey
      );
      router.push('/dashboard');
    } catch (error) {
      console.error('Error adding API key:', error);
      setError('Failed to add API key. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Add New API Key</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Add API key form">
          {error && (
            <div 
              className="bg-red-50 text-red-500 p-3 rounded-md mb-4" 
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}
          
          {Object.entries({
            name: 'Name',
            provider: 'Provider',
            description: 'Description',
            apiKey: 'API Key'
          }).map(([id, label]) => (
            <div key={id}>
              <label 
                htmlFor={id} 
                className="block text-sm font-medium mb-1"
              >
                {label}
              </label>
              <Input
                id={id}
                type={id === 'apiKey' ? 'password' : 'text'}
                value={formData[id as keyof FormState]}
                onChange={handleInputChange}
                placeholder={
                  id === 'name' ? 'e.g., Production API Key' :
                  id === 'provider' ? 'e.g., OpenAI, AWS, Google Cloud' :
                  id === 'description' ? 'What is this API key used for?' :
                  'Enter your API key'
                }
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
              />
            </div>
          ))}

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              aria-label="Cancel and return to dashboard"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add API Key'}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
