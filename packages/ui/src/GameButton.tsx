import { forwardRef } from 'react'
import { Button, type ButtonProps } from '@all/ui'

export type GameButtonProps = ButtonProps

export const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(function GameButton(
  { className = '', ...props },
  ref
) {
  return <Button ref={ref} className={`game-btn ${className}`.trim()} {...props} />
})

export default GameButton
