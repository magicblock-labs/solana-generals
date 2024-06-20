use bolt_lang::*;
use game::Game;
use game::GameCellKind;
use game::GameCellOwner;
use game::GameError;
use game::GameStatus;

declare_id!("EdCEZKUooqVVFxXfk6yHXq5En24ZYtrQQjLPr9x33M4k");

#[system]
pub mod tick {

    pub fn execute(ctx: Context<Components>, _args_p: Vec<u8>) -> Result<Components> {
        let game = &mut ctx.accounts.game;

        // Can only trigger commands when the game is playing
        if game.status != GameStatus::Playing {
            return Err(GameError::StatusIsNotPlaying.into());
        }

        // Check that the game tick cooldown has elapsed
        let slot = Clock::get()?.slot;
        if slot < game.growth_next_slot {
            return Err(GameError::PlayerNeedsToWait.into());
        }
        game.growth_next_slot = game.growth_next_slot + 1;

        // Loop over all cell and increment its strength if someone is occupying
        for x in 0..game.size_x {
            for y in 0..game.size_y {
                let mut cell = game.get_cell(x, y)?.clone();
                if cell.owner == GameCellOwner::Nobody {
                    continue;
                }
                if cell.kind == GameCellKind::Capital {
                    cell.strength = cell.strength.saturating_add(5);
                }
                if cell.kind == GameCellKind::City {
                    cell.strength = cell.strength.saturating_add(2);
                }
                if cell.kind == GameCellKind::Field {
                    cell.strength = cell.strength.saturating_add(1);
                }
                game.set_cell(x, y, cell)?;
            }
        }

        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub game: Game,
    }
}
