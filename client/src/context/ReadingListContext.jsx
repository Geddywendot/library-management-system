import { createContext, useContext, useEffect, useReducer } from 'react';

const STORAGE_KEY = 'readingList';
const ReadingListContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_BOOK':
      return state.some((b) => b.id === action.payload.id) ? state : [...state, action.payload];
    case 'REMOVE_BOOK':
      return state.filter((b) => b.id !== action.payload);
    case 'CLEAR_LIST':
      return [];
    default:
      return state;
  }
}

function loadInitial() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function ReadingListProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addBook = (book) => dispatch({ type: 'ADD_BOOK', payload: book });
  const removeBook = (id) => dispatch({ type: 'REMOVE_BOOK', payload: id });
  const clearList = () => dispatch({ type: 'CLEAR_LIST' });

  return (
    <ReadingListContext.Provider value={{ items, addBook, removeBook, clearList, dispatch }}>
      {children}
    </ReadingListContext.Provider>
  );
}

export function useReadingList() {
  return useContext(ReadingListContext);
}
