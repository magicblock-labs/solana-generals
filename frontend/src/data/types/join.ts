/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/join.json`.
 */
export type Join = {
  "address": "FB4VQ795oSLE4q7D1RdyofkyA9LZNL4sLdoK4Py7VocG",
  "metadata": {
    "name": "join",
    "version": "0.1.6",
    "spec": "0.1.0",
    "description": "Created with Bolt"
  },
  "instructions": [
    {
      "name": "execute",
      "discriminator": [
        130,
        221,
        242,
        154,
        13,
        193,
        189,
        29
      ],
      "accounts": [
        {
          "name": "game"
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "args",
          "type": "bytes"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "discriminator": [
        27,
        90,
        166,
        125,
        74,
        100,
        121,
        18
      ]
    }
  ],
  "types": [
    {
      "name": "boltMetadata",
      "docs": [
        "Metadata for the component."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "gameStatus"
              }
            }
          },
          {
            "name": "sizeX",
            "type": "u8"
          },
          {
            "name": "sizeY",
            "type": "u8"
          },
          {
            "name": "players",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "gamePlayer"
                  }
                },
                2
              ]
            }
          },
          {
            "name": "cells",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "gameCell"
                  }
                },
                128
              ]
            }
          },
          {
            "name": "growthNextSlot",
            "type": "u64"
          },
          {
            "name": "boltMetadata",
            "type": {
              "defined": {
                "name": "boltMetadata"
              }
            }
          }
        ]
      }
    },
    {
      "name": "gameCell",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "kind",
            "type": {
              "defined": {
                "name": "gameCellKind"
              }
            }
          },
          {
            "name": "owner",
            "type": {
              "defined": {
                "name": "gameCellOwner"
              }
            }
          },
          {
            "name": "strength",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "gameCellKind",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "field"
          },
          {
            "name": "city"
          },
          {
            "name": "capital"
          },
          {
            "name": "montain"
          }
        ]
      }
    },
    {
      "name": "gameCellOwner",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "player",
            "fields": [
              "u8"
            ]
          },
          {
            "name": "nobody"
          }
        ]
      }
    },
    {
      "name": "gamePlayer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ready",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "actionNextSlot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "gameStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "generate"
          },
          {
            "name": "lobby"
          },
          {
            "name": "playing"
          },
          {
            "name": "finished"
          }
        ]
      }
    }
  ]
};
