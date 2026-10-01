// 200 precomputed and verified solvable levels for Block Out
import type { LevelConfig } from '../types'

export const LEVELS_DATA: LevelConfig[] = [
  {
    "level": 1,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      }
    ],
    "minMoves": 1,
    "starThresholds": [
      1,
      2
    ]
  },
  {
    "level": 2,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 3,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 4,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      }
    ],
    "minMoves": 1,
    "starThresholds": [
      1,
      2
    ]
  },
  {
    "level": 5,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 6,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 3,
    "starThresholds": [
      3,
      5
    ]
  },
  {
    "level": 7,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 3,
    "starThresholds": [
      3,
      5
    ]
  },
  {
    "level": 8,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      }
    ],
    "minMoves": 3,
    "starThresholds": [
      3,
      5
    ]
  },
  {
    "level": 9,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 0
      }
    ],
    "minMoves": 3,
    "starThresholds": [
      3,
      5
    ]
  },
  {
    "level": 10,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      }
    ],
    "minMoves": 3,
    "starThresholds": [
      3,
      5
    ]
  },
  {
    "level": 11,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 12,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 13,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 0
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 14,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 2
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 15,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 16,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      }
    ],
    "minMoves": 3,
    "starThresholds": [
      3,
      5
    ]
  },
  {
    "level": 17,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 18,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 19,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      }
    ],
    "minMoves": 3,
    "starThresholds": [
      3,
      5
    ]
  },
  {
    "level": 20,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 1
      }
    ],
    "minMoves": 3,
    "starThresholds": [
      3,
      5
    ]
  },
  {
    "level": 21,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 22,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      }
    ],
    "minMoves": 6,
    "starThresholds": [
      6,
      9
    ]
  },
  {
    "level": 23,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 24,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      }
    ],
    "minMoves": 3,
    "starThresholds": [
      3,
      5
    ]
  },
  {
    "level": 25,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 26,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 27,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 4
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 28,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 29,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      }
    ],
    "minMoves": 6,
    "starThresholds": [
      6,
      9
    ]
  },
  {
    "level": 30,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 31,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 2
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 32,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 33,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 34,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 35,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 36,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 37,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 38,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 39,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      }
    ],
    "minMoves": 6,
    "starThresholds": [
      6,
      9
    ]
  },
  {
    "level": 40,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 41,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 42,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 5
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      12
    ]
  },
  {
    "level": 43,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      }
    ],
    "minMoves": 6,
    "starThresholds": [
      6,
      9
    ]
  },
  {
    "level": 44,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 45,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 2
      }
    ],
    "minMoves": 6,
    "starThresholds": [
      6,
      9
    ]
  },
  {
    "level": 46,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 47,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      12
    ]
  },
  {
    "level": 48,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      }
    ],
    "minMoves": 6,
    "starThresholds": [
      6,
      9
    ]
  },
  {
    "level": 49,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 50,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 51,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 0
      }
    ],
    "minMoves": 6,
    "starThresholds": [
      6,
      9
    ]
  },
  {
    "level": 52,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 4
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 2
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 53,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 54,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 55,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 56,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      15
    ]
  },
  {
    "level": 57,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 4
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 58,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 6,
    "starThresholds": [
      6,
      9
    ]
  },
  {
    "level": 59,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 60,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 61,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      }
    ],
    "minMoves": 6,
    "starThresholds": [
      6,
      9
    ]
  },
  {
    "level": 62,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      15
    ]
  },
  {
    "level": 63,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 3
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      15
    ]
  },
  {
    "level": 64,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      12
    ]
  },
  {
    "level": 65,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      12
    ]
  },
  {
    "level": 66,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 67,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 68,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      12
    ]
  },
  {
    "level": 69,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 70,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 71,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 72,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      }
    ],
    "minMoves": 6,
    "starThresholds": [
      6,
      9
    ]
  },
  {
    "level": 73,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 3
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 74,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      16
    ]
  },
  {
    "level": 75,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 76,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 0
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 77,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      }
    ],
    "minMoves": 6,
    "starThresholds": [
      6,
      9
    ]
  },
  {
    "level": 78,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      16
    ]
  },
  {
    "level": 79,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 80,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      }
    ],
    "minMoves": 4,
    "starThresholds": [
      4,
      6
    ]
  },
  {
    "level": 81,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 82,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 83,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 84,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      15
    ]
  },
  {
    "level": 85,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 0
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      15
    ]
  },
  {
    "level": 86,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      }
    ],
    "minMoves": 6,
    "starThresholds": [
      6,
      9
    ]
  },
  {
    "level": 87,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 88,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 89,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 2
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      15
    ]
  },
  {
    "level": 90,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 91,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 92,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 93,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 6,
    "starThresholds": [
      6,
      9
    ]
  },
  {
    "level": 94,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      15
    ]
  },
  {
    "level": 95,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 5
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      12
    ]
  },
  {
    "level": 96,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 97,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 98,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      }
    ],
    "minMoves": 5,
    "starThresholds": [
      5,
      8
    ]
  },
  {
    "level": 99,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      12
    ]
  },
  {
    "level": 100,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 1,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      12
    ]
  },
  {
    "level": 101,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 102,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      11
    ]
  },
  {
    "level": 103,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 104,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 105,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 106,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 0
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 107,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 108,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 109,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      }
    ],
    "minMoves": 13,
    "starThresholds": [
      13,
      18
    ]
  },
  {
    "level": 110,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      }
    ],
    "minMoves": 14,
    "starThresholds": [
      14,
      20
    ]
  },
  {
    "level": 111,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      11
    ]
  },
  {
    "level": 112,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 113,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 114,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      11
    ]
  },
  {
    "level": 115,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 116,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 2
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 117,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      11
    ]
  },
  {
    "level": 118,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 119,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      }
    ],
    "minMoves": 17,
    "starThresholds": [
      17,
      24
    ]
  },
  {
    "level": 120,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 121,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      11
    ]
  },
  {
    "level": 122,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 4
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 123,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 124,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      }
    ],
    "minMoves": 8,
    "starThresholds": [
      8,
      11
    ]
  },
  {
    "level": 125,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 126,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 127,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 128,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      14
    ]
  },
  {
    "level": 129,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 130,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      }
    ],
    "minMoves": 7,
    "starThresholds": [
      7,
      10
    ]
  },
  {
    "level": 131,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 0
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      14
    ]
  },
  {
    "level": 132,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 133,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 134,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 135,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      }
    ],
    "minMoves": 17,
    "starThresholds": [
      17,
      24
    ]
  },
  {
    "level": 136,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      }
    ],
    "minMoves": 13,
    "starThresholds": [
      13,
      18
    ]
  },
  {
    "level": 137,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      14
    ]
  },
  {
    "level": 138,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 139,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      14
    ]
  },
  {
    "level": 140,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      14
    ]
  },
  {
    "level": 141,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 5
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 142,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      }
    ],
    "minMoves": 14,
    "starThresholds": [
      14,
      20
    ]
  },
  {
    "level": 143,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      14
    ]
  },
  {
    "level": 144,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 5
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 145,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 146,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      14
    ]
  },
  {
    "level": 147,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 2
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 148,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 149,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 150,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 151,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 152,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 153,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 154,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      14
    ]
  },
  {
    "level": 155,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 156,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      }
    ],
    "minMoves": 13,
    "starThresholds": [
      13,
      18
    ]
  },
  {
    "level": 157,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      }
    ],
    "minMoves": 10,
    "starThresholds": [
      10,
      14
    ]
  },
  {
    "level": 158,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 159,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 2
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 160,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 161,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 162,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      }
    ],
    "minMoves": 9,
    "starThresholds": [
      9,
      13
    ]
  },
  {
    "level": 163,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 164,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 165,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 166,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 15,
    "starThresholds": [
      15,
      21
    ]
  },
  {
    "level": 167,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      }
    ],
    "minMoves": 16,
    "starThresholds": [
      16,
      22
    ]
  },
  {
    "level": 168,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 169,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 170,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      }
    ],
    "minMoves": 13,
    "starThresholds": [
      13,
      18
    ]
  },
  {
    "level": 171,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      }
    ],
    "minMoves": 19,
    "starThresholds": [
      19,
      27
    ]
  },
  {
    "level": 172,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 16,
    "starThresholds": [
      16,
      22
    ]
  },
  {
    "level": 173,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      }
    ],
    "minMoves": 14,
    "starThresholds": [
      14,
      20
    ]
  },
  {
    "level": 174,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 14,
    "starThresholds": [
      14,
      20
    ]
  },
  {
    "level": 175,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 176,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      }
    ],
    "minMoves": 15,
    "starThresholds": [
      15,
      21
    ]
  },
  {
    "level": 177,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 178,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 5
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      }
    ],
    "minMoves": 14,
    "starThresholds": [
      14,
      20
    ]
  },
  {
    "level": 179,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 5
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 180,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 181,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 14,
    "starThresholds": [
      14,
      20
    ]
  },
  {
    "level": 182,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      }
    ],
    "minMoves": 13,
    "starThresholds": [
      13,
      18
    ]
  },
  {
    "level": 183,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 4
      }
    ],
    "minMoves": 16,
    "starThresholds": [
      16,
      22
    ]
  },
  {
    "level": 184,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 1
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 185,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 3
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 186,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 4
      }
    ],
    "minMoves": 13,
    "starThresholds": [
      13,
      18
    ]
  },
  {
    "level": 187,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 3
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 1
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      }
    ],
    "minMoves": 15,
    "starThresholds": [
      15,
      21
    ]
  },
  {
    "level": 188,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 5
      }
    ],
    "minMoves": 14,
    "starThresholds": [
      14,
      20
    ]
  },
  {
    "level": 189,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 1
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 4
      }
    ],
    "minMoves": 17,
    "starThresholds": [
      17,
      24
    ]
  },
  {
    "level": 190,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 5
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 191,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 0
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 1
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      }
    ],
    "minMoves": 13,
    "starThresholds": [
      13,
      18
    ]
  },
  {
    "level": 192,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 4
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 193,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 5
      },
      {
        "id": "b10",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 0
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 194,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 0
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 3,
        "row": 2,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 2
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 195,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 3,
        "row": 4,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 2,
        "row": 3,
        "col": 4
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 3,
        "row": 0,
        "col": 2
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 196,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 3
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 3,
        "row": 3,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 5
      },
      {
        "id": "b5",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      }
    ],
    "minMoves": 11,
    "starThresholds": [
      11,
      15
    ]
  },
  {
    "level": 197,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      },
      {
        "id": "b3",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 2
      },
      {
        "id": "b4",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 3
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 5
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 5,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 2
      },
      {
        "id": "b10",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 1
      }
    ],
    "minMoves": 15,
    "starThresholds": [
      15,
      21
    ]
  },
  {
    "level": 198,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 4
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 3,
        "row": 1,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 2
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      }
    ],
    "minMoves": 12,
    "starThresholds": [
      12,
      17
    ]
  },
  {
    "level": 199,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 2,
        "row": 2,
        "col": 3
      },
      {
        "id": "b2",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 4
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 2
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 3,
        "row": 1,
        "col": 4
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 4,
        "col": 4
      },
      {
        "id": "b7",
        "orientation": "v",
        "length": 2,
        "row": 0,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "v",
        "length": 2,
        "row": 4,
        "col": 0
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 1
      }
    ],
    "minMoves": 15,
    "starThresholds": [
      15,
      21
    ]
  },
  {
    "level": 200,
    "blocks": [
      {
        "id": "target",
        "orientation": "h",
        "length": 2,
        "row": 2,
        "col": 0,
        "isTarget": true
      },
      {
        "id": "b1",
        "orientation": "v",
        "length": 3,
        "row": 0,
        "col": 2
      },
      {
        "id": "b2",
        "orientation": "v",
        "length": 2,
        "row": 1,
        "col": 5
      },
      {
        "id": "b3",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 3
      },
      {
        "id": "b4",
        "orientation": "h",
        "length": 2,
        "row": 5,
        "col": 0
      },
      {
        "id": "b5",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 5
      },
      {
        "id": "b6",
        "orientation": "h",
        "length": 2,
        "row": 0,
        "col": 0
      },
      {
        "id": "b7",
        "orientation": "h",
        "length": 2,
        "row": 1,
        "col": 3
      },
      {
        "id": "b8",
        "orientation": "h",
        "length": 3,
        "row": 3,
        "col": 1
      },
      {
        "id": "b9",
        "orientation": "v",
        "length": 2,
        "row": 3,
        "col": 4
      }
    ],
    "minMoves": 14,
    "starThresholds": [
      14,
      20
    ]
  }
]
