import type { Card } from '../../entities/types'

export const obstacleCards: Card[] = [
  {
    id: 'obs_01',
    type: 'obstacle_challenge',
    title: 'Fear of Loss',
    description: 'You freeze before making a move that could grow your wealth. Miss a turn.',
    effects: [{ type: 'lose_turn', turns: 1 }],
    lesson: 'Fear of loss is greater than desire for gain for most people. Recognize it.',
  },
  {
    id: 'obs_02',
    type: 'obstacle_challenge',
    title: 'Cynicism',
    description: '"That will never work." Analysis paralysis costs you this opportunity.',
    effects: [{ type: 'lose_turn', turns: 1 }],
    lesson: 'Cynics confuse criticism for intelligence. Analysis must lead to action.',
  },
  {
    id: 'obs_03',
    type: 'obstacle_challenge',
    title: 'Laziness',
    description: 'You were "too busy" to review your finances this month. Lifestyle crept up $200.',
    effects: [{ type: 'add_expense', monthlyAmount: 200, label: 'Unchecked spending', isFixed: false }],
    lesson: 'Laziness disguises itself as busyness. Busy doing what?',
  },
  {
    id: 'obs_04',
    type: 'obstacle_challenge',
    title: 'Arrogance',
    description: 'You dismissed expert advice and made a bad deal. Lost $5,000.',
    effects: [{ type: 'cash_loss', amount: 5000 }],
    lesson: 'What you don\'t know costs more than what you do know.',
  },
  {
    id: 'obs_05',
    type: 'obstacle_challenge',
    title: 'Market Crash',
    description: 'Your portfolio drops 30% in value. Behavioral test: sell at the bottom?',
    effects: [{ type: 'cash_loss', amount: 2000 }],
    lesson: 'Volatility is the tuition for long-term returns. Those who stay, win.',
  },
]
