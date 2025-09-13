import React from 'react'

const GlobalWatermark: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Repeating diagonal background lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            rgba(0,0,0,0.05) 0px,
            rgba(0,0,0,0.05) 1px,
            transparent 1px,
            transparent 200px
          )`,
        }}
      />
    

        {/* Main watermark text - center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-gray-500 dark:text-gray-400 opacity-15 dark:opacity-12 transform -rotate-45 select-none whitespace-nowrap">
            Tech Ascend Consulting
          </span>
        </div>
      
       {/* Secondary watermark text - right side */}
       <div className="absolute inset-0 flex items-center justify-end pr-20">
         <span className="text-5xl font-bold text-gray-500 dark:text-gray-400 opacity-20 dark:opacity-15 transform -rotate-45 select-none whitespace-nowrap">
           Tech Ascend Consulting
         </span>
       </div>
       
       {/* Secondary watermark text - left side */}
       <div className="absolute inset-0 flex items-center justify-start pl-20">
         <span className="text-5xl font-bold text-gray-500 dark:text-gray-400 opacity-20 dark:opacity-15 transform -rotate-45 select-none whitespace-nowrap">
           Tech Ascend Consulting
         </span>
       </div>
      
      {/* Additional watermark - bottom right corner */}
      <div className="absolute bottom-20 right-10">
        <span className="text-4xl font-bold text-gray-500 dark:text-gray-400 opacity-20 dark:opacity-15 transform -rotate-45 select-none whitespace-nowrap">
          Tech Ascend
        </span>
      </div>
      
    </div>
  )
}

export default GlobalWatermark
