import { describe, expect, it } from 'vitest'
import {
  CATEGORY_LABELS,
  PRINCIPLES,
  PRINCIPLE_CATEGORIES,
  SURFACE_LABELS,
  principleById,
  principlesByCategory,
  type PrincipleCategory,
  type PrincipleSurface,
} from '../../domain/data/principles'

const SURFACES: PrincipleSurface[] = ['mechanic', 'card', 'gauge', 'win_lose', 'concept']

describe('principles catalog', () => {
  it('has a substantial, deduplicated set of principles', () => {
    expect(PRINCIPLES.length).toBeGreaterThanOrEqual(50)
    const ids = PRINCIPLES.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length) // unique ids
  })

  it('every principle is fully populated', () => {
    for (const p of PRINCIPLES) {
      expect(p.id, `${p.id} id`).toMatch(/^[a-z0-9-]+$/)
      expect(p.name.length, `${p.id} name`).toBeGreaterThan(0)
      expect(p.oneLiner.length, `${p.id} oneLiner`).toBeGreaterThan(0)
      expect(p.detail.length, `${p.id} detail`).toBeGreaterThan(20)
      expect(p.inGame.length, `${p.id} inGame`).toBeGreaterThan(0)
      expect(p.sources.length, `${p.id} sources`).toBeGreaterThan(0)
      expect(PRINCIPLE_CATEGORIES, `${p.id} category`).toContain(p.category)
      expect(SURFACES, `${p.id} surface`).toContain(p.surface)
    }
  })

  it('covers every category and surface type', () => {
    for (const c of PRINCIPLE_CATEGORIES) {
      expect(principlesByCategory(c as PrincipleCategory).length, `category ${c}`).toBeGreaterThan(0)
    }
    for (const s of SURFACES) {
      expect(PRINCIPLES.some((p) => p.surface === s), `surface ${s}`).toBe(true)
    }
  })

  it('has labels for every category and surface', () => {
    for (const c of PRINCIPLE_CATEGORIES) expect(CATEGORY_LABELS[c as PrincipleCategory]).toBeTruthy()
    for (const s of SURFACES) expect(SURFACE_LABELS[s]).toBeTruthy()
  })

  it('looks principles up by id', () => {
    expect(principleById('six-anchors')?.name).toBe('The Six Anchors')
    expect(principleById('does-not-exist')).toBeUndefined()
  })

  it('represents each cornerstone framework already coded into the game', () => {
    const wanted = ['six-anchors', 'esbi-quadrant', 'necst-test', 'profit-first', 'productocracy']
    for (const id of wanted) expect(principleById(id), id).toBeDefined()
  })
})
