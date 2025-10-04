// RegisterPage.jsx
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto bg-white border rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Registro</h2>
      {error && <p className="text-red-600">{error}</p>}
      <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Nombre" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
      <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
      <input className="w-full border rounded px-3 py-2 mb-4" type="password" placeholder="Contraseña" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
      <button className="w-full bg-indigo-600 text-white rounded py-2">Crear cuenta</button>
    </form>
  )
}
