import { MagicBlockEngine } from "../engine/MagicBlockEngine";

import { Game } from "../data/types/game";
import { Generate } from "../data/types/generate";
import { Join } from "../data/types/join";
import { Start } from "../data/types/start";
import { Command } from "../data/types/command";
import { Tick } from "../data/types/tick";
import { Finish } from "../data/types/finish";

import * as GameIdl from "../data/idl/game.json";
import * as GenerateIdl from "../data/idl/generate.json";
import * as JoinIdl from "../data/idl/join.json";
import * as StartIdl from "../data/idl/start.json";
import * as CommandIdl from "../data/idl/command.json";
import * as TickIdl from "../data/idl/tick.json";
import * as FinishIdl from "../data/idl/tick.json";

export function getComponentGame(engine: MagicBlockEngine) {
  return engine.getProgram<Game>(GameIdl);
}

export function getSystemGenerate(engine: MagicBlockEngine) {
  return engine.getProgram<Generate>(GenerateIdl);
}

export function getSystemJoin(engine: MagicBlockEngine) {
  return engine.getProgram<Join>(JoinIdl);
}

export function getSystemStart(engine: MagicBlockEngine) {
  return engine.getProgram<Start>(StartIdl);
}

export function getSystemCommand(engine: MagicBlockEngine) {
  return engine.getProgram<Command>(CommandIdl);
}

export function getSystemTick(engine: MagicBlockEngine) {
  return engine.getProgram<Tick>(TickIdl);
}

export function getSystemFinish(engine: MagicBlockEngine) {
  return engine.getProgram<Finish>(FinishIdl);
}
