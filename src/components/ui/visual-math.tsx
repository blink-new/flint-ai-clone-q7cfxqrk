import React from 'react'

interface VisualMathProps {
  type: 'division' | 'multiplication' | 'fraction' | 'addition'
  numbers: number[]
  className?: string
}

export function VisualMath({ type, numbers, className = '' }: VisualMathProps) {
  const renderDivision = (dividend: number, divisor: number) => {
    const quotient = Math.floor(dividend / divisor)
    const groups = Array.from({ length: divisor }, (_, i) => 
      Array.from({ length: quotient }, (_, j) => i * quotient + j)
    )

    return (
      <div className={`p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl ${className}`}>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {dividend} ÷ {divisor} = {quotient}
          </h3>
          <p className="text-sm text-gray-600">Let's use 🍎 apples to visualize this!</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          {groups.map((group, groupIndex) => (
            <div 
              key={groupIndex}
              className="bg-white rounded-lg p-3 shadow-sm border-2 border-dashed border-blue-200 animate-fade-in"
              style={{ animationDelay: `${groupIndex * 200}ms` }}
            >
              <div className="text-xs text-center mb-2 font-medium text-blue-600">
                Basket {groupIndex + 1}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {group.map((_, itemIndex) => (
                  <div 
                    key={itemIndex}
                    className="text-2xl animate-bounce"
                    style={{ animationDelay: `${(groupIndex * quotient + itemIndex) * 100}ms` }}
                  >
                    🍎
                  </div>
                ))}
              </div>
              <div className="text-xs text-center mt-2 font-bold text-green-600">
                {quotient} apples
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-4 p-3 bg-green-100 rounded-lg">
          <p className="text-sm font-medium text-green-800">
            ✨ Each basket gets exactly <strong>{quotient}</strong> apples!
          </p>
        </div>
      </div>
    )
  }

  const renderFraction = (numerator: number, denominator: number) => {
    const totalParts = denominator
    const filledParts = numerator

    return (
      <div className={`p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl ${className}`}>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {numerator}/{denominator}
          </h3>
          <p className="text-sm text-gray-600">Let's visualize this fraction with pizza! 🍕</p>
        </div>
        
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full bg-yellow-200 border-4 border-yellow-400"></div>
            {Array.from({ length: totalParts }, (_, i) => {
              const angle = (360 / totalParts) * i
              const isFilled = i < filledParts
              
              return (
                <div
                  key={i}
                  className={`absolute inset-0 rounded-full transition-all duration-500 ${
                    isFilled ? 'bg-red-400' : 'bg-transparent'
                  }`}
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${
                      50 + 50 * Math.cos((angle - 90) * Math.PI / 180)
                    }% ${
                      50 + 50 * Math.sin((angle - 90) * Math.PI / 180)
                    }%, ${
                      50 + 50 * Math.cos((angle + 360/totalParts - 90) * Math.PI / 180)
                    }% ${
                      50 + 50 * Math.sin((angle + 360/totalParts - 90) * Math.PI / 180)
                    }%)`,
                    animationDelay: `${i * 200}ms`
                  }}
                />
              )
            })}
          </div>
        </div>
        
        <div className="text-center mt-4 p-3 bg-orange-100 rounded-lg">
          <p className="text-sm font-medium text-orange-800">
            🍕 <strong>{filledParts}</strong> out of <strong>{totalParts}</strong> slices
          </p>
        </div>
      </div>
    )
  }

  const renderMultiplication = (factor1: number, factor2: number) => {
    const product = factor1 * factor2

    return (
      <div className={`p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl ${className}`}>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {factor1} × {factor2} = {product}
          </h3>
          <p className="text-sm text-gray-600">Let's arrange ⭐ stars in groups!</p>
        </div>
        
        <div className="flex justify-center">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${factor2}, 1fr)` }}>
            {Array.from({ length: factor1 }, (_, row) =>
              Array.from({ length: factor2 }, (_, col) => (
                <div 
                  key={`${row}-${col}`}
                  className="text-2xl animate-pulse"
                  style={{ animationDelay: `${(row * factor2 + col) * 100}ms` }}
                >
                  ⭐
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="text-center mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm font-medium text-blue-800">
            ✨ <strong>{factor1}</strong> rows × <strong>{factor2}</strong> columns = <strong>{product}</strong> stars!
          </p>
        </div>
      </div>
    )
  }

  switch (type) {
    case 'division':
      return renderDivision(numbers[0] || 12, numbers[1] || 3)
    case 'fraction':
      return renderFraction(numbers[0] || 3, numbers[1] || 4)
    case 'multiplication':
      return renderMultiplication(numbers[0] || 3, numbers[1] || 4)
    default:
      return null
  }
}