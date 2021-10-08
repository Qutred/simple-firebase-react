import React, { useEffect, useState, useCallback } from 'react';
import './App.scss';
import { db } from './firebase-config';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Container, Row, Col, Spinner, Form, Button } from 'react-bootstrap';

function App() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const usersCollectionRef = collection(db, 'users');
  const [input, setInput] = useState({
    name: '',
    age: '',
    id: null,
  });
  const [isFormCreate, setIsFormCreate] = useState(true);

  const getUsers = useCallback(async () => {
    setIsLoading(true);
    const data = await getDocs(usersCollectionRef);
    setIsLoading(false);
    setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  });
  useEffect(() => {
    getUsers();
  }, []);

  const sendData = async () => {
    try {
      if (isFormCreate) {
        await addDoc(usersCollectionRef, {
          name: input.name,
          age: Number(input.age),
        });
        getUsers();
        clearInputFields();
      } else {
        const userDoc = doc(db, 'users', input.id);
        await updateDoc(userDoc, { name: input.name, age: Number(input.age) });
        clearInputFields();
        setIsFormCreate(true);
      }
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const updateUser = (id, name, age) => {
    setIsFormCreate(false);
    setInput({ name, age, id });
  };

  const deleteUser = async (id) => {
    const userDoc = doc(db, 'users', id);
    await deleteDoc(userDoc);
    getUsers();
    clearInputFields();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendData();
  };

  const clearInputFields = () => {
    setInput({
      name: '',
      age: '',
      id: null,
    });
  };

  const handleInputChange = (e) => {
    const name = e.target.name;
    const val = e.target.value;
    setInput((prevState) => ({
      ...prevState,
      [name]: val,
    }));
  };

  return (
    <div className='App'>
      <Container fluid>
        <Row>
          <header>
            <h1>Simple Firebase React App</h1>
          </header>
        </Row>
      </Container>
      <Container>
        <Row className='justify-content-md-center'>
          <Col lg='6'>
            <h3 className='mb-3'>
              {isFormCreate ? 'Create User' : 'Update User'}
            </h3>
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group className='mb-3' controlId='name'>
                <Form.Control
                  type='text'
                  placeholder='Enter name'
                  value={input.name}
                  name='name'
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className='mb-3' controlId='age'>
                <Form.Control
                  type='number'
                  placeholder='Enter age'
                  value={input.age}
                  name='age'
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Button variant='primary' type='submit'>
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
      {isLoading && (
        <Spinner className='mt-3 mb-3' animation='border' variant='primary' />
      )}
      {!isLoading && (
        <Container>
          <Row className='justify-content-md-center'>
            <Col lg='6'>
              <div className='users-box'>
                <h4>USERS:</h4>
                {users.map((user) => {
                  return (
                    <div key={user.id} className='users-box__row'>
                      <p className='users-box__data'>
                        {' '}
                        name: {user.name} age: {user.age}
                      </p>
                      <Button
                        variant='secondary'
                        size='sm'
                        onClick={(e) => {
                          updateUser(user.id, user.name, user.age);
                        }}
                      >
                        Update user data
                      </Button>
                      <Button
                        className='btn-close users-box__close'
                        title='delete user'
                        onClick={() => deleteUser(user.id)}
                      ></Button>
                    </div>
                  );
                })}
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
}

export default App;
