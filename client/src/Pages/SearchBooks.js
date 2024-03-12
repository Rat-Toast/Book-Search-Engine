import React, { useState, useEffect } from 'react';
import { Jumbotron, Container, Col, Form, Button, Card, CardColumns } from 'react-bootstrap';
import Auth from '../utils/auth';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../utils/mutations';

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');

  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
  const [saveBook] = useMutation(SAVE_BOOK);

  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });

    const handleFormSubmit = async (event) => {
      event.preventDefault();
  
      if (!searchInput) {
        return false;
      }
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${searchInput}`
        );
  
        if (!response.ok) {
          throw new Error('something went wrong!');
        }
        const { items } = await response.json();
  
        const bookData = items.map((book) => ({
          bookId: book.id,
          authors: book.volumeInfo.authors || ['No author to display'],
          title: book.volumeInfo.title,
          description: book.volumeInfo.description,
          image: book.volumeInfo.imageLinks?.thumbnail || '',
        }));
        setSearchedBooks(bookData);
        setSearchInput('');
      } catch (err) {
        console.error(err);
      }
    };
  
    const handleSaveBook = async (bookId) => {
      const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
  
      const token = Auth.loggedIn() ? Auth.getToken() : null;
  
      if (!token) {
        return false;
      }
  
      try {
        await saveBook({
          variables: { newBook: { ...bookToSave } },
        });
  
        setSavedBookIds([...savedBookIds, bookToSave.bookId]);
      } catch (err) {
        console.error(err);
      }
    };