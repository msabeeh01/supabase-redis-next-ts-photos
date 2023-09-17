import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { redis } from '@/lib/redis'


interface Image {
  name: string
  signedUrl: string
}

export default function Home() {
  const [images, setImages] = useState<Image[]>([])
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetchImages()
  })

  const fetchImages = async () => {
    const res = await fetch('/api/fetchImages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userID: 'cd32b7e5-9279-43fc-b94a-76b8efe6ed7d' })
    })
    const data = await res.json()
    setImages(data)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const uploadImage = async () => {
    if (file) {
      //upload to supabase storage
      const { data, error } = await supabase
        .storage
        .from('images')
        .upload(`cd32b7e5-9279-43fc-b94a-76b8efe6ed7d/${file.name}`, file)
      if (error) {
        console.log(error)
        return
      } else {
        const res = await fetch('/api/resetCache', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userID: 'cd32b7e5-9279-43fc-b94a-76b8efe6ed7d' })
        })
        console.log(res)
      }
    }
  }



  return (
    <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
      {images && images.map((image, i) => (
        <div key={i}>
          <img
            src={image.signedUrl}
            alt={image.name}
            className='w-full h-64 rounded object-cover'
          />
        </div>
      ))}

      <input className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' type='file' onChange={handleFileChange} />

      {file && <button onClick={uploadImage}>Upload File</button>}
    </div>
  )
}
