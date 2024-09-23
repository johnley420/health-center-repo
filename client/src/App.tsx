import React from 'react'
import PrivateRoutes from './auth/PrivateRoutes/'
import { Route, Routes } from 'react-router-dom'

const App = () => {
  return (
    <Routes>
       <Route
        path="/*"
        element={
            <PrivateRoutes />
        }
      />
    </Routes>
  )
}

export default App
