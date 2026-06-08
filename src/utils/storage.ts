import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  getItem: async <T>(key: string, defaultValue: T): Promise<T> => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value) as T;
      }
      return defaultValue;
    } catch (error) {
      return defaultValue;
    }
  },
  setItem: async <T>(key: string, value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving data', error);
    }
  }
};

