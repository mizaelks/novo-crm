
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Estado para armazenar o nosso valor
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // Obter do localStorage
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        // Se não existir, inicializar com o valor inicial
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      }
    } catch (error) {
      console.error(`Erro ao acessar localStorage para chave ${key}:`, error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  // Retornar uma versão encapsulada da função setter
  const setValue = (value: T) => {
    try {
      // Salvar o valor no localStorage
      window.localStorage.setItem(key, JSON.stringify(value));
      // Salvar o valor no estado
      setStoredValue(value);
    } catch (error) {
      console.error(`Erro ao salvar no localStorage para chave ${key}:`, error);
    }
  };

  return [storedValue, setValue];
}
