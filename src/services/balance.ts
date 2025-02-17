export interface BalanceResponse {
  status: 'success' | 'error';
  balance?: number;
  error?: string;
}

export const checkBalance = async (apiKey: string): Promise<BalanceResponse> => {
  try {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    const response = await fetch('/api/anthropic/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the balance from the API response
    return {
      status: 'success',
      balance: data.balance
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    // Return error status with message
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to check balance'
    };
  }
};
