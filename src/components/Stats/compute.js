/*
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function roundMinMax (all) {
  const min = Math.min.apply(Math, all)
  const max = Math.max.apply(Math, all)
  const roundTo = (max - min < 500) ? 250 : 500
  return [ Math.floor(min / roundTo) * roundTo, Math.ceil(max / roundTo) * roundTo ]
}

function placePoints (points, min, max) {
  let xBuf = 0
  const xDelta = 1 / points.length
  const pointsPosition = []
  for (const point of points) {
    const y = max - min === 0 ? 0 : (point - min) / (max - min)
    pointsPosition.push({ x: xBuf, y })
    xBuf += xDelta
  }

  return pointsPosition
}

export function simpleChart (points, key, color) {
  const [ min, max ] = roundMinMax(points)
  return { min, max, dataset: { [key]: { color, points: placePoints(points, min, max) } } }
}

export function multipleChart (dataset, keys, colors) {
  const all = keys.map((k, i) => dataset.map(d => d[k])).flat()
  const [ min, max ] = roundMinMax(all)
  const dset = {}

  keys.forEach((k, i) => (dset[k] = { color: colors[i], points: placePoints(dataset.map(d => d[k]), min, max) }))
  return { min, max, dataset: dset }
}

export function stackedChart (dataset, keys, colors) {
  // Make all values absolute
  dataset = dataset.map(d => {
    let buf = 0
    const adj = {}
    for (const key of keys) {
      buf += d[key]
      adj[key] = buf
    }
    return adj
  })

  // Compute chart boundaries
  const points = dataset.map(d => [ d[keys[0]], d[keys[keys.length - 1]] ]).flat()
  const [ min, max ] = roundMinMax(points)

  // Place points
  let xBuf = 0
  const xDelta = 1 / (points.length / 2)
  const finalDataset = {}
  for (const data of dataset) {
    for (const key of keys) {
      if (!finalDataset[key]) {
        finalDataset[key] = {
          color: colors[keys.indexOf(key)],
          points: []
        }
      }

      const y = (data[key] - min) / (max - min)
      finalDataset[key].points.push({ x: xBuf, y })
    }

    xBuf += xDelta
  }
  return { min, max, dataset: finalDataset }
}
