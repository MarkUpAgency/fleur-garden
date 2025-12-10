import { Loader2 } from 'lucide-react'
import React from 'react'

function loading() {
  return (
    <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )
}

export default loading