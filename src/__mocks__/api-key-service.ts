export const ApiKeyService = {
  listApiKeys: jest.fn(),
  createApiKey: jest.fn(),
  deleteApiKey: jest.fn(),
  getInstance: jest.fn(() => ({
    listApiKeys: jest.fn(),
    createApiKey: jest.fn(),
    deleteApiKey: jest.fn(),
  })),
};
