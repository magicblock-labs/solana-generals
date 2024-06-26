use bolt_lang::*;
use game::Game;
use game::GameCellKind;
use game::GameCellOwner;
use game::GameError;
use game::GameStatus;

declare_id!("EqGdRy5kD3kLhiY1NrNgpv144Z5GcL2FVSQsXDwjPD1o");

#[system]
pub mod command {

    pub fn execute(ctx: Context<Components>, args: Args) -> Result<Components> {
        let game = &mut ctx.accounts.game;

        // Can only trigger commands when the game is playing
        if game.status != GameStatus::Playing {
            return Err(GameError::StatusIsNotPlaying.into());
        }

        let payer = ctx.accounts.authority.key();
        let player = &mut game.players[usize::from(args.player_index)];

        // Check that the user has authority to play
        if player.authority != payer {
            return Err(GameError::PlayerIsNotPayer.into());
        }

        // Check that the player command cooldown has elapsed
        let slot = Clock::get()?.slot;
        if slot < player.action_next_slot {
            return Err(GameError::PlayerNeedsToWait.into());
        }
        player.action_next_slot = player.action_next_slot + 1; // TODO(vbrunet) - maybe need to remove this constraint ?

        // Read the cells involved in the transaction
        let source_cell_before = game.get_cell(args.source_x, args.source_y)?;
        let target_cell_before = game.get_cell(args.target_x, args.target_y)?;

        // Make sure those cells are exactly adjacent on the grid
        let distance_x = (i32::from(args.source_x) - i32::from(args.target_x)).abs();
        let distance_y = (i32::from(args.source_y) - i32::from(args.target_y)).abs();
        if distance_x + distance_y != 1 {
            return Err(GameError::CellsAreNotAdjacent.into());
        }

        // Make sure the player owns the source cell
        if source_cell_before.owner != GameCellOwner::Player(args.player_index) {
            return Err(GameError::CellIsNotOwnedByPlayer.into());
        }

        // Make sure the source cell has enough moveable strength (each cell has minimum 1)
        if source_cell_before.strength <= args.strength {
            return Err(GameError::CellStrengthIsInsufficient.into());
        }

        // Make sure the target cell can be interacted with
        if target_cell_before.kind == GameCellKind::Montain {
            return Err(GameError::CellIsNotWalkable.into());
        }

        let mut source_cell_after = source_cell_before.clone();
        let mut target_cell_after = target_cell_before.clone();

        // Transfer strength if target cell is owned by same player
        if target_cell_before.owner == GameCellOwner::Player(args.player_index) {
            target_cell_after.strength = target_cell_before.strength.saturating_add(args.strength);
            source_cell_after.strength = source_cell_before.strength
                - (target_cell_after.strength - target_cell_before.strength);
        }
        // If the target cell is not the same player, invade it
        else {
            source_cell_after.strength = source_cell_before.strength - args.strength;
            // If the target cell resists the attack
            if args.strength < target_cell_before.strength {
                target_cell_after.strength = target_cell_before.strength - args.strength;
            }
            // If the target cell dies with the attack
            else if args.strength == target_cell_before.strength {
                target_cell_after.owner = GameCellOwner::Nobody;
                target_cell_after.strength = 0;
            }
            // If the target cell gets conquered
            else {
                target_cell_after.owner = source_cell_after.owner.clone();
                target_cell_after.strength = args.strength - target_cell_before.strength;
            }
        }

        // Apply changes on the impacted cells
        game.set_cell(args.source_x, args.source_y, source_cell_after)?;
        game.set_cell(args.target_x, args.target_y, target_cell_after)?;

        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub game: Game,
    }

    #[arguments]
    struct Args {
        player_index: u8,

        source_x: u8,
        source_y: u8,

        target_x: u8,
        target_y: u8,

        strength: u8,
    }
}
