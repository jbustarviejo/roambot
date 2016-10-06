module.exports = {
config: {
    "luis_schema_version": "1.3.0",
    "name": "Roambot",
    "desc": "",
    "culture": "es-es",
    "intents": [
      {
        "name": "None"
      },
      {
        "name": "roamersNumber"
      },
      {
        "name": "successRate"
      },
      {
        "name": "roamersStatsNoMetric"
      }
    ],
    "entities": [
      {
        "name": "country"
      },
      {
        "name": "direction"
      },
      {
        "name": "subscriber"
      },
      {
        "name": "time",
        "children": [
          "quantity",
          "period"
        ]
      }
    ],
    "composites": [],
    "bing_entities": [],
    "actions": [],
    "model_features": [],
    "regex_features": [],
    "utterances": []
  },
  defaultUtterances: [
    {
      "text": "Número de roamers",
      "intent": "roamersNumber",
      "entities": []
    },
    {
      "text": "outbound",
      "intent": "roamersStatsNoMetric",
      "entities": [
        {
          "entity": "direction",
          "startPos": 0,
          "endPos": 0
        }
      ]
    },
    {
      "text": "inbound",
      "intent": "roamersStatsNoMetric",
      "entities": [
        {
          "entity": "direction",
          "startPos": 0,
          "endPos": 0
        }
      ]
    },
    {
      "text": "Número de roamers inbound",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "direction",
          "startPos": 3,
          "endPos": 3
        }
      ]
    },
    {
      "text": "Número de roamers outbound",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "direction",
          "startPos": 3,
          "endPos": 3
        }
      ]
    },
    {
      "text": "Outbound de roamers",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "direction",
          "startPos": 0,
          "endPos": 0
        }
      ]
    },
    {
      "text": "Inbound de roamers",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "direction",
          "startPos": 0,
          "endPos": 0
        }
      ]
    },
    {
      "text": "roamers de vodafone perú de las últimas 13 horas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 3,
          "endPos": 3
        },
        {
          "entity": "subscriber",
          "startPos": 2,
          "endPos": 2
        },
        {
          "entity": "time::quantity",
          "startPos": 7,
          "endPos": 7
        },
        {
          "entity": "time::period",
          "startPos": 8,
          "endPos": 8
        }
      ]
    },
    {
      "text": "cuantos romeros hay en orange españa",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 5,
          "endPos": 5
        },
        {
          "entity": "subscriber",
          "startPos": 4,
          "endPos": 4
        }
      ]
    },
    {
      "text": "roamers en españa",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 2,
          "endPos": 2
        },
        {
          "entity": "subscriber",
          "startPos": 2,
          "endPos": 2
        }
      ]
    },
    {
      "text": "roamers en españa inbound",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 2,
          "endPos": 2
        },
        {
          "entity": "direction",
          "startPos": 3,
          "endPos": 3
        }
      ]
    },
    {
      "text": "hola roambot, número de roamers de brasil",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 7,
          "endPos": 7
        }
      ]
    },
    {
      "text": "roamers de vodafone peru inbound en las últimas 3 horas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 3,
          "endPos": 3
        },
        {
          "entity": "subscriber",
          "startPos": 2,
          "endPos": 2
        },
        {
          "entity": "direction",
          "startPos": 4,
          "endPos": 4
        },
        {
          "entity": "time::quantity",
          "startPos": 8,
          "endPos": 8
        },
        {
          "entity": "time::period",
          "startPos": 9,
          "endPos": 9
        }
      ]
    },
    {
      "text": "roamers de o2 uk",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 3,
          "endPos": 3
        },
        {
          "entity": "subscriber",
          "startPos": 2,
          "endPos": 2
        }
      ]
    },
    {
      "text": "número de romeros desde ayer en chile inbound",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "subscriber",
          "startPos": 6,
          "endPos": 6
        },
        {
          "entity": "direction",
          "startPos": 7,
          "endPos": 7
        },
        {
          "entity": "time::period",
          "startPos": 4,
          "endPos": 4
        }
      ]
    },
    {
      "text": "roamers outbound de movistar españa",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 4,
          "endPos": 4
        },
        {
          "entity": "subscriber",
          "startPos": 3,
          "endPos": 3
        },
        {
          "entity": "direction",
          "startPos": 1,
          "endPos": 1
        }
      ]
    },
    {
      "text": "número outbound de roamers de movistar españa en las últimas 14 horas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 6,
          "endPos": 6
        },
        {
          "entity": "subscriber",
          "startPos": 5,
          "endPos": 5
        },
        {
          "entity": "direction",
          "startPos": 1,
          "endPos": 1
        },
        {
          "entity": "time::quantity",
          "startPos": 10,
          "endPos": 10
        },
        {
          "entity": "time::period",
          "startPos": 11,
          "endPos": 11
        }
      ]
    },
    {
      "text": "roamers inbound en la última semana",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "direction",
          "startPos": 1,
          "endPos": 1
        },
        {
          "entity": "time::quantity",
          "startPos": 4,
          "endPos": 4
        },
        {
          "entity": "time::period",
          "startPos": 5,
          "endPos": 5
        }
      ]
    },
    {
      "text": "roamers de uruguay",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 2,
          "endPos": 2
        }
      ]
    },
    {
      "text": "roamers inbound de chile",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 3,
          "endPos": 3
        },
        {
          "entity": "direction",
          "startPos": 1,
          "endPos": 1
        }
      ]
    },
    {
      "text": "oye roambot dime el número de roamers de chile en inbound de la última semana",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 8,
          "endPos": 8
        },
        {
          "entity": "direction",
          "startPos": 10,
          "endPos": 10
        },
        {
          "entity": "time::period",
          "startPos": 14,
          "endPos": 14
        }
      ]
    },
    {
      "text": "métrica del número de roamers inbound de suiza",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 7,
          "endPos": 7
        },
        {
          "entity": "direction",
          "startPos": 5,
          "endPos": 5
        }
      ]
    },
    {
      "text": "número outbound de romeros de portugal de las últimas dos semanas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 5,
          "endPos": 5
        },
        {
          "entity": "direction",
          "startPos": 1,
          "endPos": 1
        },
        {
          "entity": "time::quantity",
          "startPos": 9,
          "endPos": 9
        },
        {
          "entity": "time::period",
          "startPos": 10,
          "endPos": 10
        }
      ]
    },
    {
      "text": "número de roamers de china de las últimas 18 horas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 4,
          "endPos": 4
        },
        {
          "entity": "time::quantity",
          "startPos": 8,
          "endPos": 8
        },
        {
          "entity": "time::period",
          "startPos": 9,
          "endPos": 9
        }
      ]
    },
    {
      "text": "roamers en la última hora en inbound",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "direction",
          "startPos": 6,
          "endPos": 6
        },
        {
          "entity": "time::period",
          "startPos": 4,
          "endPos": 4
        }
      ]
    },
    {
      "text": "roamers outbound de chile en las últimas 3 semanas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 3,
          "endPos": 3
        },
        {
          "entity": "direction",
          "startPos": 1,
          "endPos": 1
        },
        {
          "entity": "time::quantity",
          "startPos": 7,
          "endPos": 7
        },
        {
          "entity": "time::period",
          "startPos": 8,
          "endPos": 8
        }
      ]
    },
    {
      "text": "romeros de vodafone italia",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 3,
          "endPos": 3
        },
        {
          "entity": "subscriber",
          "startPos": 2,
          "endPos": 2
        }
      ]
    },
    {
      "text": "roamers de tim italia de la última semana",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 3,
          "endPos": 3
        },
        {
          "entity": "subscriber",
          "startPos": 2,
          "endPos": 2
        },
        {
          "entity": "time::period",
          "startPos": 7,
          "endPos": 7
        }
      ]
    },
    {
      "text": "roamers italianos del último mes",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 1,
          "endPos": 1
        },
        {
          "entity": "time::period",
          "startPos": 4,
          "endPos": 4
        }
      ]
    },
    {
      "text": "roamers del último mes",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "time::period",
          "startPos": 3,
          "endPos": 3
        }
      ]
    },
    {
      "text": "roamers del último mes inbound de chile",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 6,
          "endPos": 6
        },
        {
          "entity": "direction",
          "startPos": 4,
          "endPos": 4
        },
        {
          "entity": "time::period",
          "startPos": 3,
          "endPos": 3
        }
      ]
    },
    {
      "text": "roamers del último mes",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "time::period",
          "startPos": 3,
          "endPos": 3
        }
      ]
    },
    {
      "text": "roamers en las últimas 23 horas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "time::quantity",
          "startPos": 4,
          "endPos": 4
        },
        {
          "entity": "time::period",
          "startPos": 5,
          "endPos": 5
        }
      ]
    },
    {
      "text": "roamers de la última semana",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "time::period",
          "startPos": 4,
          "endPos": 4
        }
      ]
    },
    {
      "text": "roamers de la última hora",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "time::period",
          "startPos": 4,
          "endPos": 4
        }
      ]
    },
    {
      "text": "romeros del último mes",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "time::period",
          "startPos": 3,
          "endPos": 3
        }
      ]
    },
    {
      "text": "número de roamers del último mes",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "time::period",
          "startPos": 5,
          "endPos": 5
        }
      ]
    },
    {
      "text": "roamers del ultimo mes",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "time::period",
          "startPos": 3,
          "endPos": 3
        }
      ]
    },
    {
      "text": "roamers en el último año",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "time::period",
          "startPos": 4,
          "endPos": 4
        }
      ]
    },
    {
      "text": "roamers de las últimas 7 semanas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "time::quantity",
          "startPos": 4,
          "endPos": 4
        },
        {
          "entity": "time::period",
          "startPos": 5,
          "endPos": 5
        }
      ]
    },
    {
      "text": "roamers de italia de las últimas 3 semanas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 2,
          "endPos": 2
        },
        {
          "entity": "time::quantity",
          "startPos": 6,
          "endPos": 6
        },
        {
          "entity": "time::period",
          "startPos": 7,
          "endPos": 7
        }
      ]
    },
    {
      "text": "roamers de las últimas 15 horas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "time::quantity",
          "startPos": 4,
          "endPos": 4
        },
        {
          "entity": "time::period",
          "startPos": 5,
          "endPos": 5
        }
      ]
    },
    {
      "text": "roamers de méxico de las últimas 4 horas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 2,
          "endPos": 2
        },
        {
          "entity": "time::quantity",
          "startPos": 6,
          "endPos": 6
        },
        {
          "entity": "time::period",
          "startPos": 7,
          "endPos": 7
        }
      ]
    },
    {
      "text": "outbound en las últimas 15 horas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "direction",
          "startPos": 0,
          "endPos": 0
        },
        {
          "entity": "time::quantity",
          "startPos": 4,
          "endPos": 4
        },
        {
          "entity": "time::period",
          "startPos": 5,
          "endPos": 5
        }
      ]
    },
    {
      "text": "roamers inbound en la ultima semana",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "direction",
          "startPos": 1,
          "endPos": 1
        },
        {
          "entity": "time::period",
          "startPos": 5,
          "endPos": 5
        }
      ]
    },
    {
      "text": "roamres en las últimas 3 horas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "time::quantity",
          "startPos": 4,
          "endPos": 4
        },
        {
          "entity": "time::period",
          "startPos": 5,
          "endPos": 5
        }
      ]
    },
    {
      "text": "roamers inbound en las últimas 2 semanas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "direction",
          "startPos": 1,
          "endPos": 1
        },
        {
          "entity": "time::quantity",
          "startPos": 5,
          "endPos": 5
        },
        {
          "entity": "time::period",
          "startPos": 6,
          "endPos": 6
        }
      ]
    },
    {
      "text": "roamers inbound en la ultimas 2 semnas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "direction",
          "startPos": 1,
          "endPos": 1
        },
        {
          "entity": "time::quantity",
          "startPos": 5,
          "endPos": 5
        },
        {
          "entity": "time::period",
          "startPos": 6,
          "endPos": 6
        }
      ]
    },
    {
      "text": "roamers de movistar españa en las últimas 50 horas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
          "startPos": 3,
          "endPos": 3
        },
        {
          "entity": "subscriber",
          "startPos": 2,
          "endPos": 2
        },
        {
          "entity": "time::quantity",
          "startPos": 7,
          "endPos": 7
        },
        {
          "entity": "time::period",
          "startPos": 8,
          "endPos": 8
        }
      ]
    },
    {
      "text": "roamers en las últimas 48 horas",
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "time::quantity",
          "startPos": 4,
          "endPos": 4
        },
        {
          "entity": "time::period",
          "startPos": 5,
          "endPos": 5
        }
      ]
    },
    {
      "text": "cuál es la tasa de éxito de chile",
      "intent": "successRate",
      "entities": [
        {
          "entity": "country",
          "startPos": 7,
          "endPos": 7
        }
      ]
    },
    {
      "text": "cuál es la tasa de exito de chile en el ultimo mes",
      "intent": "successRate",
      "entities": [
        {
          "entity": "country",
          "startPos": 7,
          "endPos": 7
        },
        {
          "entity": "time::period",
          "startPos": 11,
          "endPos": 11
        }
      ]
    }
  ]
}