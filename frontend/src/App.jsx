import './App.css'
import {Routes,Route} from 'react-router-dom'
import Home from './components/Home'
import DocQueryPage from './components/docquery/DocQueryPage'
import {Toaster} from 'react-hot-toast'

function App() {

  return (
    <>
      <Toaster position="top-center" reverseOrder={false}/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/docquery' element={<DocQueryPage/>}/>
      </Routes>
    </>
  )
}

export default App
