module.exports = {
config: {
    "luis_schema_version": "1.3.0",
    "name": "Roambot",
    "desc": "",
    "culture": "es-es",
    "intents": [
      {
        "name": "roamersNumber"
      }
    ],
    "entities": [
      {
        "name": "country"
      },
      {
        "name": "subscriber"
      },
      {
        "name": "direction"
      },
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
      "text": "inbound",
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
    }
  ]
}