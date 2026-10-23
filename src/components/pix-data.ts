/** 像素物品图样：每字符对应调色板一色，与风格原型 prototypes/ 保持一致 */

export interface PixelDef {
  pal: Record<string, string>
  rows: string[]
}

export const PIX: Record<string, PixelDef> = {
  diamond: {
    pal: { o: '#0e6b64', l: '#5ce0d6', h: '#ccfff9', d: '#2aa79c' },
    rows: ['....oo....', '...ollo...', '..olhhlo..', '.olhhlllo.', 'olhhlllllo', 'ollllllddo', '.ollllddo.', '..ollddo..', '...oddo...', '....oo....'],
  },
  emerald: {
    pal: { o: '#0a6b39', l: '#2ecc71', h: '#a7f3c9', d: '#169257' },
    rows: ['....oo....', '...ollo...', '..olhhlo..', '.olhhlllo.', 'olhhlllllo', 'ollllllddo', '.ollllddo.', '..ollddo..', '...oddo...', '....oo....'],
  },
  gold: {
    pal: { o: '#8a5a0a', g: '#f2b53a', h: '#ffe38a', d: '#c9871c' },
    rows: ['..........', '..oooooo..', '.ohhggggo.', 'ohgggggggo', 'oggggggggo', 'ogggggggdo', '.oooooooo.', '..........'],
  },
  netherite: {
    pal: { o: '#15151a', g: '#4a4550', h: '#8d8391', d: '#332f38' },
    rows: ['..........', '..oooooo..', '.ohhggggo.', 'ohgggggggo', 'oggggggggo', 'ogggggggdo', '.oooooooo.', '..........'],
  },
  pearl: {
    pal: { o: '#0e2a2a', b: '#0f5f5f', l: '#1fa8a8', h: '#7beaea', p: '#7c4dbf' },
    rows: ['...oooo...', '..obbbbo..', '.oblhbbpbo', 'obhhhbbbbo', 'oblbbbbpbo', 'obbbbbbbbo', 'obpbbbblbo', '.obbbbbbo.', '..obbbbo..', '...oooo...'],
  },
  potion: {
    pal: { o: '#1c2b2b', b: '#bfe3dc', h: '#ffffff', g: '#7ce75a' },
    rows: ['....oo....', '...obbo...', '...obbo...', '..obbbbo..', '.obbhbbbo.', '.obggggbo.', 'obggggggbo', 'obggggggbo', '.oggggggo.', '..oooooo..'],
  },
  book: {
    pal: { o: '#3a2410', R: '#b0542c', p: '#e8d9b0', s: '#9ef7dd', g: '#4a3218' },
    rows: ['..........', '.oooooooo.', 'oRpppppppo', 'oRppsgpppo', 'oRpppppppo', 'oRpppppppo', 'oRpppppppo', 'oRpppppppo', '.oooooooo.', '..........'],
  },
  concrete: {
    pal: { o: '#8f8f8f', l: '#f2f2f2', w: '#e3e3e3', d: '#c9c9c9' },
    rows: ['oooooooooo', 'ollllllllo', 'lwwwwwwwwd', 'lwwwwwwwwd', 'lwwwwwwwwd', 'lwwwwwwwwd', 'lwwwwwwwwd', 'lwwwwwwwwd', 'oddddddddo', 'oooooooooo'],
  },
  tnt: {
    pal: { o: '#6e1c1c', r: '#b03a3a', R: '#d95b4a', w: '#e8dcc8', k: '#22222a' },
    rows: ['.oooooooooo.', 'orrrrrrrrrro', 'orRRRRRRRRro', 'owwwwwwwwwwo', 'owwkwwwkkwwo', 'owwwwwwwwwwo', 'orRRRRRRRRro', 'orrrrrrrrrro', '.oooooooooo.'],
  },
  chest: {
    pal: { o: '#3a2410', w: '#9a6b2f', W: '#b5834a', k: '#2a2a2a', g: '#8a8a8a' },
    rows: ['..oooooooo..', '.oWWWWWWWWo.', '.owwwwwwwwo.', '.ooookkoooo.', 'oggoowwooggo', 'oggoowwooggo', 'oggoowwooggo', 'oggowwwooggo', '.oowwwwwwoo.', '..oooooooo..'],
  },
  grass: {
    pal: { o: '#2f5a23', g: '#5aa03c', G: '#7fc95a', d: '#6b4a2a', D: '#8a6538' },
    rows: ['oooooooooo', 'oGGgGGgGGo', 'oGgGGGgGGo', 'oggggggggo', 'odDDddDDdo', 'odDddddDDo', 'oddDDddDdo', 'oddddDDddo', 'odDdddddDo', 'oooooooooo'],
  },
  steve: {
    pal: { h: '#3a2a17', s: '#c68e64', e: '#ffffff', b: '#4a3fa8', m: '#8a5a4a' },
    rows: ['hhhhhhhh', 'hhhhhhhh', 'hssssssh', 'sebssebs', 'ssssssss', 'ssssssss', 'ssmmmmss', 'ssssssss'],
  },
}
