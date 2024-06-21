/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/game.json`.
 */
export type Game = {
  "address": "DcUL2DdypF14p5TZEBcEtpGSY843LM9vkokyoDahxWhk",
  "metadata": {
    "name": "game",
    "version": "0.1.6",
    "spec": "0.1.0",
    "description": "Created with Bolt"
  },
  "instructions": [
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "data",
          "writable": true
        },
        {
          "name": "entity"
        },
        {
          "name": "authority"
        },
        {
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "update",
      "discriminator": [
        219,
        200,
        88,
        176,
        158,
        63,
        253,
        127
      ],
      "accounts": [
        {
          "name": "boltComponent",
          "writable": true
        },
        {
          "name": "authority"
        },
        {
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "bytes"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "entity",
      "discriminator": [
        46,
        157,
        161,
        161,
        254,
        46,
        79,
        24
      ]
    },
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
  "errors": [
    {
      "code": 6000,
      "name": "statusIsNotGenerate",
      "msg": "The game status is not currently set to Generate."
    },
    {
      "code": 6001,
      "name": "statusIsNotLobby",
      "msg": "The game status is not currently set to Lobby."
    },
    {
      "code": 6002,
      "name": "statusIsNotPlaying",
      "msg": "The game status is not currently set to Playing."
    },
    {
      "code": 6003,
      "name": "playerAlreadyJoined",
      "msg": "A player already joined in this slot."
    },
    {
      "code": 6004,
      "name": "playerIsNotPayer",
      "msg": "The player in this slot doesn't match the payer"
    },
    {
      "code": 6005,
      "name": "playerIsNotReady",
      "msg": "The player in this slot is not ready to start"
    },
    {
      "code": 6006,
      "name": "playerNeedsToWait",
      "msg": "The player needs to wait the cooldown time before doing this action"
    },
    {
      "code": 6007,
      "name": "playerHasNotYetWon",
      "msg": "The player claiming victory has not won yet"
    },
    {
      "code": 6008,
      "name": "cellIsOutOfBounds",
      "msg": "The cell's position is out of bounds"
    },
    {
      "code": 6009,
      "name": "cellsAreNotAdjacent",
      "msg": "The cells specified are not adjacent"
    },
    {
      "code": 6010,
      "name": "cellStrengthIsInsufficient",
      "msg": "The cell's strength is insufficient"
    },
    {
      "code": 6011,
      "name": "cellIsNotOwnedByPlayer",
      "msg": "The cell is not owned by the player"
    },
    {
      "code": 6012,
      "name": "cellIsNotWalkable",
      "msg": "The cell cannot be interacted with"
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
      "name": "entity",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
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
