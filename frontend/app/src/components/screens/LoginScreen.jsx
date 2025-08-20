import React from 'react'
import {useState} from 'react'
import axios from 'axios';
import {Form,Button} from 'react-bootstrap'


function LoginScreen() {

    const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/login/', {
        username,
        password
      });

      if (res.data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(res.data));
        setMsg('Login successful');
        // redirect or update UI
      }
    } catch (err) {
      setMsg('Login failed: ' + err.response?.data?.message || 'Server Error');
    }
  };
  return (
   <>
    <div style={{ padding: '20px' }} className='row mt-5'>
        <div className="col-3"></div>
        <div className="col-6 card p-4">
            <h2 className='text-center'>Login</h2>
      <Form onSubmit={handleLogin}>
        <Form.Group>
            <Form.Label>User Name</Form.Label>
        <Form.Control  type="text"
          placeholder="User Name"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required>  
        </Form.Control>
        </Form.Group>

        <Form.Group className='mt-3'>
            <Form.Label>password</Form.Label>
        <Form.Control  type="text"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required>   
        </Form.Control>
        </Form.Group>

        <Button className='mt-5 w-100' type='submit'>Login</Button>
      </Form>
      <br />
      {msg && <p>{msg}</p>}
    </div>
        </div>
        <div className="col-3"></div>
      
   </>
  )
}

export default LoginScreen