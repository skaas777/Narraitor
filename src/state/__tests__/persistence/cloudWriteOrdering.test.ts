const mockWriteCloudRecord = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();
jest.mock('@/lib/cloud/schema', () => ({
  ...jest.requireActual('@/lib/cloud/schema'), PERSONAL_CLOUD_ENABLED: true,
}));
jest.mock('@/lib/cloud/client', () => ({
  readCloudRecord: jest.fn(),
  writeCloudRecord: (...args: unknown[]) => mockWriteCloudRecord(...args),
}));
jest.mock('@/lib/storage/resilientStorage', () => ({
  ResilientStorageMiddleware: jest.fn().mockImplementation(() => ({
    setItem: mockSetItem, removeItem: mockRemoveItem,
  })),
}));
import { createIndexedDBStorage, _resetStorageStatusForTesting } from '../../persistence';

beforeEach(() => {
  jest.clearAllMocks();
  _resetStorageStatusForTesting();
});

test('publishes a new world before a slow disk write so immediate cloud flush sees it', async () => {
  let finishDisk!: () => void;
  mockSetItem.mockReturnValueOnce(new Promise<void>((resolve) => { finishDisk = resolve; }));
  const value = { state: { worlds: { 'new-world': { name: '新冒险' } } }, version: 1 };
  const pending = createIndexedDBStorage().setItem('narraitor-world-store', value);
  expect(mockWriteCloudRecord).toHaveBeenCalledWith('narraitor-world-store', JSON.stringify(value));
  await Promise.resolve();
  finishDisk();
  await pending;
});

test('publishes removals before a slow disk transaction', async () => {
  let finishDisk!: () => void;
  mockRemoveItem.mockReturnValueOnce(new Promise<void>((resolve) => { finishDisk = resolve; }));
  const pending = createIndexedDBStorage().removeItem!('narraitor-world-store');
  expect(mockWriteCloudRecord).toHaveBeenCalledWith('narraitor-world-store', null);
  await Promise.resolve();
  finishDisk();
  await pending;
});
