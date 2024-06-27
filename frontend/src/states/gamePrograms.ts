import { MagicBlockEngine } from "../engine/MagicBlockEngine";

import { Game } from "../../../backend/target/types/game";
import { Generate } from "../../../backend/target/types/generate";
import { Join } from "../../../backend/target/types/join";
import { Start } from "../../../backend/target/types/start";
import { Command } from "../../../backend/target/types/command";
import { Tick } from "../../../backend/target/types/tick";
import { Finish } from "../../../backend/target/types/finish";

import * as GameIdl from "../../../backend/target/idl/game.json";
import * as GenerateIdl from "../../../backend/target/idl/generate.json";
import * as JoinIdl from "../../../backend/target/idl/join.json";
import * as StartIdl from "../../../backend/target/idl/start.json";
import * as CommandIdl from "../../../backend/target/idl/command.json";
import * as TickIdl from "../../../backend/target/idl/tick.json";
import * as FinishIdl from "../../../backend/target/idl/tick.json";

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
