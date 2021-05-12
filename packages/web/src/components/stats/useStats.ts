/*
 * Copyright (c) 2018-2021 aetheryx & Cynthia K. Rey
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

import { useState, useEffect } from 'preact/hooks'
import { Endpoints } from '../../constants'

export type Point = { x: number, y: number }
type RawDataset = Array<Record<string, number>>
type Dataset = { [key: string]: { color: string, points: Point[] } }

export type Chart = { min: number, max: number, dataset: Dataset }
export type StatsAll = { allTime: Chart, month: Chart, week: Chart }
export type StatsDay = { month: Chart, week: Chart, day: Chart }
export type CommunityStats = {
  numbers: Record<string, number>
  users: StatsAll
  guild: {
    users: StatsDay
    messages: StatsDay
    presences: StatsDay
  }
}

function roundMinMax (all: number[]) {
  const min = Math.min.apply(Math, all)
  const max = Math.max.apply(Math, all)
  const roundTo = (max - min < 100) ? 50 : (max - min < 250) ? 100 : 500
  return [ Math.floor(min / roundTo) * roundTo, Math.ceil(max / roundTo) * roundTo ]
}

function placePoints (points: number[], min: number, max: number) {
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

function simpleChart<TKey extends string> (points: number[], key: TKey, color: string): Chart {
  const [ min, max ] = roundMinMax(points)
  return { min, max, dataset: { [key]: { color, points: placePoints(points, min, max) } } }
}

function multipleChart (dataset: RawDataset, keys: string[], colors: string[]): Chart {
  const all = keys.map((k) => dataset.map((d) => d[k])).flat()
  const [ min, max ] = roundMinMax(all)
  const dset: Dataset = {}

  keys.forEach((k, i) => (dset[k] = { color: colors[i], points: placePoints(dataset.map(d => d[k]), min, max) }))
  return { min, max, dataset: dset }
}

function stackedChart (dataset: RawDataset, keys: string[], colors: string[]): Chart {
  // Make all values absolute
  dataset = dataset.map(d => {
    let buf = 0
    const adj: Record<string, number> = {}
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
  const finalDataset: Dataset = {}
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

let chartsCache: void | any = void 0
export default function useStats (): CommunityStats {
  const [ charts, setCharts ] = useState(chartsCache)
  useEffect(() => {
    if (!charts) {
      fetch(Endpoints.STATS)
        .then((r) => r.json())
        .then((data) => {
          data = {"users":{"count":15205,"allTime":[0,289,527,811,1040,1116,1228,1306,1407,1525,1631,1745,1860,1957,2101,2175,2196,2251,2347,2421,2488,2560,2628,2700,2761,2825,2906,2992,3095,3210,3499,3781,4168,4644,5163,5736,6233,6736,7227,7775,8243,8735,9256,9943,10664,11371,12186,13235,14198,15205],"month":[13478,13517,13556,13604,13640,13693,13737,13776,13822,13849,13870,13901,13929,13958,13979,14000,14033,14062,14093,14141,14167,14194,14219,14244,14274,14308,14338,14363,14398,14444,14463,14499,14531,14557,14615,14646,14684,14726,14751,14785,14815,14848,14900,14933,14971,15003,15031,15081,15147,15205],"week":[14694,14711,14719,14729,14732,14735,14741,14757,14771,14778,14783,14788,14792,14798,14811,14818,14831,14838,14852,14866,14888,14896,14903,14911,14918,14927,14940,14950,14964,14968,14975,14984,14996,15003,15008,15014,15020,15031,15041,15051,15065,15081,15099,15108,15129,15150,15171,15187,15197,15205]},"guild":{"month":[{"sentMessages":60,"deletedMessages":1,"total":8299,"online":931,"idle":620,"dnd":880},{"sentMessages":20,"deletedMessages":0,"total":8326,"online":1822,"idle":769,"dnd":1575},{"sentMessages":7,"deletedMessages":0,"total":8345,"online":1035,"idle":703,"dnd":1043},{"sentMessages":37,"deletedMessages":2,"total":8371,"online":1319,"idle":689,"dnd":1212},{"sentMessages":20,"deletedMessages":0,"total":8385,"online":1449,"idle":775,"dnd":1399},{"sentMessages":24,"deletedMessages":1,"total":8385,"online":941,"idle":624,"dnd":884},{"sentMessages":25,"deletedMessages":0,"total":8425,"online":1780,"idle":838,"dnd":1552},{"sentMessages":5,"deletedMessages":0,"total":8435,"online":926,"idle":728,"dnd":979},{"sentMessages":35,"deletedMessages":0,"total":8446,"online":1425,"idle":720,"dnd":1292},{"sentMessages":34,"deletedMessages":0,"total":8455,"online":1388,"idle":775,"dnd":1298},{"sentMessages":23,"deletedMessages":0,"total":8471,"online":985,"idle":618,"dnd":917},{"sentMessages":43,"deletedMessages":2,"total":8497,"online":1822,"idle":817,"dnd":1578},{"sentMessages":10,"deletedMessages":0,"total":8514,"online":1052,"idle":723,"dnd":1046},{"sentMessages":237,"deletedMessages":0,"total":8525,"online":1282,"idle":703,"dnd":1190},{"sentMessages":22,"deletedMessages":0,"total":8541,"online":1444,"idle":798,"dnd":1378},{"sentMessages":39,"deletedMessages":1,"total":8538,"online":980,"idle":621,"dnd":913},{"sentMessages":49,"deletedMessages":2,"total":8547,"online":1876,"idle":789,"dnd":1583},{"sentMessages":9,"deletedMessages":0,"total":8576,"online":1047,"idle":706,"dnd":1034},{"sentMessages":21,"deletedMessages":0,"total":8593,"online":1394,"idle":752,"dnd":1281},{"sentMessages":38,"deletedMessages":0,"total":8598,"online":1343,"idle":782,"dnd":1307},{"sentMessages":183,"deletedMessages":0,"total":8612,"online":1037,"idle":690,"dnd":1035},{"sentMessages":77,"deletedMessages":1,"total":8633,"online":1876,"idle":799,"dnd":1587},{"sentMessages":8,"deletedMessages":1,"total":8639,"online":1067,"idle":726,"dnd":1087},{"sentMessages":88,"deletedMessages":0,"total":8653,"online":1324,"idle":697,"dnd":1223},{"sentMessages":82,"deletedMessages":0,"total":8671,"online":1486,"idle":786,"dnd":1457},{"sentMessages":7,"deletedMessages":0,"total":8693,"online":984,"idle":637,"dnd":942},{"sentMessages":13,"deletedMessages":0,"total":8716,"online":1859,"idle":846,"dnd":1623},{"sentMessages":47,"deletedMessages":0,"total":8746,"online":1093,"idle":680,"dnd":1116},{"sentMessages":171,"deletedMessages":0,"total":8779,"online":1336,"idle":725,"dnd":1254},{"sentMessages":34,"deletedMessages":0,"total":8796,"online":1525,"idle":810,"dnd":1450},{"sentMessages":55,"deletedMessages":0,"total":8817,"online":1047,"idle":643,"dnd":1053},{"sentMessages":16,"deletedMessages":0,"total":8847,"online":1774,"idle":846,"dnd":1628},{"sentMessages":10,"deletedMessages":0,"total":8873,"online":989,"idle":731,"dnd":1078},{"sentMessages":28,"deletedMessages":1,"total":8900,"online":1455,"idle":708,"dnd":1293},{"sentMessages":38,"deletedMessages":0,"total":8923,"online":1585,"idle":844,"dnd":1510},{"sentMessages":5,"deletedMessages":0,"total":8949,"online":1015,"idle":616,"dnd":976},{"sentMessages":33,"deletedMessages":1,"total":8959,"online":1931,"idle":835,"dnd":1675},{"sentMessages":35,"deletedMessages":0,"total":8976,"online":998,"idle":725,"dnd":1111},{"sentMessages":131,"deletedMessages":2,"total":9003,"online":1390,"idle":731,"dnd":1313},{"sentMessages":32,"deletedMessages":2,"total":9012,"online":1509,"idle":837,"dnd":1497},{"sentMessages":9,"deletedMessages":0,"total":9035,"online":985,"idle":681,"dnd":1040},{"sentMessages":24,"deletedMessages":0,"total":9077,"online":1914,"idle":838,"dnd":1702},{"sentMessages":14,"deletedMessages":0,"total":9093,"online":1000,"idle":774,"dnd":1080},{"sentMessages":38,"deletedMessages":1,"total":9112,"online":1469,"idle":793,"dnd":1387},{"sentMessages":26,"deletedMessages":1,"total":9124,"online":1430,"idle":846,"dnd":1371},{"sentMessages":38,"deletedMessages":1,"total":9131,"online":1018,"idle":641,"dnd":994},{"sentMessages":91,"deletedMessages":0,"total":9156,"online":1969,"idle":832,"dnd":1730},{"sentMessages":8,"deletedMessages":0,"total":9203,"online":1041,"idle":720,"dnd":1111},{"sentMessages":16,"deletedMessages":1,"total":9261,"online":1376,"idle":771,"dnd":1320},{"sentMessages":85,"deletedMessages":0,"total":9281,"online":1574,"idle":810,"dnd":1522}],"week":[{"sentMessages":33,"deletedMessages":0,"total":8994,"online":1869,"idle":850,"dnd":1746},{"sentMessages":48,"deletedMessages":1,"total":8999,"online":1740,"idle":790,"dnd":1626},{"sentMessages":107,"deletedMessages":3,"total":9006,"online":1359,"idle":710,"dnd":1294},{"sentMessages":33,"deletedMessages":0,"total":9012,"online":1061,"idle":657,"dnd":1049},{"sentMessages":6,"deletedMessages":0,"total":9011,"online":959,"idle":696,"dnd":1047},{"sentMessages":7,"deletedMessages":0,"total":9005,"online":1046,"idle":810,"dnd":1159},{"sentMessages":28,"deletedMessages":1,"total":9011,"online":1448,"idle":829,"dnd":1468},{"sentMessages":24,"deletedMessages":2,"total":9022,"online":1799,"idle":899,"dnd":1702},{"sentMessages":21,"deletedMessages":0,"total":9027,"online":1827,"idle":816,"dnd":1612},{"sentMessages":38,"deletedMessages":0,"total":9035,"online":1383,"idle":782,"dnd":1320},{"sentMessages":34,"deletedMessages":0,"total":9036,"online":1100,"idle":690,"dnd":1111},{"sentMessages":8,"deletedMessages":0,"total":9035,"online":1018,"idle":686,"dnd":1067},{"sentMessages":26,"deletedMessages":0,"total":9042,"online":1081,"idle":741,"dnd":1139},{"sentMessages":24,"deletedMessages":0,"total":9051,"online":1404,"idle":839,"dnd":1460},{"sentMessages":84,"deletedMessages":0,"total":9062,"online":1790,"idle":867,"dnd":1630},{"sentMessages":122,"deletedMessages":1,"total":9079,"online":1916,"idle":824,"dnd":1704},{"sentMessages":29,"deletedMessages":0,"total":9080,"online":1470,"idle":801,"dnd":1385},{"sentMessages":35,"deletedMessages":0,"total":9080,"online":1263,"idle":703,"dnd":1232},{"sentMessages":7,"deletedMessages":0,"total":9091,"online":954,"idle":702,"dnd":993},{"sentMessages":14,"deletedMessages":0,"total":9093,"online":1000,"idle":774,"dnd":1080},{"sentMessages":28,"deletedMessages":1,"total":9091,"online":1290,"idle":817,"dnd":1291},{"sentMessages":23,"deletedMessages":0,"total":9100,"online":1687,"idle":843,"dnd":1547},{"sentMessages":27,"deletedMessages":0,"total":9106,"online":1894,"idle":876,"dnd":1672},{"sentMessages":26,"deletedMessages":0,"total":9106,"online":1597,"idle":798,"dnd":1485},{"sentMessages":34,"deletedMessages":0,"total":9117,"online":1304,"idle":743,"dnd":1237},{"sentMessages":76,"deletedMessages":1,"total":9118,"online":1055,"idle":669,"dnd":1026},{"sentMessages":27,"deletedMessages":2,"total":9121,"online":1012,"idle":745,"dnd":1042},{"sentMessages":28,"deletedMessages":2,"total":9124,"online":1226,"idle":813,"dnd":1220},{"sentMessages":37,"deletedMessages":0,"total":9128,"online":1570,"idle":871,"dnd":1480},{"sentMessages":40,"deletedMessages":1,"total":9135,"online":1841,"idle":904,"dnd":1631},{"sentMessages":23,"deletedMessages":0,"total":9135,"online":1517,"idle":826,"dnd":1375},{"sentMessages":10,"deletedMessages":1,"total":9134,"online":1296,"idle":682,"dnd":1181},{"sentMessages":76,"deletedMessages":0,"total":9129,"online":991,"idle":636,"dnd":987},{"sentMessages":56,"deletedMessages":1,"total":9131,"online":1054,"idle":695,"dnd":1066},{"sentMessages":24,"deletedMessages":1,"total":9139,"online":1285,"idle":788,"dnd":1269},{"sentMessages":52,"deletedMessages":2,"total":9141,"online":1697,"idle":850,"dnd":1575},{"sentMessages":35,"deletedMessages":1,"total":9150,"online":1973,"idle":831,"dnd":1712},{"sentMessages":70,"deletedMessages":1,"total":9166,"online":1619,"idle":798,"dnd":1462},{"sentMessages":66,"deletedMessages":1,"total":9177,"online":1279,"idle":728,"dnd":1238},{"sentMessages":27,"deletedMessages":1,"total":9194,"online":1025,"idle":664,"dnd":1014},{"sentMessages":27,"deletedMessages":1,"total":9200,"online":1008,"idle":688,"dnd":1088},{"sentMessages":7,"deletedMessages":0,"total":9207,"online":1162,"idle":796,"dnd":1228},{"sentMessages":5,"deletedMessages":0,"total":9218,"online":1575,"idle":868,"dnd":1548},{"sentMessages":72,"deletedMessages":0,"total":9230,"online":1939,"idle":892,"dnd":1713},{"sentMessages":164,"deletedMessages":0,"total":9249,"online":1756,"idle":776,"dnd":1551},{"sentMessages":25,"deletedMessages":0,"total":9263,"online":1313,"idle":758,"dnd":1278},{"sentMessages":80,"deletedMessages":1,"total":9266,"online":1064,"idle":645,"dnd":1040},{"sentMessages":21,"deletedMessages":0,"total":9269,"online":1002,"idle":700,"dnd":1067},{"sentMessages":26,"deletedMessages":0,"total":9278,"online":1139,"idle":768,"dnd":1205},{"sentMessages":85,"deletedMessages":0,"total":9281,"online":1574,"idle":810,"dnd":1522}],"day":[{"sentMessages":5,"deletedMessages":0,"total":9218,"online":1575,"idle":868,"dnd":1548},{"sentMessages":11,"deletedMessages":0,"total":9222,"online":1644,"idle":871,"dnd":1605},{"sentMessages":56,"deletedMessages":1,"total":9225,"online":1705,"idle":873,"dnd":1639},{"sentMessages":35,"deletedMessages":4,"total":9226,"online":1771,"idle":875,"dnd":1681},{"sentMessages":30,"deletedMessages":0,"total":9227,"online":1853,"idle":863,"dnd":1713},{"sentMessages":35,"deletedMessages":0,"total":9229,"online":1874,"idle":885,"dnd":1736},{"sentMessages":140,"deletedMessages":2,"total":9231,"online":1904,"idle":854,"dnd":1750},{"sentMessages":72,"deletedMessages":0,"total":9230,"online":1939,"idle":892,"dnd":1713},{"sentMessages":79,"deletedMessages":16,"total":9231,"online":1986,"idle":869,"dnd":1725},{"sentMessages":93,"deletedMessages":3,"total":9231,"online":1999,"idle":843,"dnd":1714},{"sentMessages":89,"deletedMessages":0,"total":9233,"online":1976,"idle":845,"dnd":1726},{"sentMessages":117,"deletedMessages":2,"total":9237,"online":1955,"idle":828,"dnd":1693},{"sentMessages":127,"deletedMessages":1,"total":9239,"online":1907,"idle":805,"dnd":1670},{"sentMessages":177,"deletedMessages":1,"total":9243,"online":1861,"idle":793,"dnd":1602},{"sentMessages":164,"deletedMessages":0,"total":9249,"online":1756,"idle":776,"dnd":1551},{"sentMessages":110,"deletedMessages":0,"total":9253,"online":1636,"idle":774,"dnd":1497},{"sentMessages":65,"deletedMessages":0,"total":9255,"online":1549,"idle":772,"dnd":1443},{"sentMessages":34,"deletedMessages":0,"total":9257,"online":1476,"idle":771,"dnd":1391},{"sentMessages":18,"deletedMessages":0,"total":9260,"online":1412,"idle":775,"dnd":1346},{"sentMessages":16,"deletedMessages":1,"total":9261,"online":1376,"idle":771,"dnd":1320},{"sentMessages":22,"deletedMessages":1,"total":9262,"online":1344,"idle":767,"dnd":1304},{"sentMessages":25,"deletedMessages":0,"total":9263,"online":1313,"idle":758,"dnd":1278},{"sentMessages":24,"deletedMessages":1,"total":9264,"online":1300,"idle":736,"dnd":1253},{"sentMessages":32,"deletedMessages":0,"total":9264,"online":1257,"idle":723,"dnd":1244},{"sentMessages":48,"deletedMessages":1,"total":9265,"online":1215,"idle":717,"dnd":1194},{"sentMessages":70,"deletedMessages":1,"total":9264,"online":1186,"idle":691,"dnd":1142},{"sentMessages":63,"deletedMessages":2,"total":9265,"online":1132,"idle":668,"dnd":1107},{"sentMessages":60,"deletedMessages":2,"total":9266,"online":1083,"idle":648,"dnd":1072},{"sentMessages":80,"deletedMessages":1,"total":9266,"online":1064,"idle":645,"dnd":1040},{"sentMessages":32,"deletedMessages":10,"total":9266,"online":1010,"idle":661,"dnd":1020},{"sentMessages":3,"deletedMessages":0,"total":9265,"online":995,"idle":668,"dnd":1005},{"sentMessages":11,"deletedMessages":0,"total":9267,"online":977,"idle":699,"dnd":1032},{"sentMessages":7,"deletedMessages":0,"total":9267,"online":988,"idle":705,"dnd":1065},{"sentMessages":48,"deletedMessages":0,"total":9268,"online":1011,"idle":690,"dnd":1052},{"sentMessages":31,"deletedMessages":0,"total":9268,"online":994,"idle":716,"dnd":1043},{"sentMessages":21,"deletedMessages":0,"total":9269,"online":1002,"idle":700,"dnd":1067},{"sentMessages":10,"deletedMessages":0,"total":9271,"online":1012,"idle":711,"dnd":1078},{"sentMessages":4,"deletedMessages":0,"total":9270,"online":1018,"idle":719,"dnd":1085},{"sentMessages":19,"deletedMessages":0,"total":9273,"online":1034,"idle":714,"dnd":1088},{"sentMessages":21,"deletedMessages":0,"total":9275,"online":1030,"idle":727,"dnd":1106},{"sentMessages":21,"deletedMessages":1,"total":9277,"online":1042,"idle":746,"dnd":1137},{"sentMessages":26,"deletedMessages":0,"total":9277,"online":1082,"idle":763,"dnd":1165},{"sentMessages":26,"deletedMessages":0,"total":9278,"online":1139,"idle":768,"dnd":1205},{"sentMessages":18,"deletedMessages":0,"total":9278,"online":1197,"idle":757,"dnd":1253},{"sentMessages":90,"deletedMessages":0,"total":9278,"online":1259,"idle":754,"dnd":1305},{"sentMessages":209,"deletedMessages":1,"total":9279,"online":1332,"idle":766,"dnd":1364},{"sentMessages":202,"deletedMessages":2,"total":9281,"online":1396,"idle":778,"dnd":1409},{"sentMessages":93,"deletedMessages":3,"total":9282,"online":1458,"idle":795,"dnd":1449},{"sentMessages":49,"deletedMessages":1,"total":9282,"online":1529,"idle":809,"dnd":1495},{"sentMessages":85,"deletedMessages":0,"total":9281,"online":1574,"idle":810,"dnd":1522}]},"helpers":72,"plugins":0,"themes":0}
          setCharts({
            numbers: {
              total: data.users.count,
              month: data.users.month[49] - data.users.month[0],
              week: data.users.week[49] - data.users.week[0],
              helpers: data.helpers,
              plugins: data.plugins,
              themes: data.themes
            },
            users: {
              allTime: simpleChart(data.users.allTime, 'users', '#7289da'),
              month: simpleChart(data.users.month, 'users', '#7289da'),
              week: simpleChart(data.users.week, 'users', '#7289da')
            },
            guild: data.guild
              ? {
                users: {
                  month: simpleChart(data.guild.month.map((d: any) => d.total), 'total', '#7289da'),
                  week: simpleChart(data.guild.week.map((d: any) => d.total), 'total', '#7289da'),
                  day: simpleChart(data.guild.day.map((d: any) => d.total), 'total', '#7289da')
                },
                messages: {
                  month: multipleChart(data.guild.month, [ 'deletedMessages', 'sentMessages' ], [ '#f04747', '#7289da' ]),
                  week: multipleChart(data.guild.week, [ 'deletedMessages', 'sentMessages' ], [ '#f04747', '#7289da' ]),
                  day: multipleChart(data.guild.day, [ 'deletedMessages', 'sentMessages' ], [ '#f04747', '#7289da' ])
                },
                presences: {
                  month: stackedChart(data.guild.month, [ 'dnd', 'idle', 'online' ], [ '#f04747', '#faa61a', '#43b581' ]),
                  week: stackedChart(data.guild.week, [ 'dnd', 'idle', 'online' ], [ '#f04747', '#faa61a', '#43b581' ]),
                  day: stackedChart(data.guild.day, [ 'dnd', 'idle', 'online' ], [ '#f04747', '#faa61a', '#43b581' ])
                }
              }
              : null
          })
        })
    }
  }, [])

  return charts
}
