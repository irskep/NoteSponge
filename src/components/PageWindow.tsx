import { useAtom } from 'jotai'
import { modalStateAtom } from '../state/atoms'
import { useMenuEventListeners } from '../hooks/useAppState'

export default function PageWindow() {
  const [modalState, setModalState] = useAtom(modalStateAtom)
  
  useMenuEventListeners()

  return (
    <div className="PageWindow">
      {/* Content will be moved from App.tsx in the next step */}
    </div>
  )
}
