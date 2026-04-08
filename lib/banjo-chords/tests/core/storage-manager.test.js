const StorageManager = require('../../src/core/storage-manager');

// Mock localStorage for Node environment
const mockStorage = {};
const localStorageMock = {
  getItem: jest.fn(key => mockStorage[key] ?? null),
  setItem: jest.fn((key, value) => { mockStorage[key] = value; }),
  removeItem: jest.fn(key => { delete mockStorage[key]; }),
  clear: jest.fn(() => { for (const k in mockStorage) delete mockStorage[k]; }),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('StorageManager', () => {
  let storage;

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    storage = new StorageManager('test-');
  });

  test('save and load a string', () => {
    storage.save('key', 'hello');
    expect(storage.load('key', null)).toBe('hello');
  });

  test('save and load an object', () => {
    const data = { root: 'G', quality: 'major' };
    storage.save('chord', data);
    expect(storage.load('chord', null)).toEqual(data);
  });

  test('save and load an array', () => {
    const arr = [1, 2, 3];
    storage.save('list', arr);
    expect(storage.load('list', [])).toEqual(arr);
  });

  test('load returns default for missing key', () => {
    expect(storage.load('missing', 'default')).toBe('default');
  });

  test('uses prefix for storage keys', () => {
    storage.save('foo', 'bar');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-foo', '"bar"');
  });

  test('load returns default for corrupted JSON', () => {
    mockStorage['test-bad'] = '{invalid json';
    expect(storage.load('bad', 'fallback')).toBe('fallback');
  });

  test('save handles quota exceeded gracefully', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });
    // Should not throw
    expect(() => storage.save('key', 'value')).not.toThrow();
  });
});
