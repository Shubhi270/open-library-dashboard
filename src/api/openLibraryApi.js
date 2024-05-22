
const BASE_URL = 'https://openlibrary.org';

export const fetchBooks = async (authorSearch,page, rowsPerPage) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search.json?author=${authorSearch}&page=${page}&limit=${rowsPerPage}`
    );
    const data = await response.json();
    console.log("Books data:", data); // Log the books data for debugging
    return data;
  } catch (error) {
    console.error("Failed to fetch books:", error);
    throw error;
  }
};

export const fetchAuthorDetails = async (authorKey) => {
  try {
    const response = await fetch(`${BASE_URL}/authors/${authorKey}.json`);
    const data = await response.json();
    console.log('Author details:', data);  // Log the author details for debugging
    return data;
  } catch (error) {
    console.error('Failed to fetch author details:', error);
    throw error;
  }
};
