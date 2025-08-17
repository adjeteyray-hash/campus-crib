import { renderHook, act } from '@testing-library/react-native';
import { useLoadingState } from '../useLoadingState';

describe('useLoadingState', () => {
  it('initializes with empty loading states', () => {
    const { result } = renderHook(() => useLoadingState());

    expect(result.current.loadingStates).toEqual({});
    expect(result.current.isAnyLoading()).toBe(false);
  });

  it('initializes with provided initial state', () => {
    const initialState = { fetch: true, save: false };
    const { result } = renderHook(() => useLoadingState(initialState));

    expect(result.current.loadingStates).toEqual(initialState);
    expect(result.current.isLoading('fetch')).toBe(true);
    expect(result.current.isLoading('save')).toBe(false);
  });

  it('sets loading state correctly', () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.setLoading('fetch', true);
    });

    expect(result.current.isLoading('fetch')).toBe(true);
    expect(result.current.isAnyLoading()).toBe(true);

    act(() => {
      result.current.setLoading('fetch', false);
    });

    expect(result.current.isLoading('fetch')).toBe(false);
    expect(result.current.isAnyLoading()).toBe(false);
  });

  it('handles multiple loading states', () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.setLoading('fetch', true);
      result.current.setLoading('save', true);
    });

    expect(result.current.isLoading('fetch')).toBe(true);
    expect(result.current.isLoading('save')).toBe(true);
    expect(result.current.isAnyLoading()).toBe(true);

    act(() => {
      result.current.setLoading('fetch', false);
    });

    expect(result.current.isLoading('fetch')).toBe(false);
    expect(result.current.isLoading('save')).toBe(true);
    expect(result.current.isAnyLoading()).toBe(true);
  });

  it('returns false for unknown loading keys', () => {
    const { result } = renderHook(() => useLoadingState());

    expect(result.current.isLoading('unknown')).toBe(false);
  });

  it('executes operation with loading state', async () => {
    const { result } = renderHook(() => useLoadingState());
    const operation = jest.fn().mockResolvedValue('success');

    expect(result.current.isLoading('test')).toBe(false);

    const resultValue = await act(async () => {
      return result.current.withLoading('test', operation);
    });

    // After execution, loading should be false
    expect(result.current.isLoading('test')).toBe(false);
    expect(resultValue).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('handles operation failure correctly', async () => {
    const { result } = renderHook(() => useLoadingState());
    const error = new Error('Operation failed');
    const operation = jest.fn().mockRejectedValue(error);

    await expect(
      act(async () => {
        await result.current.withLoading('test', operation);
      })
    ).rejects.toBe(error);

    // Loading should be false even after error
    expect(result.current.isLoading('test')).toBe(false);
  });

  it('resets all loading states', () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.setLoading('fetch', true);
      result.current.setLoading('save', true);
    });

    expect(result.current.isAnyLoading()).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.loadingStates).toEqual({});
    expect(result.current.isAnyLoading()).toBe(false);
  });
});