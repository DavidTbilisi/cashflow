import { useState } from 'react'
import { MainMenuScreen } from './screens/MainMenuScreen'
import { LobbyScreen } from './screens/LobbyScreen'
import { GameScreen } from './screens/GameScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { HowToPlayScreen } from './screens/HowToPlayScreen'
import { CodexScreen } from './screens/CodexScreen'
import { useGameStore } from './store/gameStore'
import { useTutorialStore } from './store/tutorialStore'
import { STARTING_PROFILES } from './domain/data/startingProfiles'
import { DREAMS } from './domain/data/fastTrack'
import { loadGame } from './utils/persistence'

type Screen = 'menu' | 'lobby' | 'game' | 'results' | 'howto' | 'codex'

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const initGame = useGameStore((s) => s.initGame)
  const gameStatus = useGameStore((s) => s.game?.status)

  // Auto-navigate to results when game ends
  if ((gameStatus === 'completed_win' || gameStatus === 'completed_fail') && screen === 'game') {
    useTutorialStore.getState().skip()
    setScreen('results')
  }

  const handleContinue = () => {
    const saved = loadGame()
    if (saved) {
      useGameStore.setState({ game: saved })
      setScreen('game')
    }
  }

  const handleNewGame = () => {
    useTutorialStore.getState().skip()
    setScreen('lobby')
  }

  const handleStartTutorial = () => {
    // A clean solo Rat Race game; the driver scripts the dice from here.
    initGame([{ name: 'You', color: '#3b82f6', profile: STARTING_PROFILES[0], dreamId: DREAMS[0].id }])
    useTutorialStore.getState().start()
    setScreen('game')
  }

  return (
    <div className="font-sans antialiased">
      {screen === 'menu' && (
        <MainMenuScreen
          onNewGame={handleNewGame}
          onContinue={handleContinue}
          onTutorial={handleStartTutorial}
          onHowToPlay={() => setScreen('howto')}
          onCodex={() => setScreen('codex')}
        />
      )}
      {screen === 'howto' && (
        <HowToPlayScreen onBack={() => setScreen('menu')} onStartTutorial={handleStartTutorial} />
      )}
      {screen === 'codex' && <CodexScreen onBack={() => setScreen('menu')} />}
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
