import { useState } from 'react'
import { MainMenuScreen } from './screens/MainMenuScreen'
import { LobbyScreen } from './screens/LobbyScreen'
import { GameScreen } from './screens/GameScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { useGameStore } from './store/gameStore'
import { loadGame } from './utils/persistence'

type Screen = 'menu' | 'lobby' | 'game' | 'results'

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const initGame = useGameStore((s) => s.initGame)
  const gameStatus = useGameStore((s) => s.game?.status)

  // Auto-navigate to results when game ends
  if ((gameStatus === 'completed_win' || gameStatus === 'completed_fail') && screen === 'game') {
    setScreen('results')
  }

  const handleContinue = () => {
    const saved = loadGame()
    if (saved) {
      useGameStore.setState({ game: saved })
      setScreen('game')
    }
  }

  return (
    <div className="font-sans antialiased">
      {screen === 'menu' && (
        <MainMenuScreen
          onNewGame={() => setScreen('lobby')}
          onContinue={handleContinue}
        />
      )}
      {screen === 'lobby' && (
        <LobbyScreen onStart={() => setScreen('game')} />
      )}
      {screen === 'game' && <GameScreen />}
      {screen === 'results' && (
        <ResultsScreen onPlayAgain={() => setScreen('menu')} />
      )}
    </div>
  )
}
