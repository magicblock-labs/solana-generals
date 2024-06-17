import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Position } from "../target/types/position";
import { Movement } from "../target/types/movement";
import {
    InitializeNewWorld,
    AddEntity,
    InitializeComponent,
    ApplySystem,
    FindComponentPda,
} from "@magicblock-labs/bolt-sdk"
import {expect} from "chai";

describe("Backend", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Constants used to test the program.
  let worldPda: PublicKey;
  let entityPda: PublicKey;

  const positionComponent = anchor.workspace.Position as Program<Position>;
  const systemMovement = anchor.workspace.Movement as Program<Movement>;

  it("InitializeNewWorld", async () => {
    const initNewWorld = await InitializeNewWorld({
      payer: provider.wallet.publicKey,
      connection: provider.connection,
    });
    const txSign = await provider.sendAndConfirm(initNewWorld.transaction);
    worldPda = initNewWorld.worldPda;
    console.log(`Initialized a new world (ID=${worldPda}). Initialization signature: ${txSign}`);
  });

  it("Add an entity", async () => {
      const addEntity = await AddEntity({
        payer: provider.wallet.publicKey,
        world: worldPda,
        connection: provider.connection,
      });
      const txSign = await provider.sendAndConfirm(addEntity.transaction);
      entityPda = addEntity.entityPda;
      console.log(`Initialized a new Entity (ID=${addEntity.entityId}). Initialization signature: ${txSign}`);
  });

  it("Add a component", async () => {
      const initComponent = await InitializeComponent({
          payer: provider.wallet.publicKey,
          entity: entityPda,
          componentId: positionComponent.programId,
      });
      const txSign = await provider.sendAndConfirm(initComponent.transaction);
      console.log(`Initialized the grid component. Initialization signature: ${txSign}`);
  });

  it("Apply a system", async () => {
      const positionComponentPda = FindComponentPda(positionComponent.programId, entityPda);
      // Check that the component has been initialized and x is 0
      let positionData = await positionComponent.account.position.fetch(
          positionComponentPda
      );

      const applySystem = await ApplySystem({
        authority: provider.wallet.publicKey,
        system: systemMovement.programId,
        entity: entityPda,
        components: [positionComponent.programId],
      });
      const txSign = await provider.sendAndConfirm(applySystem.transaction);
      console.log(`Applied a system. Signature: ${txSign}`);

      // Check that the system has been applied and x is > 0
      positionData = await positionComponent.account.position.fetch(
          positionComponentPda
      );
      expect(positionData.x.toNumber()).to.gt(0);
  });

});
