import { test, expect } from './util/coverage-fixture'
import { setupApp } from './util/helpers'

const { describe } = test

describe('lib/util', () => {
  test('exposes formatting and object/query helpers', async ({ page }) => {
    await setupApp(page)
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()

    const result = await page.evaluate(async () => {
      const util = await import('/src/lib/util.tsx')

      const iconNoText = util.Icon({ name: 'star' })
      const iconRightText = util.Icon({ name: 'star', rightText: 'right' })
      const iconLeftText = util.Icon({ name: 'star', leftText: 'left' })
      const iconBothText = util.Icon({ name: 'star', rightText: 'right', leftText: 'left' })

      const textOf = (child: { props?: { children?: unknown } } | null) => child?.props?.children ?? null

      return {
        iconNoTextClassName: iconNoText.props.className,
        iconNoTextChildren: [textOf(iconNoText.props.children[0]), textOf(iconNoText.props.children[2])],
        iconRightTextClassName: iconRightText.props.className,
        iconRightTextChildren: [textOf(iconRightText.props.children[0]), textOf(iconRightText.props.children[2])],
        iconLeftTextClassName: iconLeftText.props.className,
        iconLeftTextChildren: [textOf(iconLeftText.props.children[0]), textOf(iconLeftText.props.children[2])],
        iconBothTextChildren: [textOf(iconBothText.props.children[0]), textOf(iconBothText.props.children[2])],

        durationUndefined: util.duration(undefined),
        durationWithHours: util.duration('PT1H2M3S'),
        durationWithoutHours: util.duration('PT5M30S'),
        durationSecondsOnlyFormatted: util.duration('PT45S'),

        durationSecondsUndefined: util.durationSeconds(undefined),
        durationSecondsInvalid: util.durationSeconds('not-a-duration'),
        durationSecondsValid: util.durationSeconds('PT1H2M3S'),

        transformed: util.transformObject({ a: 1, b: 2 }, (value: number) => value * 2),
        mapObj: util.convertMapToObject(new Map([['a', 1], ['b', 2]])),
        entriesObj: util.convertMapEntriesToObject([['a', 1], ['b', 2]]),

        queryStringified: util.stringifyQueryString({ a: '1', b: '2' }),
        queryParsedFromNonString: util.parseQueryString(null),
        queryParsedFromString: util.parseQueryString('?a=1&b=2'),

        linkWithDefaultUpdates: util.updatedLink({ pathname: '/foo', search: '?x=1' }),
        linkWithSearchUpdate: util.updatedLink({ pathname: '/foo', search: '?x=1' }, { search: { y: '2' } }),
        linkWithPathnameUpdate: util.updatedLink({ pathname: '/foo', search: '' }, { pathname: '/bar' }),
      }
    })

    expect(result.iconNoTextClassName).toBe('icon')
    expect(result.iconNoTextChildren).toEqual([null, null])
    expect(result.iconRightTextClassName).toBe('icon with-text')
    expect(result.iconRightTextChildren).toEqual([null, 'right'])
    expect(result.iconLeftTextClassName).toBe('icon with-text')
    expect(result.iconLeftTextChildren).toEqual(['left', null])
    expect(result.iconBothTextChildren).toEqual(['left', 'right'])

    expect(result.durationUndefined).toBeUndefined()
    expect(result.durationWithHours).toBe('1:02:03')
    expect(result.durationWithoutHours).toBe('5:30')
    expect(result.durationSecondsOnlyFormatted).toBe('0:45')

    expect(result.durationSecondsUndefined).toBe(0)
    expect(result.durationSecondsInvalid).toBe(0)
    expect(result.durationSecondsValid).toBe(3723)

    expect(result.transformed).toEqual({ a: 2, b: 4 })
    expect(result.mapObj).toEqual({ a: 1, b: 2 })
    expect(result.entriesObj).toEqual({ a: 1, b: 2 })

    expect(result.queryStringified).toBe('?a=1&b=2')
    expect(result.queryParsedFromNonString).toEqual({})
    expect(result.queryParsedFromString).toEqual({ a: '1', b: '2' })

    expect(result.linkWithDefaultUpdates).toEqual({ pathname: '/foo', search: '?x=1' })
    expect(result.linkWithSearchUpdate).toEqual({ pathname: '/foo', search: '?x=1&y=2' })
    expect(result.linkWithPathnameUpdate).toEqual({ pathname: '/bar', search: '' })
  })
})
