import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../pages/Login'
import { BrowserRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { test, expect, vi } from 'vitest'

test('renders login form and validates input', async () =>{
  const mockLogin = vi.fn().mockResolvedValue(undefined)
  render(
    <BrowserRouter>
      <AuthContext.Provider value={{ user:null, token:null, loading:false, login: mockLogin, register: async ()=>{}, logout: ()=>{} }}>
        <Login />
      </AuthContext.Provider>
    </BrowserRouter>
  )

  const email = screen.getByPlaceholderText(/email/i)
  const password = screen.getByPlaceholderText(/senha/i)
  const button = screen.getByRole('button', { name: /entrar/i })

  await userEvent.type(email, 'invalid-email')
  await userEvent.type(password, '123')
  await userEvent.click(button)

  expect(screen.getByText(/email inválido/i)).toBeTruthy()
})
