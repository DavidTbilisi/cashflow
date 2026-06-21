/**
 * The Wealth Codex — every financial principle the game teaches.
 *
 * This is the single source of truth that "transfers" the study-note canon
 * (Rich Dad Poor Dad, The Richest Man in Babylon, Psychology of Money,
 * The Almanack of Naval, Profit First, The Millionaire Fastlane / Unscripted,
 * The Intelligent Investor, Bogle, Zero to One, and the personal-finance
 * Six-Anchors system) into one browsable, in-game reference.
 *
 * Each entry says what the principle is, where it came from, and — crucially —
 * how it actually shows up in the game (`surface` + `inGame`), so the Codex is
 * a map between the ideas and the mechanics, not a detached glossary.
 */

/** Where a principle lives in the game. */
export type PrincipleSurface =
  | 'mechanic' // a rule the engine enforces every turn
  | 'card' // appears as one or more cards in a deck
  | 'gauge' // a meter / indicator you watch
  | 'win_lose' // a victory or failure condition
  | 'concept' // taught through copy: tooltips, How-to-Play, the Codex itself

/** Thematic grouping, used by the Codex filter rail. */
export type PrincipleCategory =
  | 'foundations' // the load-bearing frameworks the whole game is built on
  | 'mindset' // psychology & behaviour of money
  | 'saving' // budgeting, paying yourself first, buffers
  | 'investing' // assets, markets, compounding, index funds
  | 'debt' // leverage, good vs bad debt, payoff strategy
  | 'earning' // income, specific knowledge, leverage, the quadrant
  | 'business' // building systems & products that scale

export interface Principle {
  id: string
  /** Short, memorable name. */
  name: string
  /** One sentence — the headline idea. */
  oneLiner: string
  /** A fuller two-to-three sentence explanation. */
  detail: string
  category: PrincipleCategory
  surface: PrincipleSurface
  /** Concrete pointer to where it appears in the game. */
  inGame: string
  /** Books / notes the idea is drawn from. */
  sources: string[]
}

export const CATEGORY_LABELS: Record<PrincipleCategory, string> = {
  foundations: 'Foundations',
  mindset: 'Mindset & Psychology',
  saving: 'Saving & Budgeting',
  investing: 'Investing',
  debt: 'Debt & Leverage',
  earning: 'Earning & Leverage',
  business: 'Building Business',
}

export const SURFACE_LABELS: Record<PrincipleSurface, string> = {
  mechanic: 'Game Rule',
  card: 'Card',
  gauge: 'Gauge',
  win_lose: 'Win / Lose',
  concept: 'Concept',
}

export const PRINCIPLES: Principle[] = [
  // ── Foundations — the frameworks the game is built on ──────────────────────
  {
    id: 'six-anchors',
    name: 'The Six Anchors',
    oneLiner: 'Six things to secure, in order: Door, Scale, Safe, Chain, Engine, Shield.',
    detail:
      'Get earning (Door), live below your means (Scale), bank a buffer (Safe), use good debt (Chain), build passive income (Engine), then protect it (Shield). Each anchor holds the next in place.',
    category: 'foundations',
    surface: 'gauge',
    inGame: 'The six-box Anchor Progress bar; unlocking all six is a win path.',
    sources: ['Personal Finance — Six Anchors system'],
  },
  {
    id: 'esbi-quadrant',
    name: 'The ESBI Quadrant',
    oneLiner: 'Employee → Self-employed → Business owner → Investor.',
    detail:
      'The left side (E, S) trades time for money; the right side (B, I) earns from systems and capital. Wealth is the journey from working for money to having money work for you.',
    category: 'foundations',
    surface: 'mechanic',
    inGame: 'Your ESBI badge in the top bar; reaching B/I on the Fast Track is a win path.',
    sources: ['Rich Dad Poor Dad', 'The CASHFLOW Quadrant'],
  },
  {
    id: 'asset-vs-liability',
    name: 'Assets vs Liabilities',
    oneLiner: 'An asset puts money in your pocket; a liability takes it out.',
    detail:
      'Forget the accountant\'s definition — judge by cash-flow direction. The rich buy assets that pay them; the poor and middle class buy liabilities they think are assets (like a too-big house).',
    category: 'foundations',
    surface: 'mechanic',
    inGame: 'Every deal shows its monthly cash-flow effect; your sheet splits Assets from Liabilities.',
    sources: ['Rich Dad Poor Dad'],
  },
  {
    id: 'passive-income-freedom',
    name: 'Passive Income = Freedom',
    oneLiner: 'You are free the moment passive income covers your expenses.',
    detail:
      'Passive income arrives whether or not you work. When it clears your monthly expenses you escape the Rat Race — the single most important number in the game.',
    category: 'foundations',
    surface: 'win_lose',
    inGame: 'The Freedom Gauge; hitting 100% exits the Rat Race onto the Fast Track.',
    sources: ['Rich Dad Poor Dad', 'Passive Income Assets'],
  },
  {
    id: 'rat-race',
    name: 'The Rat Race',
    oneLiner: 'Earn, spend, repeat — running faster but never getting ahead.',
    detail:
      'Salary in, expenses out, no assets accumulating. Every lifestyle upgrade tightens the loop. The whole early game is about breaking out of it.',
    category: 'foundations',
    surface: 'mechanic',
    inGame: 'The inner board loop; staying stuck while expenses keep pace can lose you the game.',
    sources: ['Rich Dad Poor Dad', 'Fastlane Roadmaps'],
  },
  {
    id: 'necst-test',
    name: 'The NECST Test',
    oneLiner: 'Need, Entry, Control, Scale, Time — vet a venture before you commit.',
    detail:
      'Is there real demand (Need)? Is it hard to copy (Entry)? Do you own it (Control)? Can it serve 10× without 10× your effort (Scale)? Does it survive your absence (Time)?',
    category: 'foundations',
    surface: 'mechanic',
    inGame: 'The NECST modal that gates big ventures before your money is committed.',
    sources: ['The Millionaire Fastlane', 'Unscripted'],
  },
  {
    id: 'productocracy',
    name: 'Productocracy',
    oneLiner: 'A product so good it sells itself.',
    detail:
      'Pass all five CENTS commandments and you build something that grows by word of mouth — an expansion loop where happy customers make more customers. Worth more than any marketing budget.',
    category: 'foundations',
    surface: 'mechanic',
    inGame: 'A perfect (all-5) CENTS pass yields a self-selling asset with a 1.5× income multiplier.',
    sources: ['Unscripted'],
  },

  // ── Mindset & Psychology ───────────────────────────────────────────────────
  {
    id: 'wealth-is-unseen',
    name: 'Wealth Is What You Don\'t See',
    oneLiner: 'Wealth is the assets you didn\'t spend, not the things you bought.',
    detail:
      'The car, the watch, the big house are spent money — they are the opposite of wealth. True wealth is the income-producing assets nobody sees because you didn\'t convert them into stuff.',
    category: 'mindset',
    surface: 'concept',
    inGame: 'Doodad "wants" tempt you to convert cash into status; net worth rewards what you keep.',
    sources: ['The Psychology of Money'],
  },
  {
    id: 'room-for-error',
    name: 'Room for Error',
    oneLiner: 'Leave a margin of safety; the plan that survives beats the optimal plan.',
    detail:
      'The most important part of every plan is planning for the plan not to go to plan. A buffer of 3–6 months turns a catastrophe into an inconvenience.',
    category: 'mindset',
    surface: 'gauge',
    inGame: 'The Safe anchor (6× expenses in cash) and the cushion that absorbs setback cards.',
    sources: ['The Psychology of Money', 'The Intelligent Investor'],
  },
  {
    id: 'reasonable-over-rational',
    name: 'Reasonable > Rational',
    oneLiner: 'A good plan you\'ll stick with beats a perfect plan you\'ll abandon.',
    detail:
      'Money decisions are made at the kitchen table, not on a spreadsheet. A slightly sub-optimal strategy you can hold through stress outperforms the optimal one you panic-sell.',
    category: 'mindset',
    surface: 'concept',
    inGame: 'Decision cards reward sustainable choices over the theoretical-maximum gamble.',
    sources: ['The Psychology of Money'],
  },
  {
    id: 'volatility-is-a-fee',
    name: 'Volatility Is a Fee, Not a Fine',
    oneLiner: 'Market drops are the price of admission, not a punishment.',
    detail:
      'Returns are never free — the cost is enduring downturns without panic-selling. Treat volatility as a fee you pay willingly and you stop locking in losses at the bottom.',
    category: 'mindset',
    surface: 'card',
    inGame: 'Market and obstacle cards swing asset values; holding through the dip pays off.',
    sources: ['The Psychology of Money'],
  },
  {
    id: 'never-enough',
    name: 'Knowing When You Have Enough',
    oneLiner: 'If you never define "enough," success keeps raising the stakes.',
    detail:
      'The hardest financial skill is stopping the goalposts from moving. Risking what you have and need for what you don\'t have and don\'t need is how winners go broke.',
    category: 'mindset',
    surface: 'win_lose',
    inGame: 'You pick a Dream to define your "enough"; chasing endless upside courts ruin cards.',
    sources: ['The Psychology of Money'],
  },
  {
    id: 'tails-drive-everything',
    name: 'Tails Drive Everything',
    oneLiner: 'A few big wins produce most of the results — so survive long enough to catch them.',
    detail:
      'Most investments do little; a small handful do almost everything. You can be wrong half the time and still win, as long as you stay in the game for the outliers.',
    category: 'mindset',
    surface: 'card',
    inGame: 'Rare big-deal upside; the real skill is not going bust before the tail event lands.',
    sources: ['The Psychology of Money'],
  },
  {
    id: 'getting-vs-staying-wealthy',
    name: 'Getting vs Staying Wealthy',
    oneLiner: 'Getting rich takes boldness; staying rich takes humility and fear.',
    detail:
      'The two require opposite skills. Survival is the only thing that lets compounding work — so once you\'re ahead, switch from optimism to paranoia about ruin.',
    category: 'mindset',
    surface: 'concept',
    inGame: 'Fast Track audits, lawsuits and divorce punish over-leverage once you\'re wealthy.',
    sources: ['The Psychology of Money'],
  },
  {
    id: 'luck-and-risk',
    name: 'Luck & Risk',
    oneLiner: 'Every outcome is part skill, part chance — judge process, not results.',
    detail:
      'Nothing is as good or as bad as it seems. Attribute outcomes proportionally so a lucky win doesn\'t breed overconfidence and a bad break doesn\'t break your nerve.',
    category: 'mindset',
    surface: 'mechanic',
    inGame: 'Dice introduce real luck; sound process keeps you solvent across good and bad rolls.',
    sources: ['The Psychology of Money'],
  },
  {
    id: 'savings-rate',
    name: 'Your Savings Rate Is the Lever',
    oneLiner: 'Saving rate matters more than income or investment returns.',
    detail:
      'You control how much you save far more than you control your salary or the market. Wealth is the gap between your ego and your income — widen the gap.',
    category: 'mindset',
    surface: 'gauge',
    inGame: 'Positive cash flow (income − expenses) is what funds every deal; the Scale anchor rewards it.',
    sources: ['The Psychology of Money'],
  },
  {
    id: 'producer-mindset',
    name: 'Producer, Not Consumer',
    oneLiner: 'Ask "how does this make money?" instead of "do I want to buy it?"',
    detail:
      'Consumers see products to buy; producers see systems that earn. Flipping the question is the mental switch that turns a spender into an owner.',
    category: 'mindset',
    surface: 'concept',
    inGame: 'Opportunity tiles ask you to build income; Doodad tiles tempt you to consume.',
    sources: ['The Millionaire Fastlane', 'Business Foundations'],
  },
  {
    id: 'lifestyle-creep',
    name: 'Lifestyle Creep',
    oneLiner: 'When income rises, expenses quietly rise to swallow it.',
    detail:
      'Every raise invites a matching upgrade until you\'re no wealthier on a bigger salary. Resisting the creep is how a raise becomes freedom instead of a fancier cage.',
    category: 'mindset',
    surface: 'card',
    inGame: 'Raise/expense cards push your monthly costs up; the Trapped loss condition watches for it.',
    sources: ['Rich Dad Poor Dad', 'Fastlane Roadmaps'],
  },
  {
    id: 'status-vs-wealth',
    name: 'Wealth Games > Status Games',
    oneLiner: 'Status is zero-sum and corrodes; wealth is positive-sum and compounds.',
    detail:
      'In status games your gain is someone\'s loss, so they\'re played dirty. Play wealth games — positive-sum bets with people who want you to win — and let compounding do the rest.',
    category: 'mindset',
    surface: 'card',
    inGame: 'Network cards reward giving first and positive-sum relationships over flashy displays.',
    sources: ['The Almanack of Naval Ravikant'],
  },

  // ── Saving & Budgeting ──────────────────────────────────────────────────────
  {
    id: 'pay-yourself-first',
    name: 'Pay Yourself First',
    oneLiner: 'Skim savings off the top before any other spending.',
    detail:
      'A part of all you earn is yours to keep. Reserve at least a tenth the moment money arrives — automatically, non-negotiably — and live on the rest.',
    category: 'saving',
    surface: 'mechanic',
    inGame: 'Profit First allocation seals Profit & Tax envelopes off your payday before you can spend.',
    sources: ['The Richest Man in Babylon', 'Profit First'],
  },
  {
    id: 'profit-first',
    name: 'Profit First',
    oneLiner: 'Sales − Profit = Expenses (not Sales − Expenses = Profit).',
    detail:
      'Take profit first into a separate, hard-to-touch account, then run the business on what\'s left. Constrain spending to the remainder and profit stops being an afterthought.',
    category: 'saving',
    surface: 'mechanic',
    inGame: 'Each payday auto-allocates to sealed Profit & Tax accounts; Profit pays out quarterly.',
    sources: ['Profit First'],
  },
  {
    id: 'five-laws-of-gold',
    name: 'The Five Laws of Gold',
    oneLiner: 'Save a tenth, invest it wisely, guard it, and shun get-rich-quick schemes.',
    detail:
      'Gold comes to those who save 10%+, flows to those who put it to profitable work under wise counsel, and flees those who invest outside their competence or chase impossible returns.',
    category: 'saving',
    surface: 'concept',
    inGame: 'The discipline behind the Scale & Safe anchors and the NECST guard on risky ventures.',
    sources: ['The Richest Man in Babylon'],
  },
  {
    id: 'seven-cures',
    name: 'Seven Cures for a Lean Purse',
    oneLiner: 'A seven-step ladder from thin purse to prosperity.',
    detail:
      'Start the purse fattening (save 10%), control spending, make gold multiply, guard from loss, own your home, insure future income, and increase your earning power — in order.',
    category: 'saving',
    surface: 'concept',
    inGame: 'Mirrored by the Anchor ladder you climb from Door through Shield.',
    sources: ['The Richest Man in Babylon'],
  },
  {
    id: 'budget-allocation',
    name: 'Needs / Wants / Savings',
    oneLiner: 'Split income into buckets — roughly 50% needs, 30% wants, 20% to invest.',
    detail:
      'A budget isn\'t restriction, it\'s direction. Cap the wants, protect the savings slice, and keep the split steady even as income grows.',
    category: 'saving',
    surface: 'card',
    inGame: 'Doodads are tagged need vs want — needs are mandatory, wants you can decline.',
    sources: ['Budget Allocation', 'The Richest Man in Babylon (70/20/10)'],
  },
  {
    id: 'emergency-buffer',
    name: 'The Emergency Buffer',
    oneLiner: 'Hold 3–6 months of expenses in cash before you take risks.',
    detail:
      'The buffer is what lets you invest boldly and weather a bad month without a forced sale. Fund it first; leverage second.',
    category: 'saving',
    surface: 'gauge',
    inGame: 'The Safe anchor: cash (plus sealed reserves) ≥ 6× monthly expenses.',
    sources: ['Personal Finance — Six Anchors', 'The Psychology of Money'],
  },
  {
    id: 'affordability-test',
    name: 'The Affordability Test',
    oneLiner: 'You can afford it only when you don\'t have to think about affording it.',
    detail:
      'If buying it depends on a future raise or a good month, you can\'t actually afford it yet. Unconditional cash flow is the real green light.',
    category: 'saving',
    surface: 'mechanic',
    inGame: 'Card modals warn when a purchase drops your cash below a month of expenses.',
    sources: ['Fastlane Roadmaps'],
  },

  // ── Investing ───────────────────────────────────────────────────────────────
  {
    id: 'compounding',
    name: 'Compounding',
    oneLiner: 'Returns that earn returns — money\'s slaves making more slaves.',
    detail:
      'The eighth wonder of the world. Reinvested gains snowball back-loaded: small for years, then enormous. Time in the market is the cheat code.',
    category: 'investing',
    surface: 'mechanic',
    inGame: 'Reinvest passive income into more assets and your monthly cash flow accelerates.',
    sources: ['The Richest Man in Babylon', 'The Psychology of Money'],
  },
  {
    id: 'index-investing',
    name: 'Low-Cost Index Investing',
    oneLiner: 'Own the whole market cheaply instead of betting on winners.',
    detail:
      'Most active investors lose to the index after costs. Buy the haystack rather than search for the needle — boring, diversified, and quietly powerful.',
    category: 'investing',
    surface: 'card',
    inGame: 'Index-fund deals: lower, steadier returns with little to maintain.',
    sources: ['The Little Book of Common Sense Investing'],
  },
  {
    id: 'cost-compounding',
    name: 'Costs Compound Against You',
    oneLiner: 'A 1% fee, compounded for decades, quietly eats a fortune.',
    detail:
      'The relentless rules of humble arithmetic: costs compound exactly as returns do, just in the wrong direction. In investing, you get what you don\'t pay for.',
    category: 'investing',
    surface: 'concept',
    inGame: 'High-fee/high-maintenance assets carry monthly expenses that erode their cash flow.',
    sources: ['The Little Book of Common Sense Investing'],
  },
  {
    id: 'mr-market',
    name: 'Mr. Market',
    oneLiner: 'Price is a moody quote; value is what the asset is actually worth.',
    detail:
      'Every day Mr. Market offers a price driven by emotion. Buy from his pessimism and sell into his optimism — never let his mood decide yours.',
    category: 'investing',
    surface: 'card',
    inGame: 'Market cards offer wildly varying prices for the same asset — sell high, ignore the noise.',
    sources: ['The Intelligent Investor'],
  },
  {
    id: 'margin-of-safety',
    name: 'Margin of Safety',
    oneLiner: 'Buy well below value so error and bad luck can\'t ruin you.',
    detail:
      'The three most important words in investing. Pay enough below intrinsic value that even a wrong estimate still leaves you protected.',
    category: 'investing',
    surface: 'card',
    inGame: 'Foreclosure / below-market deals: buy under value for built-in downside protection.',
    sources: ['The Intelligent Investor'],
  },
  {
    id: 'circle-of-competence',
    name: 'Circle of Competence',
    oneLiner: 'Only invest in what you genuinely understand.',
    detail:
      'It\'s not how big your circle is, it\'s knowing where its edges are. Stay inside it and unfamiliar territory can\'t blindside you.',
    category: 'investing',
    surface: 'concept',
    inGame: 'Ventures outside your understanding fail the NECST test and become expensive lessons.',
    sources: ['The Intelligent Investor', 'The Richest Man in Babylon'],
  },
  {
    id: 'passive-income-ladder',
    name: 'The Passive-Income Ladder',
    oneLiner: 'Many ways to earn without trading hours — land, machines, IP, capital.',
    detail:
      'Rentals, dividends, royalties, software, vending, lending — each asset class has its own entry cost and yield. A portfolio mixes them so no one stream is a single point of failure.',
    category: 'investing',
    surface: 'card',
    inGame: 'Small & Big Deal decks span real estate, stocks, business and intellectual property.',
    sources: ['Passive Income Assets'],
  },
  {
    id: 'diversification',
    name: 'Diversification',
    oneLiner: 'Don\'t let one bad break sink the ship.',
    detail:
      'Spread across asset classes so a crash in one doesn\'t wipe you out. Diversification is protection against not knowing which tail will hit.',
    category: 'investing',
    surface: 'gauge',
    inGame: 'The Asset-Class Mix chart shows how concentrated or spread your portfolio is.',
    sources: ['The Intelligent Investor', 'The Little Book of Common Sense Investing'],
  },

  // ── Debt & Leverage ───────────────────────────────────────────────────────
  {
    id: 'good-vs-bad-debt',
    name: 'Good Debt vs Bad Debt',
    oneLiner: 'Good debt buys assets that pay it off; bad debt buys liabilities.',
    detail:
      'Borrow to acquire something that earns more than the loan costs and debt works for you. Borrow to consume and it quietly drains you.',
    category: 'debt',
    surface: 'mechanic',
    inGame: 'The Chain anchor unlocks when you borrow against an income-producing asset.',
    sources: ['Rich Dad Poor Dad', 'Earn money using debt'],
  },
  {
    id: 'productive-vs-parasitic-debt',
    name: 'Productive vs Parasitic Debt',
    oneLiner: 'Productive debt frees the engine; parasitic debt starves it.',
    detail:
      'Debt funding a return greater than its interest is productive. Debt funding consumption is parasitic — it siphons cash flow every month with nothing earning behind it.',
    category: 'debt',
    surface: 'card',
    inGame: 'Leverage decision cards: ROI above borrowing cost pays off; consumer debt just bleeds you.',
    sources: ['The Millionaire Fastlane', 'Debt & Leverage'],
  },
  {
    id: 'leverage-guardrails',
    name: 'Leverage Needs a Buffer First',
    oneLiner: 'Fund your safety buffer before you borrow to invest.',
    detail:
      'Leverage without a cushion turns a temporary downturn into a forced sale at the worst time. Buffer first, leverage second — never the reverse.',
    category: 'debt',
    surface: 'mechanic',
    inGame: 'Borrowing while cash-thin flashes a warning; the Safe anchor should precede the Chain.',
    sources: ['Debt & Leverage', 'The Psychology of Money'],
  },
  {
    id: 'roi-beats-borrowing-cost',
    name: 'ROI > Borrowing Cost',
    oneLiner: 'Leverage only pays when the asset out-earns the interest.',
    detail:
      'Borrow at 6% to earn 12% and the spread is yours. The whole game of good leverage is keeping the return comfortably above the cost of the money.',
    category: 'debt',
    surface: 'card',
    inGame: 'The Leverage Opportunity card asks exactly this before you take the loan.',
    sources: ['Earn money using debt', 'The Millionaire Fastlane'],
  },
  {
    id: 'avalanche-vs-snowball',
    name: 'Avalanche vs Snowball',
    oneLiner: 'Pay highest-rate debt first (math) or smallest balance first (momentum).',
    detail:
      'Avalanche minimises interest; snowball maximises motivation by clearing small debts fast. The best method is the one you\'ll actually finish.',
    category: 'debt',
    surface: 'card',
    inGame: 'Debt-payoff decision cards let you choose your strategy and feel the trade-off.',
    sources: ['Debt & Leverage'],
  },
  {
    id: 'debt-spiral',
    name: 'The Debt Spiral',
    oneLiner: 'Debt → pressure → bad decisions → more debt.',
    detail:
      'A self-reinforcing loop that fixes at the buffer, not the repayment schedule. Break it by funding the Safe first; chasing the payments alone never ends it.',
    category: 'debt',
    surface: 'mechanic',
    inGame: 'High-interest debt cards compound expenses; the Trapped loss condition is this spiral.',
    sources: ['Debt & Leverage'],
  },

  // ── Earning & Leverage ──────────────────────────────────────────────────────
  {
    id: 'specific-knowledge',
    name: 'Specific Knowledge',
    oneLiner: 'Earn from rare, hard-to-teach skills only you bring.',
    detail:
      'Specific knowledge is found by pursuing genuine curiosity, not school. It feels like play to you and looks like work to others — and it can\'t be easily outsourced or automated.',
    category: 'earning',
    surface: 'concept',
    inGame: 'High-value ventures and productocracies reward what only you can uniquely offer.',
    sources: ['The Almanack of Naval Ravikant'],
  },
  {
    id: 'leverage-naval',
    name: 'Capital, Labour, Code & Media',
    oneLiner: 'Four ways to multiply your effort — money, people, software, content.',
    detail:
      'Leverage is a force multiplier on judgment. Capital and labour need permission; code and media are permissionless — they work while you sleep at zero marginal cost.',
    category: 'earning',
    surface: 'card',
    inGame: 'Business-building and IP cards let one good decision scale far beyond your own hours.',
    sources: ['The Almanack of Naval Ravikant', 'Business Foundations'],
  },
  {
    id: 'permissionless-leverage',
    name: 'Permissionless Leverage',
    oneLiner: 'Code and media replicate for free — the capital-light road to the B/I side.',
    detail:
      'You no longer need permission (a boss, a bank) to use the newest leverage. Build software or content once and it serves a million people without asking anyone.',
    category: 'earning',
    surface: 'card',
    inGame: 'Intellectual-property assets: near-zero marginal cost to serve one more customer.',
    sources: ['The Almanack of Naval Ravikant'],
  },
  {
    id: 'productize-yourself',
    name: 'Productize Yourself',
    oneLiner: 'Turn your unique mix of skills into something that scales.',
    detail:
      'Specific knowledge + leverage + accountability under your own name. Build a product (or a personal brand) only you could make, then let leverage carry it to many.',
    category: 'earning',
    surface: 'concept',
    inGame: 'The path from S (own a job) to B (own a system) as you systemise what you do.',
    sources: ['The Almanack of Naval Ravikant'],
  },
  {
    id: 'judgment-multiplies-leverage',
    name: 'Judgment Multiplies Leverage',
    oneLiner: 'Leverage amplifies good and bad decisions alike.',
    detail:
      'With high leverage a right call pays enormously and a wrong call ruins enormously. Intelligence without judgment, multiplied, is dangerous — earn the leverage with the decisions.',
    category: 'earning',
    surface: 'concept',
    inGame: 'Leveraged deals magnify both the upside on a pass and the loss on a fail.',
    sources: ['The Almanack of Naval Ravikant'],
  },
  {
    id: 'human-vs-capital',
    name: 'Human Capital vs Capital Assets',
    oneLiner: 'You working for money stops when you stop; money working for you doesn\'t.',
    detail:
      'Early on, your earning power is your biggest asset. The goal is to convert that human capital into capital assets that keep paying once you step back.',
    category: 'earning',
    surface: 'gauge',
    inGame: 'The Income Mix chart shows active (you) vs passive (your assets) income shifting over.',
    sources: ['Passive Income Assets'],
  },

  // ── Building Business ───────────────────────────────────────────────────────
  {
    id: 'law-of-effection',
    name: 'The Law of Effection',
    oneLiner: 'To make millions, affect millions — in scale or in magnitude.',
    detail:
      'Wealth scales with impact: serve many people a little (scale) or few people a lot (magnitude). No impact, no wealth — both paths multiply through reach.',
    category: 'business',
    surface: 'concept',
    inGame: 'Big-deal businesses and productocracies pay precisely because they reach more people.',
    sources: ['The Millionaire Fastlane'],
  },
  {
    id: 'fastlane-equation',
    name: 'The Fastlane Equation',
    oneLiner: 'Wealth = Net Profit + Asset Value — both controllable and uncapped.',
    detail:
      'The Slowlane pegs wealth to hours × wage (limited, uncontrollable). The Fastlane builds a business system whose profit and sale value you control without a ceiling.',
    category: 'business',
    surface: 'win_lose',
    inGame: 'Fast Track businesses grow your CASHFLOW Day income toward the +$50k win.',
    sources: ['The Millionaire Fastlane', 'Fastlane Roadmaps'],
  },
  {
    id: 'three-roadmaps',
    name: 'Sidewalk, Slowlane, Fastlane',
    oneLiner: 'Three money roads: no plan, slow compound, or a business system.',
    detail:
      'The Sidewalk lives paycheck to paycheck; the Slowlane saves a job\'s wages for 40 years; the Fastlane builds an asset that creates wealth in a decade. Pick your road deliberately.',
    category: 'business',
    surface: 'concept',
    inGame: 'Consuming (Sidewalk) vs saving (Slowlane) vs building businesses (Fastlane) on the board.',
    sources: ['Fastlane Roadmaps', 'The Millionaire Fastlane'],
  },
  {
    id: 'business-minimum',
    name: 'What Makes a Business',
    oneLiner: 'Need + Value + Exchange + Customer — miss one and it\'s a hobby.',
    detail:
      'A real business solves a need, delivers value, takes payment, and has actual customers. Drop any element and you have a charity, a hobby, or vaporware.',
    category: 'business',
    surface: 'concept',
    inGame: 'System-building cards make you confirm the venture is a business, not a money pit.',
    sources: ['Business Foundations'],
  },
  {
    id: 'systemize-it',
    name: 'Systemise It',
    oneLiner: 'Build a business that runs without you — work on it, not in it.',
    detail:
      'Document, delegate, automate. A business owned but not escaped is just a demanding job; turn it into a machine and you cross from S to B.',
    category: 'business',
    surface: 'card',
    inGame: 'System-building cards add SOPs, delegation and automation — the Engine anchor.',
    sources: ['The E-Myth Revisited', 'Unscripted'],
  },
  {
    id: 'monopoly-over-competition',
    name: 'Monopoly Beats Competition',
    oneLiner: 'Perfect competition kills profit; a durable edge captures value.',
    detail:
      'Build something so good, with such a moat (tech, network effects, brand, scale), that nobody competes it to zero. Start by dominating a small market, then expand.',
    category: 'business',
    surface: 'card',
    inGame: 'High-barrier (NECST "Entry") ventures keep their margins; copyable ones get competed away.',
    sources: ['Zero to One'],
  },
  {
    id: 'zero-to-one',
    name: 'Zero to One',
    oneLiner: 'Creating something new (0→1) beats copying what exists (1→n).',
    detail:
      'Real progress is vertical — going from nothing to something. Copying winners is horizontal and crowded; the outsized rewards go to genuine innovation.',
    category: 'business',
    surface: 'concept',
    inGame: 'Productocracy ventures reward originality and control over me-too businesses.',
    sources: ['Zero to One'],
  },
  {
    id: 'social-capital',
    name: 'Social Capital',
    oneLiner: 'Give value first; a network compounds like money does.',
    detail:
      'Relationships are an asset class. Pay it forward and you build trust that unlocks off-market deals and favours cash alone can\'t buy.',
    category: 'business',
    surface: 'mechanic',
    inGame: 'The Network deck: bank Social Capital by giving, then spend it for deal access.',
    sources: ['The Almanack of Naval Ravikant', 'Company of One'],
  },
]

/** All categories in display order. */
export const PRINCIPLE_CATEGORIES: PrincipleCategory[] = [
  'foundations',
  'mindset',
  'saving',
  'investing',
  'debt',
  'earning',
  'business',
]

/** Look up a single principle by id. */
export function principleById(id: string): Principle | undefined {
  return PRINCIPLES.find((p) => p.id === id)
}

/** Principles in a category, in declaration order. */
export function principlesByCategory(category: PrincipleCategory): Principle[] {
  return PRINCIPLES.filter((p) => p.category === category)
}
